import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { fetchMonthlyTryOnCount } from "@/lib/dressapp-monthly-usage"
import { fetchOnDemandWalletStatus } from "@/lib/dressapp-on-demand-wallet"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { getPlanMonthlyTryOnAllowance } from "@/lib/plan-try-on-allowance"
import { normalizePlanSlug } from "@/lib/plan-slugs"
import { validateBudgetCents } from "@/lib/on-demand-tryons"
import { createPayPalOrderForAmount } from "@/lib/paypal"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

export async function POST(request: Request) {
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

  const amountCents =
    typeof body === "object" &&
    body !== null &&
    "amountCents" in body &&
    typeof (body as { amountCents?: unknown }).amountCents === "number"
      ? (body as { amountCents: number }).amountCents
      : NaN

  const budgetErr = validateBudgetCents(amountCents)
  if (budgetErr) {
    return NextResponse.json({ ok: false, error: budgetErr }, { status: 400 })
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
    if (monthlyAllowance != null && usage.count < monthlyAllowance) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Prepaid top-ups unlock after you use all included try-ons for this billing month.",
        },
        { status: 403 },
      )
    }

    const walletResult = await fetchOnDemandWalletStatus({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })
    if (!walletResult.ok) {
      return NextResponse.json(
        { ok: false, error: walletResult.error },
        { status: walletResult.status >= 400 && walletResult.status < 600 ? walletResult.status : 502 },
      )
    }
    if (!walletResult.wallet.cap_reached) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Prepaid top-ups unlock after you use all included try-ons for this billing month.",
        },
        { status: 403 },
      )
    }

    const order = await createPayPalOrderForAmount({
      amountCents,
      customId: `user:${session.user.id}`,
      description: "DressApp on-demand try-on wallet top-up",
    })

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      amountCents,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[billing/on-demand-tryons/create-order] failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
