import type { Metadata } from "next"
import { IntegrationDetailShell } from "@/components/integrations/integration-detail-shell"
import { ShopifyGuide } from "@/components/integrations/shopify-guide"

export const metadata: Metadata = {
  title: "Shopify App Integration | DressApp",
  description:
    "Install DressApp from the Shopify App Store for the fastest path to virtual try-on on your store.",
}

export default function ShopifyIntegrationPage() {
  return (
    <IntegrationDetailShell
      title="Shopify App"
      description="For stores on Shopify. Install from the App Store, turn on a theme block, and you are live."
      imageSrc="/icons/shopify logo.png"
      imageAlt="Shopify"
    >
      <ShopifyGuide />
    </IntegrationDetailShell>
  )
}
