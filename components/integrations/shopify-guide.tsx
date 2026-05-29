import Link from "next/link"
import {
  GuideBullets,
  GuideSection,
  GuideStep,
  GuideStepList,
  GuideStepScreenshot,
} from "@/components/integrations/integration-guide-primitives"

export function ShopifyGuide() {
  return (
    <div className="space-y-14">
      <GuideSection
        title="What DressApp handles for you"
        description="For stores on Shopify. Install from the App Store, turn on a theme block, and you are live."
      >
        <GuideBullets>
          Creates your merchant account on first install (no manual API signup).
          Syncs products from Shopify automatically.
          <>
            Mints shopper sessions through Shopify&apos;s app proxy (no secret key in the
            theme).
          </>
        </GuideBullets>
      </GuideSection>

      <GuideSection title="Setup steps">
        <GuideStepList>
          <GuideStep number={1} title="Install the app">
            Install from the{" "}
            <Link
              href="https://apps.shopify.com/dressapp"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              Shopify App Store
            </Link>
            .
            <GuideStepScreenshot
              label="Install the DressApp app from the Shopify App Store"
              src="/integrations/shopify-app-store-install.png"
            />
          </GuideStep>
          <GuideStep number={2} title="Open the app page">
            In Shopify Admin, go to <strong>Apps → DressApp</strong> to open the DressApp setup
            page.
            <GuideStepScreenshot
              label="Open the DressApp app page in Shopify Admin"
              src="/integrations/shopify-app-admin-page.png"
            />
          </GuideStep>
          <GuideStep number={3} title="Select a plan">
            Choose a subscription plan in the DressApp app. Starter plan or above is required to
            activate try-on on your store.
            <GuideStepScreenshot
              label="Select a DressApp subscription plan in Shopify"
              src="/integrations/shopify-select-plan.png"
            />
          </GuideStep>
          <GuideStep number={4} title="Add DressApp to your theme">
            On the app page, click <strong>Add DressApp to your theme</strong>. This enables
            storefront components and opens the theme editor with DressApp ready to configure.
            <GuideStepScreenshot
              label="Add DressApp to your theme from the app page"
              src="/integrations/shopify-storefront-setup.png"
            />
          </GuideStep>
          <GuideStep number={5} title="Place the try-on block">
            Add the try-on block to the <strong>header</strong> section if you want it on every
            page, or to a <strong>product</strong> section if you want it only on product pages.
            Save in the theme editor when you are done.
            <GuideStepScreenshot
              label="Add the DressApp try-on block to header or product section"
              src="/integrations/shopify-try-on-block.png"
            />
          </GuideStep>
          <GuideStep number={6} title="Test on a live product page">
            Open your storefront (not Admin), click try-on, create a model if prompted, and
            generate a try-on.
            <GuideStepScreenshot
              label="Test virtual try-on on a live product page"
              src="/integrations/shopify-live-try-on.png"
            />
          </GuideStep>
        </GuideStepList>
      </GuideSection>
    </div>
  )
}
