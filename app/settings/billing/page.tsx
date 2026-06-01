import type { Metadata } from "next"
import { OnDemandTryOnsSection } from "@/components/settings/on-demand-tryons-section"
import { getPayPalClientId } from "@/lib/paypal-public"

export const metadata: Metadata = {
  title: "Billing | DressApp Settings",
}

export default function SettingsBillingPage() {
  const clientId = getPayPalClientId()

  return <OnDemandTryOnsSection paypalClientId={clientId} />
}
