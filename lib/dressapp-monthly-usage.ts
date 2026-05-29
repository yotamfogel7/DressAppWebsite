import "server-only"

function startOfUtcMonth(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
}

export type MonthlyTryOnUsage = {
  count: number
  periodFrom: string
  periodTo: string
  error: string | null
}

/** Fetches current UTC-month try_on_count for a merchant secret key. */
export async function fetchMonthlyTryOnCount(params: {
  secretKey: string
  dashboardPassword?: string | null
}): Promise<MonthlyTryOnUsage> {
  const apiBase = process.env.DRESSAPP_API_BASE_URL?.replace(/\/$/, "")
  const periodFrom = startOfUtcMonth().toISOString()
  const periodTo = new Date().toISOString()

  if (!apiBase) {
    return {
      count: 0,
      periodFrom,
      periodTo,
      error: "DRESSAPP_API_BASE_URL is not configured on the server.",
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
    let data: { try_on_count?: unknown; error?: unknown } = {}
    try {
      data = text ? (JSON.parse(text) as { try_on_count?: unknown; error?: unknown }) : {}
    } catch {
      return {
        count: 0,
        periodFrom,
        periodTo,
        error: `Usage API returned non-JSON (HTTP ${res.status}).`,
      }
    }
    if (!res.ok) {
      const err =
        typeof data.error === "string"
          ? data.error
          : `Usage request failed (HTTP ${res.status}).`
      console.error("[dressapp-monthly-usage] fetch failed", res.status, data)
      return { count: 0, periodFrom, periodTo, error: err }
    }
    const count = data.try_on_count
    if (typeof count !== "number" || !Number.isFinite(count) || count < 0) {
      return {
        count: 0,
        periodFrom,
        periodTo,
        error: "Usage API response missing a valid try_on_count.",
      }
    }
    return { count, periodFrom, periodTo, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp-monthly-usage] fetch error", e)
    return { count: 0, periodFrom, periodTo, error: msg }
  }
}
