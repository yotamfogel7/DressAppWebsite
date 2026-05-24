import {
  GuideSection,
  GuideStep,
  GuideStepList,
} from "@/components/integrations/integration-guide-primitives"

export function HowItWorksOverview() {
  return (
    <GuideSection
      title="How it works"
      description="Every integration path uses the same try-on engine. Shoppers need two things before try-on works."
    >
      <GuideStepList>
        <GuideStep number={1} title="Identity">
          A short-lived token that ties the shopper to their digital model. Your secret key stays on
          your server; the browser only sees the publishable key and the shopper token.
        </GuideStep>
        <GuideStep number={2} title="Catalog">
          Each product you want to try on must exist in DressApp with a{" "}
          <strong>product_id</strong>. Sync happens automatically on Shopify, or via API/SDK on
          custom stores.
        </GuideStep>
        <GuideStep number={3} title="Digital model (first visit only)">
          New shoppers upload photos and measurements once. After that, try-on is one click on any
          product.
        </GuideStep>
      </GuideStepList>
    </GuideSection>
  )
}
