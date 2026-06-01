import "server-only"
import { getDressAppMerchantApiBase } from "@/lib/dressapp-api-base"
import { formatPartnerApiErrorPayload } from "@/lib/dressapp-partner-api-errors"

const WALLET_PATH = "/partner/v1/merchants/me/on-demand-tryons"

export type OnDemandWalletStatus = {
  enabled: boolean
  cap_reached: boolean
  plan_monthly_allowance: number | null
  used_this_month: number
  remaining_plan_tryons: number | null
  monthly_budget_cents: number
  balance_cents: number
  spent_this_period_cents: number
  period_start: string | null
  period_end: string | null
  unit_cost_cents: number | null
  merchant_id: string | null
}

export type OnDemandWalletPatch = {
  enabled?: boolean
  monthly_budget_cents?: number
}

function getApiBase(): string {
  return getDressAppMerchantApiBase()
}

function merchantHeaders(params: {
  secretKey: string
  dashboardPassword?: string | null
}): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.secretKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  }
  if (params.dashboardPassword?.trim()) {
    headers["X-Merchant-Password"] = params.dashboardPassword.trim()
  }
  return headers
}

function parseWalletStatus(data: Record<string, unknown>): OnDemandWalletStatus {
  const readInt = (key: string, fallback = 0): number => {
    const v = data[key]
    return typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : fallback
  }
  const readBool = (key: string, fallback = false): boolean => {
    const v = data[key]
    return typeof v === "boolean" ? v : fallback
  }
  const readNullableInt = (key: string): number | null => {
    const v = data[key]
    if (v === null) return null
    return typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : null
  }
  const readStr = (key: string): string | null => {
    const v = data[key]
    return typeof v === "string" && v.trim() ? v.trim() : null
  }

  return {
    enabled: readBool("enabled", false),
    cap_reached: readBool("cap_reached", false),
    plan_monthly_allowance: readNullableInt("plan_monthly_allowance"),
    used_this_month: readInt("used_this_month"),
    remaining_plan_tryons: readNullableInt("remaining_plan_tryons"),
    monthly_budget_cents: readInt("monthly_budget_cents"),
    balance_cents: readInt("balance_cents"),
    spent_this_period_cents: readInt("spent_this_period_cents"),
    period_start: readStr("period_start"),
    period_end: readStr("period_end"),
    unit_cost_cents: readNullableInt("unit_cost_cents"),
    merchant_id: readStr("merchant_id"),
  }
}

export async function fetchOnDemandWalletStatus(params: {
  secretKey: string
  dashboardPassword?: string | null
}): Promise<{ ok: true; wallet: OnDemandWalletStatus } | { ok: false; error: string; status: number }> {
  const apiBase = getApiBase()

  try {
    const res = await fetch(`${apiBase}${WALLET_PATH}`, {
      method: "GET",
      headers: merchantHeaders(params),
      cache: "no-store",
    })
    const text = await res.text()
    let data: Record<string, unknown> = {}
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
    } catch {
      return {
        ok: false,
        error: `On-demand wallet API returned non-JSON (HTTP ${res.status}).`,
        status: res.status || 502,
      }
    }
    if (!res.ok) {
      const err = formatPartnerApiErrorPayload(data, res.status)
      console.error("[dressapp-on-demand-wallet] GET failed", res.status, data)
      return { ok: false, error: err, status: res.status }
    }
    return { ok: true, wallet: parseWalletStatus(data) }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp-on-demand-wallet] GET error", e)
    return { ok: false, error: msg, status: 502 }
  }
}

export async function patchOnDemandWallet(params: {
  secretKey: string
  dashboardPassword?: string | null
  patch: OnDemandWalletPatch
}): Promise<{ ok: true; wallet: OnDemandWalletStatus } | { ok: false; error: string; status: number }> {
  const apiBase = getApiBase()

  try {
    const res = await fetch(`${apiBase}${WALLET_PATH}`, {
      method: "PATCH",
      headers: merchantHeaders(params),
      body: JSON.stringify(params.patch),
      cache: "no-store",
    })
    const text = await res.text()
    let data: Record<string, unknown> = {}
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
    } catch {
      return {
        ok: false,
        error: `On-demand wallet API returned non-JSON (HTTP ${res.status}).`,
        status: res.status || 502,
      }
    }
    if (!res.ok) {
      const err = formatPartnerApiErrorPayload(data, res.status)
      console.error("[dressapp-on-demand-wallet] PATCH failed", res.status, data)
      return { ok: false, error: err, status: res.status }
    }
    return { ok: true, wallet: parseWalletStatus(data) }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp-on-demand-wallet] PATCH error", e)
    return { ok: false, error: msg, status: 502 }
  }
}

export async function creditOnDemandWallet(params: {
  merchantId: string
  amountCents: number
  paypalCaptureId: string
  idempotencyKey: string
}): Promise<{ ok: true; balance_cents: number } | { ok: false; error: string; status: number }> {
  const apiBase = getApiBase()
  const partnerSecret = process.env.DRESSAPP_PARTNER_ADMIN_SECRET?.trim()
  if (!partnerSecret) {
    return {
      ok: false,
      error: "DRESSAPP_PARTNER_ADMIN_SECRET is not configured on the server.",
      status: 500,
    }
  }

  const merchantId = encodeURIComponent(params.merchantId.trim())
  const url = `${apiBase}/partner/v1/admin/merchants/${merchantId}/on-demand-wallet/credits`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Partner-Admin-Secret": partnerSecret,
      },
      body: JSON.stringify({
        amount_cents: params.amountCents,
        paypal_capture_id: params.paypalCaptureId,
        idempotency_key: params.idempotencyKey,
      }),
      cache: "no-store",
    })
    const text = await res.text()
    let data: Record<string, unknown> = {}
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
    } catch {
      return {
        ok: false,
        error: `Wallet credit API returned non-JSON (HTTP ${res.status}).`,
        status: res.status || 502,
      }
    }
    if (!res.ok) {
      const err =
        typeof data.error === "string"
          ? data.error
          : `Could not credit wallet (HTTP ${res.status}).`
      console.error("[dressapp-on-demand-wallet] credit failed", res.status, data)
      return { ok: false, error: err, status: res.status }
    }
    const balance =
      typeof data.balance_cents === "number" && Number.isFinite(data.balance_cents)
        ? Math.max(0, Math.floor(data.balance_cents))
        : 0
    return { ok: true, balance_cents: balance }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp-on-demand-wallet] credit error", e)
    return { ok: false, error: msg, status: 502 }
  }
}
