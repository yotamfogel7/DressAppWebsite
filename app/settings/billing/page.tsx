import type { Metadata } from "next"
import { auth } from "@/auth"
import { OnDemandTryOnsSection } from "@/components/settings/on-demand-tryons-section"
import {
  getBillingSubscriptionSummary,
  type BillingSubscriptionSummary,
} from "@/lib/billing-subscription"
import { getPayPalClientId } from "@/lib/paypal-public"

export const metadata: Metadata = {
  title: "Billing | DressApp Settings",
}

export default async function SettingsBillingPage() {
  const clientId = getPayPalClientId()
  let initialSubscription: BillingSubscriptionSummary | null = null

  const session = await auth()
  if (session?.user?.id) {
    try {
      initialSubscription = await getBillingSubscriptionSummary(session.user.id)
    } catch (e) {
      console.error("[settings/billing] Could not load subscription summary", e)
    }
  }

  return (
    <OnDemandTryOnsSection
      paypalClientId={clientId}
      initialSubscription={initialSubscription}
    />
  )
}
