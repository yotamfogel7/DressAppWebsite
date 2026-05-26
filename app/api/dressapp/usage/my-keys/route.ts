import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserSelectedPlan } from "@/lib/auth-db"
import {
  getPlanLabel,
  getPlanMonthlyTryOnAllowance,
} from "@/lib/plan-try-on-allowance"
import { normalizePlanSlug, type PlanSlug } from "@/lib/plan-slugs"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

type UsageJson = {
  try_on_count?: unknown
  period_from?: unknown
  period_to?: unknown
}

function startOfUtcMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
}

async function fetchMonthlyTryOnCount(params: {
  secretKey: string
  dashboardPassword?: string | null
}): Promise<{ count: number | null; error: string | null; periodFrom: string; periodTo: string }> {
  const apiBase = process.env.DRESSAPP_API_BASE_URL?.replace(/\/$/, "")
  const periodFrom = startOfUtcMonth().toISOString()
  const periodTo = new Date().toISOString()

  if (!apiBase) {
    return {
      count: null,
      error: "DRESSAPP_API_BASE_URL is not configured on the server.",
      periodFrom,
      periodTo,
    }
  }

  const qs = new URLSearchParams({ from: periodFrom, to: periodTo })
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.secretKey}`,
    Accept: "application/json",
  }
  if (params.dashboardPassword?.trim()) {
    headers["X-Merchant-Password"] = params.dashboardPassword.trim()
  }

  try {
    const res = await fetch(`${apiBase}/partner/v1/merchants/me/usage?${qs}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    const text = await res.text()
    let data: UsageJson = {}
    try {
      data = text ? (JSON.parse(text) as UsageJson) : {}
    } catch {
      return {
        count: null,
        error: `Usage API returned non-JSON (HTTP ${res.status}).`,
        periodFrom,
        periodTo,
      }
    }
    if (!res.ok) {
      const err =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error?: unknown }).error)
          : `Usage request failed (HTTP ${res.status}).`
      console.error("[my-keys] usage fetch failed", res.status, data)
      return { count: null, error: err, periodFrom, periodTo }
    }
    const count = data.try_on_count
    if (typeof count !== "number" || !Number.isFinite(count) || count < 0) {
      return {
        count: null,
        error: "Usage API response missing a valid try_on_count.",
        periodFrom,
        periodTo,
      }
    }
    return { count, error: null, periodFrom, periodTo }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[my-keys] usage fetch error", e)
    return { count: null, error: msg, periodFrom, periodTo }
  }
}

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

    const usedThisMonth = usage.count
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
