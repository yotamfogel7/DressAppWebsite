import "server-only"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { getDressAppMerchantApiBase } from "@/lib/dressapp-api-base"
import { fetchMerchantUsage, fetchMonthlyTryOnCount } from "@/lib/dressapp-monthly-usage"
import { formatPartnerApiErrorPayload } from "@/lib/dressapp-partner-api-errors"
import { getPlanMonthlyTryOnAllowance } from "@/lib/plan-try-on-allowance"
import { normalizePlanSlug } from "@/lib/plan-slugs"
import { isUserOnSignupTrial, SIGNUP_TRIAL_TRYON_ALLOWANCE } from "@/lib/signup-trial"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

function merchantAuthHeaders(params: {
  secretKey: string
  dashboardPassword?: string | null
}): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.secretKey}`,
    Accept: "application/json",
  }
  if (params.dashboardPassword?.trim()) {
    headers["X-Merchant-Password"] = params.dashboardPassword.trim()
  }
  return headers
}

function usageWindowFromRange(spanRaw: string | null, unitRaw: string | null): {
  from?: string
  to?: string
} {
  const unit = unitRaw?.trim() || "all"
  if (unit === "all") return {}

  const span = Number.parseInt(spanRaw?.trim() ?? "1", 10)
  const safeSpan = Number.isFinite(span) ? Math.max(1, span) : 1
  const to = new Date().toISOString()
  const fromDate = new Date()

  switch (unit) {
    case "day":
      fromDate.setUTCDate(fromDate.getUTCDate() - safeSpan)
      break
    case "week":
      fromDate.setUTCDate(fromDate.getUTCDate() - safeSpan * 7)
      break
    case "month":
      fromDate.setUTCMonth(fromDate.getUTCMonth() - safeSpan)
      break
    case "year":
      fromDate.setUTCFullYear(fromDate.getUTCFullYear() - safeSpan)
      break
    default:
      return {}
  }

  return { from: fromDate.toISOString(), to }
}

async function buildLegacyUsageSummary(
  request: Request,
  userId: string,
  credentials: {
    secretKey: string
    merchantDashboardPassword?: string | null
  },
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const window = usageWindowFromRange(searchParams.get("span"), searchParams.get("unit"))

  const usageResult = await fetchMerchantUsage({
    secretKey: credentials.secretKey,
    dashboardPassword: credentials.merchantDashboardPassword,
    from: window.from ?? null,
    to: window.to ?? null,
  })
  if (!usageResult.ok) {
    return NextResponse.json({ ok: false, error: usageResult.error }, { status: usageResult.status })
  }

  const planRaw = await getUserSelectedPlan(userId)
  const planSlug = planRaw ? normalizePlanSlug(planRaw) : null
  const onSignupTrial = !planSlug && (await isUserOnSignupTrial(userId))
  const monthlyAllowance = getPlanMonthlyTryOnAllowance(planSlug)

  let tryonQuotaPerMonth: number | null = monthlyAllowance
  let tryonUsedThisMonth: number | null = null
  let tryonsRemaining: number | null = null

  if (onSignupTrial) {
    tryonQuotaPerMonth = SIGNUP_TRIAL_TRYON_ALLOWANCE
    const allTime = await fetchMerchantUsage({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })
    if (allTime.ok) {
      tryonUsedThisMonth = allTime.usage.try_on_count
      tryonsRemaining = Math.max(0, SIGNUP_TRIAL_TRYON_ALLOWANCE - allTime.usage.try_on_count)
    }
  } else {
    const monthly = await fetchMonthlyTryOnCount({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })
    if (!monthly.error) {
      tryonUsedThisMonth = monthly.count
      if (monthlyAllowance != null) {
        tryonsRemaining = Math.max(0, monthlyAllowance - monthly.count)
      }
    }
  }

  const usage = usageResult.usage
  return NextResponse.json({
    ok: true,
    legacy_fallback: true,
    try_on_count: usage.try_on_count,
    user_model_generation_count: usage.user_model_generation_count,
    users_with_model_count: usage.users_with_model_count,
    users_with_try_on_count: usage.users_with_try_on_count,
    tryon_quota_per_month: tryonQuotaPerMonth ?? 0,
    tryon_used_this_month: tryonUsedThisMonth ?? 0,
    tryons_remaining: tryonsRemaining ?? 0,
  })
}

export async function proxyDressAppMerchantUsageGet(
  request: Request,
  partnerPath: string,
  options?: { legacyFallback?: "summary" | "timeseries" | "insights" | "previews" },
): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  const credentials = await getUserMerchantCredentials(session.user.id)
  if (!credentials) {
    return NextResponse.json(
      { ok: false, error: "No merchant keys are saved for your account yet." },
      { status: 400 },
    )
  }

  const { searchParams } = new URL(request.url)
  const qs = searchParams.toString()
  const apiBase = getDressAppMerchantApiBase()
  const url = qs ? `${apiBase}${partnerPath}?${qs}` : `${apiBase}${partnerPath}`

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: merchantAuthHeaders(credentials),
      cache: "no-store",
    })
    const text = await res.text()
    let data: Record<string, unknown> = {}
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
    } catch {
      return NextResponse.json(
        { ok: false, error: `Usage API returned non-JSON (HTTP ${res.status}).` },
        { status: res.status || 502 },
      )
    }
    if (!res.ok) {
      if (res.status === 404 && options?.legacyFallback) {
        console.warn(
          "[dressapp-usage-proxy] endpoint not found; using legacy fallback",
          partnerPath,
          options.legacyFallback,
        )
        if (options.legacyFallback === "summary") {
          return buildLegacyUsageSummary(request, session.user.id, credentials)
        }
        if (options.legacyFallback === "timeseries") {
          return NextResponse.json({ ok: true, legacy_fallback: true, buckets: [] })
        }
        if (options.legacyFallback === "previews") {
          return NextResponse.json({ ok: true, legacy_fallback: true, image_urls: [] })
        }
        return NextResponse.json({
          ok: true,
          legacy_fallback: true,
          top_products: [],
          tryon_to_purchase: { order_tracking_enabled: false },
        })
      }
      const err = formatPartnerApiErrorPayload(data, res.status)
      console.error("[dressapp-usage-proxy] fetch failed", partnerPath, res.status, data)
      return NextResponse.json({ ok: false, error: err }, { status: res.status })
    }
    return NextResponse.json({ ok: true, ...data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp-usage-proxy] network error", partnerPath, e)
    return NextResponse.json({ ok: false, error: msg }, { status: 502 })
  }
}
