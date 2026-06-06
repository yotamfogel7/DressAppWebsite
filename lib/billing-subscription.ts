import "server-only"

import { getUserPreferences, getUserSelectedPlan } from "@/lib/auth-db"
import { fetchMonthlyTryOnCount } from "@/lib/dressapp-monthly-usage"
import {
  getPayPalSubscriptionDetails,
  payPalSubscriptionOwnedByUser,
} from "@/lib/paypal"
import { PRICING_PLANS } from "@/lib/pricing-plans"
import { getPlanLabel } from "@/lib/plan-try-on-allowance"
import { normalizePlanSlug, type PlanSlug } from "@/lib/plan-slugs"
import { isUserOnSignupTrial } from "@/lib/signup-trial"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

export const PAYPAL_SUBSCRIPTION_ID_PREF = "paypal_subscription_id"

export type BillingPlanKind = "paid" | "trial" | "none"

export type BillingSubscriptionSummary = {
  kind: BillingPlanKind
  planSlug: PlanSlug | null
  planLabel: string
  planPrice: string
  planPriceSuffix: string | null
  renewalDate: string | null
  renewalCancelled: boolean
  canCancelRenewal: boolean
  hasPayPalSubscription: boolean
  paypalStatusUnavailable: boolean
}

function readSubscriptionId(prefs: Record<string, unknown>): string | null {
  const raw = prefs[PAYPAL_SUBSCRIPTION_ID_PREF]
  if (typeof raw !== "string") return null
  const trimmed = raw.trim()
  return trimmed || null
}

function isRenewalCancelledStatus(status: string): boolean {
  const normalized = status.trim().toUpperCase()
  return normalized === "CANCELLED" || normalized === "SUSPENDED" || normalized === "EXPIRED"
}

export function isPayPalRenewalCancelledStatus(status: string): boolean {
  return isRenewalCancelledStatus(status)
}

function canCancelRenewalStatus(status: string): boolean {
  const normalized = status.trim().toUpperCase()
  return normalized === "ACTIVE" || normalized === "APPROVED"
}

export function canCancelPayPalRenewalStatus(status: string): boolean {
  return canCancelRenewalStatus(status)
}

async function resolveRenewalDateFromUsage(userId: string): Promise<string | null> {
  const credentials = await getUserMerchantCredentials(userId)
  if (!credentials) return null

  const usage = await fetchMonthlyTryOnCount({
    secretKey: credentials.secretKey,
    dashboardPassword: credentials.merchantDashboardPassword,
  })
  if (usage.error) return null
  return usage.periodTo || null
}

export async function verifyPayPalSubscriptionForUser(
  subscriptionId: string,
  userId: string | number,
): Promise<{ ok: true; details: Awaited<ReturnType<typeof getPayPalSubscriptionDetails>> } | { ok: false; error: string }> {
  try {
    const details = await getPayPalSubscriptionDetails(subscriptionId)
    if (!payPalSubscriptionOwnedByUser(details.customId, userId)) {
      return { ok: false, error: "This PayPal subscription does not belong to your account." }
    }
    return { ok: true, details }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[billing-subscription] PayPal verification failed", e)
    return { ok: false, error: msg }
  }
}

export async function getBillingSubscriptionSummary(
  userId: string,
): Promise<BillingSubscriptionSummary> {
  const [planRaw, onSignupTrial] = await Promise.all([
    getUserSelectedPlan(userId),
    isUserOnSignupTrial(userId),
  ])
  const planSlug = planRaw ? normalizePlanSlug(planRaw) : null

  if (!planSlug && onSignupTrial) {
    return {
      kind: "trial",
      planSlug: null,
      planLabel: "Free trial",
      planPrice: "$0",
      planPriceSuffix: null,
      renewalDate: null,
      renewalCancelled: false,
      canCancelRenewal: false,
      hasPayPalSubscription: false,
      paypalStatusUnavailable: false,
    }
  }

  if (!planSlug) {
    return {
      kind: "none",
      planSlug: null,
      planLabel: "No plan selected",
      planPrice: "",
      planPriceSuffix: null,
      renewalDate: null,
      renewalCancelled: false,
      canCancelRenewal: false,
      hasPayPalSubscription: false,
      paypalStatusUnavailable: false,
    }
  }

  const plan = PRICING_PLANS.find((p) => p.slug === planSlug)
  const prefs = await getUserPreferences(userId)
  const subscriptionId = readSubscriptionId(prefs)
  const hasPayPalSubscription = Boolean(subscriptionId)

  let renewalDate: string | null = null
  let renewalCancelled = false
  let canCancelRenewal = false
  let paypalStatusUnavailable = false

  if (subscriptionId) {
    const verified = await verifyPayPalSubscriptionForUser(subscriptionId, userId)
    if (verified.ok) {
      renewalCancelled = isRenewalCancelledStatus(verified.details.status)
      canCancelRenewal = canCancelRenewalStatus(verified.details.status)
      renewalDate = verified.details.nextBillingTime
    } else {
      paypalStatusUnavailable = true
      console.error("[billing-subscription] PayPal lookup failed for stored subscription", verified.error)
    }
  }

  if (!renewalDate) {
    renewalDate = await resolveRenewalDateFromUsage(userId)
  }

  return {
    kind: "paid",
    planSlug,
    planLabel: getPlanLabel(planSlug) ?? planSlug,
    planPrice: plan?.price ?? "",
    planPriceSuffix: plan?.priceSuffix ?? null,
    renewalDate,
    renewalCancelled,
    canCancelRenewal: Boolean(subscriptionId && canCancelRenewal),
    hasPayPalSubscription,
    paypalStatusUnavailable,
  }
}

export async function getStoredPayPalSubscriptionId(userId: string): Promise<string | null> {
  const prefs = await getUserPreferences(userId)
  return readSubscriptionId(prefs)
}
