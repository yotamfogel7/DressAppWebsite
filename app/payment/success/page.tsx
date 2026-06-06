import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Header } from "@/components/landing/header"
import { PaymentSuccessCelebration } from "@/components/payment/payment-success-celebration"
import { getUserSelectedPlan, updateUserPreferences } from "@/lib/auth-db"
import {
  PAYPAL_SUBSCRIPTION_ID_PREF,
  verifyPayPalSubscriptionForUser,
} from "@/lib/billing-subscription"
import { normalizePlanSlug, PLAN_LABELS, type PlanSlug } from "@/lib/plan-slugs"

export const metadata: Metadata = {
  title: "Subscription confirmed | DressApp",
  description: "Your DressApp subscription is active.",
}

function buildPaymentSuccessCallbackUrl(params: {
  plan?: string
  subscription_id?: string
  token?: string
  ba_token?: string
}): string {
  const qs = new URLSearchParams()
  if (typeof params.plan === "string" && params.plan.trim()) {
    qs.set("plan", params.plan.trim())
  }
  if (typeof params.subscription_id === "string" && params.subscription_id.trim()) {
    qs.set("subscription_id", params.subscription_id.trim())
  }
  if (typeof params.token === "string" && params.token.trim()) {
    qs.set("token", params.token.trim())
  }
  if (typeof params.ba_token === "string" && params.ba_token.trim()) {
    qs.set("ba_token", params.ba_token.trim())
  }
  const query = qs.toString()
  return query ? `/payment/success?${query}` : "/payment/success"
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string
    subscription_id?: string
    token?: string
    ba_token?: string
  }>
}) {
  const params = await searchParams
  const session = await auth()
  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(buildPaymentSuccessCallbackUrl(params))}`,
    )
  }

  const subscriptionId =
    typeof params.subscription_id === "string" ? params.subscription_id.trim() : ""

  const fromQuery = normalizePlanSlug(params.plan)
  const fromDbRaw = await getUserSelectedPlan(session.user.id)
  const fromDb = fromDbRaw ? normalizePlanSlug(fromDbRaw) : null
  const plan: PlanSlug | null = fromQuery ?? fromDb
  const planLabel = plan ? PLAN_LABELS[plan] : null

  let subscriptionSaveError: string | null = null
  if (subscriptionId) {
    const verified = await verifyPayPalSubscriptionForUser(subscriptionId, session.user.id)
    if (!verified.ok) {
      subscriptionSaveError = verified.error
    } else {
      try {
        await updateUserPreferences(session.user.id, {
          [PAYPAL_SUBSCRIPTION_ID_PREF]: subscriptionId,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error("[payment/success] Could not store PayPal subscription id", e)
        subscriptionSaveError =
          "Your payment went through, but we could not link billing to your account. Open Billing settings or contact support."
      }
    }
  }

  return (
    <>
      <Header sticky />
      <PaymentSuccessCelebration
        plan={plan}
        planLabel={planLabel}
        subscriptionId={subscriptionId}
        subscriptionSaveError={subscriptionSaveError}
      />
    </>
  )
}
