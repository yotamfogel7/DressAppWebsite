import "server-only"
import { getDressAppMerchantApiBase } from "@/lib/dressapp-api-base"
import { formatPartnerApiErrorPayload } from "@/lib/dressapp-partner-api-errors"

const USAGE_PATH = "/partner/v1/merchants/me/usage"

function startOfUtcMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
}

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

function readNonNegativeInt(val: unknown, field: string): number | null {
  if (typeof val !== "number" || !Number.isFinite(val) || val < 0 || !Number.isInteger(val)) {
    return null
  }
  return val
}

export type MerchantUsagePayload = {
  try_on_count: number
  user_model_generation_count: number
  users_with_model_count: number
  users_with_try_on_count: number
  merchant_id?: string
  period_from?: string
  period_to?: string
}

export type MonthlyTryOnUsage = {
  count: number
  periodFrom: string
  periodTo: string
  error: string | null
}

function parseMerchantUsagePayload(data: Record<string, unknown>): MerchantUsagePayload | null {
  const tryOnCount = readNonNegativeInt(data.try_on_count, "try_on_count")
  const modelCount = readNonNegativeInt(data.user_model_generation_count, "user_model_generation_count")
  const usersWithModel = readNonNegativeInt(data.users_with_model_count, "users_with_model_count")
  const usersWithTryOn = readNonNegativeInt(data.users_with_try_on_count, "users_with_try_on_count")
  if (
    tryOnCount == null ||
    modelCount == null ||
    usersWithModel == null ||
    usersWithTryOn == null
  ) {
    return null
  }
  return {
    try_on_count: tryOnCount,
    user_model_generation_count: modelCount,
    users_with_model_count: usersWithModel,
    users_with_try_on_count: usersWithTryOn,
    merchant_id: typeof data.merchant_id === "string" ? data.merchant_id : undefined,
    period_from: typeof data.period_from === "string" ? data.period_from : undefined,
    period_to: typeof data.period_to === "string" ? data.period_to : undefined,
  }
}

/** Fetches partner usage for a merchant secret key (optional UTC window). */
export async function fetchMerchantUsage(params: {
  secretKey: string
  dashboardPassword?: string | null
  from?: string | null
  to?: string | null
}): Promise<
  { ok: true; usage: MerchantUsagePayload } | { ok: false; error: string; status: number }
> {
  const apiBase = getDressAppMerchantApiBase()
  const qs = new URLSearchParams()
  if (params.from?.trim()) qs.set("from", params.from.trim())
  if (params.to?.trim()) qs.set("to", params.to.trim())
  const query = qs.toString()
  const url = query ? `${apiBase}${USAGE_PATH}?${query}` : `${apiBase}${USAGE_PATH}`

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: merchantAuthHeaders(params),
      cache: "no-store",
    })
    const text = await res.text()
    let data: Record<string, unknown> = {}
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
    } catch {
      return {
        ok: false,
        error: `Usage API returned non-JSON (HTTP ${res.status}).`,
        status: res.status || 502,
      }
    }
    if (!res.ok) {
      const err = formatPartnerApiErrorPayload(data, res.status)
      console.error("[dressapp-merchant-usage] fetch failed", res.status, data)
      return { ok: false, error: err, status: res.status }
    }
    const usage = parseMerchantUsagePayload(data)
    if (!usage) {
      return {
        ok: false,
        error: "Usage API response missing required usage fields.",
        status: 502,
      }
    }
    return { ok: true, usage }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp-merchant-usage] fetch error", e)
    return { ok: false, error: msg, status: 502 }
  }
}

/** Fetches current UTC-month try_on_count for a merchant secret key. */
export async function fetchMonthlyTryOnCount(params: {
  secretKey: string
  dashboardPassword?: string | null
}): Promise<MonthlyTryOnUsage> {
  const periodFrom = startOfUtcMonth().toISOString()
  const periodTo = new Date().toISOString()

  const result = await fetchMerchantUsage({
    ...params,
    from: periodFrom,
    to: periodTo,
  })
  if (!result.ok) {
    return { count: 0, periodFrom, periodTo, error: result.error }
  }
  return {
    count: result.usage.try_on_count,
    periodFrom,
    periodTo,
    error: null,
  }
}
