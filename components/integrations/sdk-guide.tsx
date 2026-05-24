import {
  GuideBullets,
  GuideCallout,
  GuideCode,
  GuideInlineCode,
  GuideSection,
  GuideStep,
  GuideStepList,
} from "@/components/integrations/integration-guide-primitives"

export function SdkGuide() {
  return (
    <div className="space-y-14">
      <GuideSection
        title="Packages"
        description="DressApp ships a browser SDK that wraps sessions, model studio, and try-on calls."
      >
        <GuideBullets>
          <>
            <GuideInlineCode>@dressapp/web-sdk</GuideInlineCode> — lightweight JS (
            <GuideInlineCode>DressApp.enable()</GuideInlineCode>, try-on buttons, model studio
            redirect).
          </>
          <>
            <GuideInlineCode>@dressapp/react-widget</GuideInlineCode> — React components
            (floating studio dock, inline PDP widget). Built on the web SDK.
          </>
        </GuideBullets>
      </GuideSection>

      <GuideSection title="Setup steps">
        <GuideStepList>
          <GuideStep number={1} title="Get keys">
            DressApp ops creates a merchant via{" "}
            <GuideInlineCode>POST /partner/v1/admin/merchants</GuideInlineCode>. You receive a{" "}
            <strong>secret key</strong> (<GuideInlineCode>dress_sk_…</GuideInlineCode>) and{" "}
            <strong>publishable key</strong> (<GuideInlineCode>dress_pk_…</GuideInlineCode>).
            Store the secret in your secrets manager.
          </GuideStep>
          <GuideStep number={2} title="Allow your domain">
            Add your storefront origin to the merchant&apos;s{" "}
            <GuideInlineCode>allowed_origins</GuideInlineCode>, or ask DressApp to add it to{" "}
            <GuideInlineCode>PARTNER_CORS_ORIGINS</GuideInlineCode> on the API.
          </GuideStep>
          <GuideStep number={3} title="Backend: shopper session">
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
          <GuideStep number={4} title="Backend: product sync">
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
  "image_urls": ["https://yoursite.com/img/1.jpg"]
}`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={5} title="Frontend: install the SDK">
            <GuideCode label="npm">
              {`npm install @dressapp/web-sdk

# Or for React:
npm install @dressapp/react-widget`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={6} title="Frontend: enable DressApp">
            <p>After you fetch the shopper token from your backend:</p>
            <GuideCode label="Enable SDK">
              {`import { DressApp } from "@dressapp/web-sdk";

await DressApp.enable({
  publishableKey: "dress_pk_live_…",
  apiBase: "https://YOUR_DRESSAPP_API",
  accessToken: shopperJwt,
});`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={7} title="First visit: create a model">
            <p>
              Check <GuideInlineCode>await DressApp.hasModel()</GuideInlineCode>. If false, show a
              &quot;Create my model&quot; button:
            </p>
            <GuideCode label="Open model studio">
              {`DressApp.openModelStudio({ returnUrl: window.location.href })`}
            </GuideCode>
            <p>
              The shopper finishes photos on DressApp, then clicks <strong>Continue to store</strong>{" "}
              to come back.
            </p>
          </GuideStep>
          <GuideStep number={8} title="Try-on">
            <p>When <GuideInlineCode>hasModel()</GuideInlineCode> is true:</p>
            <GuideCode label="Request try-on">
              {`await DressApp.requestTryOn(productId, { async: true })

// Poll until complete:
DressApp.getTryOnJob(jobId)`}
            </GuideCode>
            <p>
              Or register webhooks on your server (optional) instead of polling.
            </p>
          </GuideStep>
          <GuideStep number={9} title="Ship it">
            Test the full path on HTTPS: session → model → return → try-on on a real product.
          </GuideStep>
        </GuideStepList>
      </GuideSection>

      <GuideCallout variant="tip" title="React shortcut">
        Drop <GuideInlineCode>&lt;DressAppStudioDock /&gt;</GuideInlineCode> or{" "}
        <GuideInlineCode>{"<DressAppWidget productId={…} />"}</GuideInlineCode> from{" "}
        <GuideInlineCode>@dressapp/react-widget</GuideInlineCode> instead of wiring every button
        yourself. Same backend requirements.
      </GuideCallout>
    </div>
  )
}
