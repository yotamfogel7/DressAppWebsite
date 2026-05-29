import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { fetchMonthlyTryOnCount } from "@/lib/dressapp-monthly-usage"
import {
  getPlanLabel,
  getPlanMonthlyTryOnAllowance,
} from "@/lib/plan-try-on-allowance"
import { normalizePlanSlug, type PlanSlug } from "@/lib/plan-slugs"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in to view your keys." }, { status: 401 })
  }

  try {
    const planRaw = await getUserSelectedPlan(session.user.id)
    const planSlug: PlanSlug | null = planRaw ? normalizePlanSlug(planRaw) : null
    const monthlyAllowance = getPlanMonthlyTryOnAllowance(planSlug)

    const credentials = await getUserMerchantCredentials(session.user.id)

    if (!credentials) {
      return NextResponse.json({
        ok: true,
        authenticated: true,
        hasKeys: false,
        plan: planSlug
          ? {
              slug: planSlug,
              label: getPlanLabel(planSlug),
              monthlyAllowance,
            }
          : null,
        keys: null,
        quota: null,
        message: "No merchant keys are saved for your account yet.",
      })
    }

    const usage = await fetchMonthlyTryOnCount({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })

    const usedThisMonth = usage.error ? null : usage.count
    const remaining =
      monthlyAllowance != null && usedThisMonth != null
        ? Math.max(0, monthlyAllowance - usedThisMonth)
        : null

    return NextResponse.json({
      ok: true,
      authenticated: true,
      hasKeys: true,
      plan: planSlug
        ? {
            slug: planSlug,
            label: getPlanLabel(planSlug),
            monthlyAllowance,
          }
        : null,
      keys: {
        secretKey: credentials.secretKey,
        publishableKey: credentials.publishableKey,
        googleApiKey: credentials.googleApiKey,
        merchantSlug: credentials.merchantSlug,
      },
      quota: {
        usedThisMonth,
        remaining,
        periodFrom: usage.periodFrom,
        periodTo: usage.periodTo,
        usageError: usage.error,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[my-keys] unhandled", e)
    return NextResponse.json({ ok: false, error: msg || "Could not load your keys." }, { status: 500 })
  }
}
