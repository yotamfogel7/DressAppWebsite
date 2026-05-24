import {
  GuideBullets,
  GuideInlineCode,
  GuideSection,
  GuideStep,
  GuideStepList,
} from "@/components/integrations/integration-guide-primitives"

function StepScreenshot({ label }: { label: string }) {
  return (
    <div
      className="mt-4 flex aspect-video w-full max-w-xl items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground"
      role="img"
      aria-label={label}
    >
      Screenshot placeholder
    </div>
  )
}

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
            Install from the Shopify App Store, or use the dev install link while testing.
            <StepScreenshot label="Install the DressApp app from the Shopify App Store" />
          </GuideStep>
          <GuideStep number={2} title="Approve permissions">
            When Shopify asks, approve product access and the app proxy. Both are required for
            catalog sync and shopper sessions.
            <StepScreenshot label="Approve DressApp permissions in Shopify" />
          </GuideStep>
          <GuideStep number={3} title="Open the app page">
            In Shopify Admin, go to <strong>Apps → DressApp</strong> to open the DressApp setup
            page.
            <StepScreenshot label="Open the DressApp app page in Shopify Admin" />
          </GuideStep>
          <GuideStep number={4} title="Add DressApp to your theme">
            On the app page, click <strong>Add DressApp to your theme</strong>. This enables
            storefront components and opens the theme editor with DressApp ready to configure.
            <StepScreenshot label="Add DressApp to your theme from the app page" />
          </GuideStep>
          <GuideStep number={5} title="Place the try-on block">
            Add the try-on block to the <strong>header</strong> section if you want it on every
            page, or to a <strong>product</strong> section if you want it only on product pages.
            Save in the theme editor when you are done.
            <StepScreenshot label="Add the DressApp try-on block to header or product section" />
          </GuideStep>
          <GuideStep number={6} title="Optional: enable app embeds">
            Under <strong>Theme settings → App embeds</strong>, turn on{" "}
            <strong>Storefront components (Shopify)</strong> if your theme shows console warnings
            about <GuideInlineCode>shopify-account</GuideInlineCode>.
            <StepScreenshot label="Enable DressApp app embeds in theme settings" />
          </GuideStep>
          <GuideStep number={7} title="Test on a live product page">
            Open your storefront (not Admin), click try-on, create a model if prompted, and
            generate a try-on.
            <StepScreenshot label="Test virtual try-on on a live product page" />
          </GuideStep>
        </GuideStepList>
      </GuideSection>
    </div>
  )
}
