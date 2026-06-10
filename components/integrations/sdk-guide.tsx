import Link from "next/link"
import {
  GuideBullets,
  GuideCallout,
  GuideCode,
  GuideInlineCode,
  GuideSection,
  GuideStep,
  GuideStepList,
} from "@/components/integrations/integration-guide-primitives"
import { DRESSAPP_PRODUCTION_API_BASE_URL } from "@/lib/dressapp-api-base"

export function SdkGuide() {
  return (
    <div className="space-y-14">
      <GuideSection
        title="Packages"
        description="DressApp ships a browser SDK that wraps sessions, model studio, and try-on calls."
      >
        <GuideBullets>
          <>
            <GuideInlineCode>@dressapp/web-sdk</GuideInlineCode> - lightweight JS (
            <GuideInlineCode>DressApp.enable()</GuideInlineCode>, try-on buttons, model studio
            redirect).
          </>
          <>
            <GuideInlineCode>@dressapp/react-widget</GuideInlineCode> - React components
            (floating studio dock, inline PDP widget). Built on the web SDK.
          </>
        </GuideBullets>
        <GuideCallout variant="tip" title="Product-page first">
          The primary try-on experience now lives on your product page: an inline{" "}
          <strong>Try it on</strong> button with size pills, Front/Back picker, inline progress,
          and a result modal - no need to open the floating widget. The floating dock is optional
          and can be turned off per merchant.
        </GuideCallout>
      </GuideSection>

      <GuideSection title="Setup steps">
        <GuideStepList>
          <GuideStep number={1} title="Credentials & storefront URL">
            <p>
              Open{" "}
              <Link
                href="/settings/credentials"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                Credentials
              </Link>{" "}
              in Settings. Copy your <strong>publishable key</strong> (
              <GuideInlineCode>dress_pk_…</GuideInlineCode>) and <strong>secret key</strong> (
              <GuideInlineCode>dress_sk_…</GuideInlineCode>). Keep the secret key on your server
              only - never in browser code.
            </p>
            <p>
              On the same page, enter and save your <strong>storefront URL</strong> - the public
              site where try-on runs (e.g. <GuideInlineCode>https://your-store.com</GuideInlineCode>
              ). DressApp uses this to allow your domain for SDK calls.
            </p>
            <p>
              Add the keys to your backend environment (secrets manager or{" "}
              <GuideInlineCode>.env</GuideInlineCode>):
            </p>
            <GuideCode label="Server environment">
              {`DRESSAPP_API_BASE_URL=${DRESSAPP_PRODUCTION_API_BASE_URL}
DRESSAPP_MERCHANT_SECRET=dress_sk_live_…

# Optional: expose publishable key to the browser
DRESSAPP_PUBLISHABLE_KEY=dress_pk_live_…
NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY=dress_pk_live_…
NEXT_PUBLIC_DRESSAPP_API_BASE_URL=${DRESSAPP_PRODUCTION_API_BASE_URL}`}
            </GuideCode>
            <p>
              Restart your server after updating env vars so session and product routes pick up the
              new values.
            </p>
          </GuideStep>
          <GuideStep number={2} title="Backend: shopper session">
            <p>
              Add one route on your server, for example{" "}
              <GuideInlineCode>GET /api/dressapp-session</GuideInlineCode>. It calls DressApp with
              your secret key and returns the <GuideInlineCode>access_token</GuideInlineCode> to
              your frontend.
            </p>
            <GuideCode label="POST /partner/v1/sessions">
              {`Authorization: Bearer dress_sk_live_…

{
  "external_user_ref": "<stable shopper id>"
}

// Response: { "access_token": "…" }`}
            </GuideCode>
            <p>
              Use your logged-in customer ID, or a persistent anonymous cookie ID for guests.
            </p>
          </GuideStep>
          <GuideStep number={3} title="Backend: product sync">
            <p>
              When products are created or updated, call{" "}
              <GuideInlineCode>POST /partner/v1/products</GuideInlineCode> with the same secret key.
              Save the returned <GuideInlineCode>product_id</GuideInlineCode> next to that SKU.
            </p>
            <GuideCode label="POST /partner/v1/products">
              {`{
  "external_id": "SKU-001",
  "title": "Blue dress",
  "url": "https://yoursite.com/p/blue-dress",
  "image_urls": ["https://yoursite.com/img/1.jpg"],
  "sizes": ["XS", "S", "M", "L"],
  "colors": [{"label": "Navy"}, {"label": "Black"}]
}`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={4} title="Frontend: PDP product context">
            <p>
              On every product page, always pass{" "}
              <GuideInlineCode>externalProductId</GuideInlineCode>,{" "}
              <GuideInlineCode>fallbackSizesJson</GuideInlineCode>, and{" "}
              <GuideInlineCode>fallbackColorsJson</GuideInlineCode> to the dock - even when you
              already have a DressApp <GuideInlineCode>productId</GuideInlineCode>. The SDK calls{" "}
              <GuideInlineCode>GET /partner/v1/embed/resolve-product</GuideInlineCode> to map your
              SKU to a catalog row and backfill sizes/colors. Any PDP URL structure works -
              passing the product explicitly is what marks the page as a product page.
            </p>
            <GuideCode label="PartnerStudioDock (React)">
              {`<PartnerStudioDock
  publishableKey="dress_pk_live_…"
  apiBase="${DRESSAPP_PRODUCTION_API_BASE_URL}"
  getAccessToken={…}
  productId={dressAppProductId}
  externalProductId="SKU-001"
  storeProductUrl={window.location.href}
  fallbackSizesJson='["XS","S","M","L"]'
  fallbackColorsJson='[{"label":"Navy"},{"label":"Black"}]'
  mountPdpTryonButton
/>`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={5} title="Frontend: PDP Try it on button">
            <p>
              Give the inline button a mount point on your product template - one of three
              options:
            </p>
            <GuideBullets>
              <>
                A placeholder slot right above your Add to cart button:{" "}
                <GuideInlineCode>&lt;div data-dressapp-pdp-tryon-block&gt;&lt;/div&gt;</GuideInlineCode>{" "}
                (most reliable).
              </>
              <>
                Mark your buy button with{" "}
                <GuideInlineCode>data-dressapp-pdp-anchor</GuideInlineCode> - the button injects
                above it.
              </>
              <>
                Pass <GuideInlineCode>pdpAnchorSelector=&quot;#add-to-cart&quot;</GuideInlineCode>{" "}
                (React prop, mount option, or{" "}
                <GuideInlineCode>data-pdp-anchor-selector</GuideInlineCode> attr).
              </>
            </GuideBullets>
            <GuideCode label="Product template">
              {`<div class="product-actions">
  <div data-dressapp-pdp-tryon-block></div>
  <button id="add-to-cart">Add to cart</button>
</div>`}
            </GuideCode>
            <p>
              The button runs the full flow on-page: size pills, Front/Back picker, model
              creation modal for first-time shoppers, inline progress cards, and a result modal.
            </p>
          </GuideStep>
          <GuideStep number={6} title="Frontend: install the SDK">
            <GuideCode label="npm">
              {`npm install @dressapp/web-sdk

# Or for React:
npm install @dressapp/react-widget`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={7} title="Frontend: enable DressApp">
            <p>After you fetch the shopper token from your backend:</p>
            <GuideCode label="Enable SDK">
              {`import { DressApp } from "@dressapp/web-sdk";

await DressApp.enable({
  publishableKey: "dress_pk_live_…",
  apiBase: "${DRESSAPP_PRODUCTION_API_BASE_URL}",
  accessToken: shopperJwt,
});`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={8} title="Cart hookup & SPA navigation">
            <p>
              Register your cart once so the try-on result modal shows{" "}
              <strong>Add tried size to cart</strong>. Throw an error containing &quot;out of
              stock&quot; to surface the out-of-stock state.
            </p>
            <GuideCode label="Add to cart handler">
              {`DressApp.setAddToCartHandler(async ({ productPageUrl, sizeLabel, colorLabel }) => {
  await myCart.add({ url: productPageUrl, size: sizeLabel, color: colorLabel });
}, { cartUrl: "/cart" });`}
            </GuideCode>
            <p>
              On single-page apps, rebind the product on route changes instead of reloading:
            </p>
            <GuideCode label="SPA navigation">
              {`DressApp.setProduct({
  externalProductId: "SKU-002",
  storeProductUrl: location.href,
  fallbackSizesJson: '["S","M","L"]',
  fallbackColorsJson: '[{"label":"White"}]',
});

DressApp.setProduct({}); // clear when leaving product pages`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={9} title="First visit: create a model">
            <p>
              No redirect needed. When a shopper without a body model presses{" "}
              <strong>Try it on</strong> on the PDP, a theme-matched modal opens on the page
              (photos → details → model ready). The floating dock&apos;s My Model tab offers the
              same wizard when enabled.
            </p>
          </GuideStep>
          <GuideStep number={10} title="Try-on">
            <p>
              On the PDP: press <strong>Try it on</strong>, pick a size and Front/Back angle, and
              the try-on runs inline with a progress card and a result modal. Headless alternative
              for custom UIs:
            </p>
            <GuideCode label="Request try-on (headless)">
              {`await DressApp.requestTryOn(productId, { async: true })

// Poll until complete:
DressApp.getTryOnJob(jobId)`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={11} title="Ship it">
            Test the full path on HTTPS: session → PDP Try it on → model modal → inline try-on →
            result modal (+ add-to-cart when wired) on a real product.
          </GuideStep>
        </GuideStepList>
      </GuideSection>

      <GuideCallout variant="tip" title="React shortcut">
        Drop <GuideInlineCode>&lt;PartnerStudioDock /&gt;</GuideInlineCode> from{" "}
        <GuideInlineCode>@dressapp/react-widget</GuideInlineCode> on product pages with{" "}
        <GuideInlineCode>externalProductId</GuideInlineCode> + size/color fallbacks. Same backend
        requirements.
      </GuideCallout>
    </div>
  )
}
