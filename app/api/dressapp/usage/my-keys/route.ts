import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { fetchMerchantUsage, fetchMonthlyTryOnCount } from "@/lib/dressapp-monthly-usage"
import {
  getPlanLabel,
  getPlanMonthlyTryOnAllowance,
} from "@/lib/plan-try-on-allowance"
import { normalizePlanSlug, type PlanSlug } from "@/lib/plan-slugs"
import {
  isUserOnSignupTrial,
  SIGNUP_TRIAL_TRYON_ALLOWANCE,
} from "@/lib/signup-trial"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in to view your keys." }, { status: 401 })
  }

  try {
    const planRaw = await getUserSelectedPlan(session.user.id)
    const planSlug: PlanSlug | null = planRaw ? normalizePlanSlug(planRaw) : null
    const onSignupTrial = !planSlug && (await isUserOnSignupTrial(session.user.id))
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
        signupTrial: onSignupTrial
          ? { allowance: SIGNUP_TRIAL_TRYON_ALLOWANCE, used: null, remaining: null }
          : null,
        keys: null,
        quota: null,
        message: "No merchant keys are saved for your account yet.",
      })
    }

    if (onSignupTrial) {
      const usage = await fetchMerchantUsage({
        secretKey: credentials.secretKey,
        dashboardPassword: credentials.merchantDashboardPassword,
      })
      const used = usage.ok ? usage.usage.try_on_count : null
      const remaining =
        used != null
          ? Math.max(0, SIGNUP_TRIAL_TRYON_ALLOWANCE - used)
          : null

      return NextResponse.json({
        ok: true,
        authenticated: true,
        hasKeys: true,
        plan: null,
        signupTrial: {
          allowance: SIGNUP_TRIAL_TRYON_ALLOWANCE,
          used,
          remaining,
          usageError: usage.ok ? null : usage.error,
        },
        keys: {
          secretKey: credentials.secretKey,
          publishableKey: credentials.publishableKey,
          googleApiKey: credentials.googleApiKey,
          merchantSlug: credentials.merchantSlug,
        },
        quota: null,
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
