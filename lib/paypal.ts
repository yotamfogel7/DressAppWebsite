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
