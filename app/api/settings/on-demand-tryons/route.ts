import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { fetchMonthlyTryOnCount } from "@/lib/dressapp-monthly-usage"
import {
  fetchOnDemandWalletStatus,
  patchOnDemandWallet,
} from "@/lib/dressapp-on-demand-wallet"
import {
  estimateOnDemandTryOnRange,
  validateBudgetCents,
} from "@/lib/on-demand-tryons"
import {
  getPlanLabel,
  getPlanMonthlyTryOnAllowance,
} from "@/lib/plan-try-on-allowance"
import { normalizePlanSlug, type PlanSlug } from "@/lib/plan-slugs"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

function capReachedLocally(
  allowance: number | null,
  used: number,
): boolean {
  if (allowance == null) return false
  return used >= allowance
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  try {
    const planRaw = await getUserSelectedPlan(session.user.id)
    const planSlug: PlanSlug | null = planRaw ? normalizePlanSlug(planRaw) : null
    const monthlyAllowance = getPlanMonthlyTryOnAllowance(planSlug)

    const credentials = await getUserMerchantCredentials(session.user.id)
    if (!credentials) {
      return NextResponse.json({
        ok: false,
        error: "No merchant keys are saved for your account yet.",
        hasKeys: false,
        plan: planSlug
          ? { slug: planSlug, label: getPlanLabel(planSlug), monthlyAllowance }
          : null,
      }, { status: 400 })
    }

    const usage = await fetchMonthlyTryOnCount({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })

    const walletResult = await fetchOnDemandWalletStatus({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })

    const usedThisMonth = usage.error != null ? null : usage.count
    const capReached =
      usedThisMonth != null && capReachedLocally(monthlyAllowance, usedThisMonth)

    if (!walletResult.ok) {
      return NextResponse.json({
        ok: true,
        error: walletResult.error,
        walletAvailable: false,
        hasKeys: true,
        plan: planSlug
          ? { slug: planSlug, label: getPlanLabel(planSlug), monthlyAllowance }
          : null,
        usage: {
          usedThisMonth,
          periodFrom: usage.periodFrom,
          periodTo: usage.periodTo,
          usageError: usage.error,
        },
        capReached,
        canConfigure: capReached,
      })
    }

    const wallet = walletResult.wallet
    const budgetCents = wallet.monthly_budget_cents
    const estimate =
      budgetCents > 0 ? estimateOnDemandTryOnRange(budgetCents) : { minTryOns: 0, maxTryOns: 0 }

    return NextResponse.json({
      ok: true,
      walletAvailable: true,
      hasKeys: true,
      plan: planSlug
        ? { slug: planSlug, label: getPlanLabel(planSlug), monthlyAllowance }
        : null,
      usage: {
        usedThisMonth: wallet.used_this_month ?? usedThisMonth,
        periodFrom: usage.periodFrom,
        periodTo: usage.periodTo,
        usageError: usage.error,
      },
      capReached: wallet.cap_reached ?? capReached,
      canConfigure: wallet.cap_reached ?? capReached,
      wallet: {
        enabled: wallet.enabled,
        monthlyBudgetCents: wallet.monthly_budget_cents,
        balanceCents: wallet.balance_cents,
        spentThisPeriodCents: wallet.spent_this_period_cents,
        periodStart: wallet.period_start,
        periodEnd: wallet.period_end,
        unitCostCents: wallet.unit_cost_cents,
        merchantId: wallet.merchant_id,
        remainingBudgetCents: Math.max(
          0,
          wallet.monthly_budget_cents - wallet.spent_this_period_cents,
        ),
        remainingBalanceCents: wallet.balance_cents,
      },
      estimate,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[settings/on-demand-tryons] GET failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 })
  }

  const raw =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}

  const patch: { enabled?: boolean; monthly_budget_cents?: number } = {}

  if ("enabled" in raw) {
    if (typeof raw.enabled !== "boolean") {
      return NextResponse.json({ ok: false, error: "enabled must be a boolean." }, { status: 400 })
    }
    patch.enabled = raw.enabled
  }

  if ("monthlyBudgetCents" in raw) {
    const cents = raw.monthlyBudgetCents
    if (typeof cents !== "number" || !Number.isInteger(cents)) {
      return NextResponse.json(
        { ok: false, error: "monthlyBudgetCents must be an integer (USD cents)." },
        { status: 400 },
      )
    }
    const budgetErr = validateBudgetCents(cents)
    if (budgetErr) {
      return NextResponse.json({ ok: false, error: budgetErr }, { status: 400 })
    }
    patch.monthly_budget_cents = cents
  }

  if (!("enabled" in patch) && !("monthly_budget_cents" in patch)) {
    return NextResponse.json(
      { ok: false, error: "Provide enabled and/or monthlyBudgetCents." },
      { status: 400 },
    )
  }

  try {
    const credentials = await getUserMerchantCredentials(session.user.id)
    if (!credentials) {
      return NextResponse.json(
        { ok: false, error: "No merchant keys are saved for your account yet." },
        { status: 400 },
      )
    }

    const planRaw = await getUserSelectedPlan(session.user.id)
    const planSlug = planRaw ? normalizePlanSlug(planRaw) : null
    const monthlyAllowance = getPlanMonthlyTryOnAllowance(planSlug)
    const usage = await fetchMonthlyTryOnCount({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })
    if (usage.error) {
      return NextResponse.json(
        { ok: false, error: `Cannot verify plan usage: ${usage.error}` },
        { status: 502 },
      )
    }
    if (!capReachedLocally(monthlyAllowance, usage.count)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "On-demand try-ons unlock after you use all included try-ons for this billing month.",
        },
        { status: 403 },
      )
    }

    const result = await patchOnDemandWallet({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
      patch,
    })

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status >= 400 && result.status < 600 ? result.status : 502 },
      )
    }

    const wallet = result.wallet
    const estimate =
      wallet.monthly_budget_cents > 0
        ? estimateOnDemandTryOnRange(wallet.monthly_budget_cents)
        : { minTryOns: 0, maxTryOns: 0 }

    return NextResponse.json({
      ok: true,
      wallet: {
        enabled: wallet.enabled,
        monthlyBudgetCents: wallet.monthly_budget_cents,
        balanceCents: wallet.balance_cents,
        spentThisPeriodCents: wallet.spent_this_period_cents,
        periodStart: wallet.period_start,
        periodEnd: wallet.period_end,
        unitCostCents: wallet.unit_cost_cents,
        merchantId: wallet.merchant_id,
        remainingBudgetCents: Math.max(
          0,
          wallet.monthly_budget_cents - wallet.spent_this_period_cents,
        ),
        remainingBalanceCents: wallet.balance_cents,
      },
      estimate,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[settings/on-demand-tryons] PATCH failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
