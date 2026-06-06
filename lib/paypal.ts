/**
 * PayPal Subscriptions (server only).
 *
 * Env:
 * - PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET (required)
 * - PAYPAL_ENVIRONMENT: `sandbox` (default) or `live`
 * - PAYPAL_BRAND_NAME (optional, shown in PayPal UI)
 * - PAYPAL_PLAN_STARTER, PAYPAL_PLAN_GROWTH, PAYPAL_PLAN_PRO, PAYPAL_PLAN_ENTERPRISE,
 *   PAYPAL_PLAN_ENTERPRISE_PLUS (optional; omit Enterprise+ to force contact-sales)
 * - NEXT_PUBLIC_APP_URL (recommended in production for return/cancel URLs)
 */
import "server-only"

import { getPublicAppOrigin } from "@/lib/app-origin"
import type { PlanSlug } from "@/lib/plan-slugs"

const PAYPAL_SANDBOX = "https://api-m.sandbox.paypal.com"
const PAYPAL_LIVE = "https://api-m.paypal.com"

type PayPalLink = { href?: string; rel?: string; method?: string }

function getPayPalApiBase(): string {
  const env = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase()
  if (env === "live" || env === "production") return PAYPAL_LIVE
  return PAYPAL_SANDBOX
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    const msg = `[paypal] Missing required env: ${name}`
    console.error(msg)
    throw new Error(msg)
  }
  return v
}

export function getPayPalPlanIdForSlug(slug: PlanSlug): string | null {
  const key: Record<PlanSlug, string> = {
    starter: "PAYPAL_PLAN_STARTER",
    growth: "PAYPAL_PLAN_GROWTH",
    pro: "PAYPAL_PLAN_PRO",
    enterprise: "PAYPAL_PLAN_ENTERPRISE",
    "enterprise-plus": "PAYPAL_PLAN_ENTERPRISE_PLUS",
  }
  const id = process.env[key[slug]]?.trim()
  return id || null
}

async function getAccessToken(): Promise<string> {
  const clientId = requireEnv("PAYPAL_CLIENT_ID")
  const clientSecret = requireEnv("PAYPAL_CLIENT_SECRET")
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  const text = await res.text()
  if (!res.ok) {
    console.error("[paypal] OAuth failed", res.status, text)
    throw new Error(`PayPal OAuth failed (${res.status})`)
  }
  let json: { access_token?: string }
  try {
    json = JSON.parse(text) as { access_token?: string }
  } catch {
    console.error("[paypal] OAuth invalid JSON", text)
    throw new Error("PayPal OAuth returned invalid JSON")
  }
  if (!json.access_token) {
    console.error("[paypal] OAuth missing access_token", text)
    throw new Error("PayPal OAuth response missing access_token")
  }
  return json.access_token
}

function findApprovalUrl(links: unknown): string | null {
  if (!Array.isArray(links)) return null
  for (const item of links) {
    const link = item as PayPalLink
    if (link.rel === "approve" && typeof link.href === "string") {
      return link.href
    }
  }
  return null
}

export type CreatePayPalSubscriptionResult = {
  approvalUrl: string
  subscriptionId: string
}

/**
 * Creates a PayPal subscription and returns the buyer approval URL.
 */
export async function createPayPalSubscriptionForPlan(params: {
  planId: string
  /** DressApp user id for correlation (PayPal custom_id). */
  customId: string
  returnUrl: string
  cancelUrl: string
}): Promise<CreatePayPalSubscriptionResult> {
  const token = await getAccessToken()
  const requestId = crypto.randomUUID()
  const body = {
    plan_id: params.planId,
    custom_id: params.customId,
    application_context: {
      brand_name: process.env.PAYPAL_BRAND_NAME?.trim() || "DressApp",
      locale: "en-US",
      user_action: "SUBSCRIBE_NOW",
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
    },
  }

  const res = await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "PayPal-Request-Id": requestId,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    console.error("[paypal] Create subscription failed", res.status, text)
    throw new Error(`PayPal could not start checkout (${res.status})`)
  }

  let json: { id?: string; links?: unknown }
  try {
    json = JSON.parse(text) as { id?: string; links?: unknown }
  } catch {
    console.error("[paypal] Create subscription invalid JSON", text)
    throw new Error("PayPal returned invalid JSON for subscription")
  }

  const approvalUrl = findApprovalUrl(json.links)
  const subscriptionId = json.id
  if (!approvalUrl || !subscriptionId) {
    console.error(
      "[paypal] Missing approval URL or subscription id",
      JSON.stringify(json),
    )
    throw new Error("PayPal response missing approval link or subscription id")
  }

  return { approvalUrl, subscriptionId }
}

export function buildPayPalSubscriptionUrls(planSlug: PlanSlug): {
  returnUrl: string
  cancelUrl: string
} {
  const origin = getPublicAppOrigin()
  return {
    returnUrl: `${origin}/payment/success?plan=${encodeURIComponent(planSlug)}`,
    cancelUrl: `${origin}/payment/cancel?plan=${encodeURIComponent(planSlug)}`,
  }
}

export type CreatePayPalOrderResult = {
  orderId: string
}

/**
 * Creates a one-time PayPal order (CAPTURE) for prepaid on-demand wallet top-ups.
 */
export async function createPayPalOrderForAmount(params: {
  amountCents: number
  /** DressApp user id for correlation. */
  customId: string
  description?: string
}): Promise<CreatePayPalOrderResult> {
  if (!Number.isInteger(params.amountCents) || params.amountCents < 1) {
    throw new Error("Invalid order amount")
  }
  const token = await getAccessToken()
  const value = (params.amountCents / 100).toFixed(2)
  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value,
        },
        description:
          params.description?.trim() ||
          "DressApp on-demand try-on prepaid wallet top-up",
        custom_id: params.customId,
      },
    ],
    application_context: {
      brand_name: process.env.PAYPAL_BRAND_NAME?.trim() || "DressApp",
      locale: "en-US",
      user_action: "PAY_NOW",
    },
  }

  const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "PayPal-Request-Id": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    console.error("[paypal] Create order failed", res.status, text)
    throw new Error(`PayPal could not create order (${res.status})`)
  }

  let json: { id?: string }
  try {
    json = JSON.parse(text) as { id?: string }
  } catch {
    console.error("[paypal] Create order invalid JSON", text)
    throw new Error("PayPal returned invalid JSON for order")
  }
  if (!json.id) {
    console.error("[paypal] Create order missing id", text)
    throw new Error("PayPal response missing order id")
  }
  return { orderId: json.id }
}

export type CapturePayPalOrderResult = {
  orderId: string
  captureId: string
  amountCents: number
}

/**
 * Captures a PayPal order and returns the capture id for wallet crediting.
 */
export async function capturePayPalOrder(orderId: string): Promise<CapturePayPalOrderResult> {
  const id = orderId.trim()
  if (!id) throw new Error("Missing PayPal order id")

  const token = await getAccessToken()
  const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(id)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "PayPal-Request-Id": crypto.randomUUID(),
    },
  })

  const text = await res.text()
  if (!res.ok) {
    console.error("[paypal] Capture order failed", res.status, text)
    throw new Error(`PayPal could not capture order (${res.status})`)
  }

  let json: {
    id?: string
    purchase_units?: {
      payments?: {
        captures?: { id?: string; amount?: { value?: string; currency_code?: string } }[]
      }
    }[]
  }
  try {
    json = JSON.parse(text) as typeof json
  } catch {
    console.error("[paypal] Capture order invalid JSON", text)
    throw new Error("PayPal returned invalid JSON for capture")
  }

  const capture = json.purchase_units?.[0]?.payments?.captures?.[0]
  const captureId = capture?.id?.trim()
  if (!captureId) {
    console.error("[paypal] Capture missing capture id", text)
    throw new Error("PayPal capture response missing capture id")
  }

  const valueRaw = capture?.amount?.value
  const amountCents =
    valueRaw != null && Number.isFinite(Number.parseFloat(valueRaw))
      ? Math.round(Number.parseFloat(valueRaw) * 100)
      : 0
  if (amountCents < 1) {
    console.error("[paypal] Capture invalid amount", capture?.amount)
    throw new Error("PayPal capture response missing valid amount")
  }

  return {
    orderId: json.id?.trim() || id,
    captureId,
    amountCents,
  }
}

export function buildOnDemandTopUpReturnUrl(): string {
  return `${getPublicAppOrigin()}/settings/billing`
}

export type PayPalSubscriptionDetails = {
  id: string
  status: string
  nextBillingTime: string | null
  customId: string | null
}

export async function getPayPalSubscriptionDetails(
  subscriptionId: string,
): Promise<PayPalSubscriptionDetails> {
  const id = subscriptionId.trim()
  if (!id) throw new Error("Missing PayPal subscription id")

  const token = await getAccessToken()
  const res = await fetch(
    `${getPayPalApiBase()}/v1/billing/subscriptions/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  )

  const text = await res.text()
  if (!res.ok) {
    console.error("[paypal] Get subscription failed", res.status, text)
    throw new Error(`PayPal could not load subscription (${res.status})`)
  }

  let json: {
    id?: string
    status?: string
    custom_id?: string
    billing_info?: { next_billing_time?: string }
  }
  try {
    json = JSON.parse(text) as typeof json
  } catch {
    console.error("[paypal] Get subscription invalid JSON", text)
    throw new Error("PayPal returned invalid JSON for subscription")
  }

  const resolvedId = json.id?.trim() || id
  const status = json.status?.trim() || "UNKNOWN"
  const nextBillingTime = json.billing_info?.next_billing_time?.trim() || null
  const customId = json.custom_id?.trim() || null

  return { id: resolvedId, status, nextBillingTime, customId }
}

export function payPalSubscriptionCustomIdForUser(userId: string | number): string {
  return `user:${userId}`
}

export function payPalSubscriptionOwnedByUser(
  customId: string | null,
  userId: string | number,
): boolean {
  if (!customId) return false
  return customId === payPalSubscriptionCustomIdForUser(userId)
}

export async function cancelPayPalSubscriptionRenewal(
  subscriptionId: string,
  reason: string,
): Promise<void> {
  const id = subscriptionId.trim()
  if (!id) throw new Error("Missing PayPal subscription id")

  const token = await getAccessToken()
  const res = await fetch(
    `${getPayPalApiBase()}/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({ reason: reason.trim() || "Customer requested cancellation" }),
    },
  )

  const text = await res.text()
  if (!res.ok) {
    console.error("[paypal] Cancel subscription failed", res.status, text)
    throw new Error(`PayPal could not cancel renewal (${res.status})`)
  }
}
