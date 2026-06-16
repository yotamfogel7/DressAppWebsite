import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { PlanCheckout } from "@/components/payment/plan-checkout"
import { updateUserSelectedPlan } from "@/lib/auth-db"
import { ensureMerchantForUser } from "@/lib/ensure-merchant-for-user"
import { getPayPalPlanIdForSlug, buildPayPalSubscriptionUrls } from "@/lib/paypal"
import {
  getPayPalClientId,
  getPayPalSdkEnvironment,
  type PlanCheckoutConfig,
} from "@/lib/paypal-public"
import { normalizePlanSlug, isFreeTrialPlanSlug } from "@/lib/plan-slugs"
import { SUPPORT_EMAIL } from "@/lib/site-contact"

export const metadata: Metadata = {
  title: "Checkout | DressApp",
  description: "Complete your DressApp subscription with card, Apple Pay, or PayPal.",
}

export default async function PlanSelectPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/plans/select")
  }
  if (!session.user.onboardingComplete) {
    redirect("/onboarding")
  }

  const params = await searchParams
  if (isFreeTrialPlanSlug(params.plan)) {
    redirect("/onboarding?intent=free-trial")
  }
  const slug = normalizePlanSlug(params.plan)
  if (!slug) {
    redirect("/plans")
  }

  const paypalPlanId = getPayPalPlanIdForSlug(slug)
  if (!paypalPlanId) {
    if (slug === "enterprise-plus") {
      redirect(
        `mailto:${SUPPORT_EMAIL}?subject=Enterprise%2B%20plan%20-%20DressApp`,
      )
    }
    console.error("[plans/select] Missing PayPal plan id env for slug:", slug)
    redirect("/payment/setup-error?code=missing_plan_mapping")
  }

  const clientId = getPayPalClientId()
  if (!clientId) {
    console.error("[plans/select] Missing PayPal client id env")
    redirect("/payment/setup-error?code=missing_paypal_config")
  }

  try {
    await updateUserSelectedPlan(session.user.id, slug)
    await ensureMerchantForUser(session.user.id, {
      email: session.user.email,
      name: session.user.name,
    })
  } catch (e) {
    console.error("[plans/select] Could not prepare account for checkout:", e)
    redirect("/payment/setup-error?code=paypal_api_error")
  }

  const { returnUrl, cancelUrl } = buildPayPalSubscriptionUrls(slug)

  const config: PlanCheckoutConfig = {
    slug,
    paypalPlanId,
    clientId,
    sdkEnvironment: getPayPalSdkEnvironment(),
    userId: session.user.id,
    returnUrl,
    cancelUrl,
  }

  return <PlanCheckout config={config} />
}
