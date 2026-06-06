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
import {
  DRESSAPP_PRODUCTION_API_BASE_URL,
  DRESSAPP_PRODUCTION_FRONTEND_BASE_URL,
} from "@/lib/dressapp-api-base"

export function ApiGuide() {
  return (
    <div className="space-y-14">
      <GuideCallout variant="info" title="DressApp URLs">
        <GuideBullets>
          <>
            <strong>API (backend):</strong>{" "}
            <GuideInlineCode>{DRESSAPP_PRODUCTION_API_BASE_URL}</GuideInlineCode> - base for all
            REST endpoints below.
          </>
          <>
            <strong>Frontend app:</strong>{" "}
            <GuideInlineCode>{DRESSAPP_PRODUCTION_FRONTEND_BASE_URL}</GuideInlineCode> - model
            studio onboarding UI (via <GuideInlineCode>public_app_url</GuideInlineCode> from embed
            config).
          </>
        </GuideBullets>
      </GuideCallout>
      <GuideSection
        title="When to use the API"
        description="For teams building their own UI: mobile apps, server-rendered sites, or anything that does not want our JS bundle. You call the same REST endpoints the SDK uses under the hood."
      >
        <p className="max-w-prose text-sm text-muted-foreground leading-relaxed">
          Prefer the storefront SDK when you want the fastest path in a browser.
        </p>
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
              only - never in client code.
            </p>
            <p>
              On the same page, enter and save your <strong>storefront URL</strong> - the public
              site or app origin where try-on runs (e.g.{" "}
              <GuideInlineCode>https://your-store.com</GuideInlineCode>). DressApp uses this to allow
              your domain for API calls.
            </p>
          </GuideStep>
          <GuideStep number={2} title="Create shopper sessions (server only)">
            <GuideCode label="POST /partner/v1/sessions">
              {`Authorization: Bearer dress_sk_live_…

{
  "external_user_ref": "customer-12345"
}

// Response: { "access_token": "…" }  (JWT - safe for the client)`}
            </GuideCode>
            <p>Never send the secret key to the client; only pass the access token.</p>
          </GuideStep>
          <GuideStep number={3} title="Sync catalog (server only)">
            <GuideCode label="POST /partner/v1/products">
              {`Authorization: Bearer dress_sk_live_…

{
  "external_id": "SKU-001",
  "title": "Blue dress",
  "url": "https://yoursite.com/p/blue-dress",
  "image_urls": ["https://yoursite.com/img/1.jpg"],
  "gender": "women",
  "sizes": ["XS", "S", "M", "L"],
  "colors": [{"label": "Navy"}, {"label": "Black"}]
}

// Store the returned product_id for try-on calls`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={4} title="Backfill sizes & colors (resolve-product)">
            <p>
              Before try-on UI on a product page, call resolve-product with your{" "}
              <strong>publishable key</strong>. Do this even when you already have{" "}
              <GuideInlineCode>product_id</GuideInlineCode> - it backfills sizes and colors on the
              catalog row.
            </p>
            <GuideCode label="GET /partner/v1/embed/resolve-product">
              {`Authorization: Bearer dress_pk_live_…

?external_id=SKU-001
&fallback_sizes=["XS","S","M","L"]
&fallback_colors=[{"label":"Navy"},{"label":"Black"}]
&fallback_title=Blue+dress
&fallback_url=https://yoursite.com/p/blue-dress

// Response: { "product_id": 12345 }`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={5} title="Check if the shopper has a model">
            <GuideCode label="GET /user-model/current">
              {`Authorization: Bearer <shopper access_token>

// null or empty → they need onboarding first`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={6} title="Model creation">
            <p>Send the shopper to DressApp&apos;s model studio:</p>
            <GuideCode label="Embed model studio">
              {`GET ${DRESSAPP_PRODUCTION_API_BASE_URL}/embed/model-studio?access_token=<token>&partner_return=https://yoursite.com/return`}
            </GuideCode>
            <p>
              Or build the URL from <GuideInlineCode>GET /partner/v1/embed-config</GuideInlineCode>{" "}
              (publishable key) → use <GuideInlineCode>public_app_url</GuideInlineCode> +{" "}
              <GuideInlineCode>/onboarding?access_token=…</GuideInlineCode>.
            </p>
          </GuideStep>
          <GuideStep number={7} title="Start a try-on">
            <GuideCode label="POST /tryon/{product_id}?async=true">
              {`Authorization: Bearer <shopper access_token>

// Response (HTTP 202): { "job_id": "…" }`}
            </GuideCode>
          </GuideStep>
          <GuideStep number={8} title="Poll for the result">
            <GuideCode label="GET /tryon/jobs/{job_id}">
              {`Authorization: Bearer <shopper access_token>

// When status is "completed", the response includes image URL(s)`}
            </GuideCode>
            <p>
              <strong>Alternative:</strong> register webhooks via{" "}
              <GuideInlineCode>POST /partner/v1/webhooks</GuideInlineCode> for{" "}
              <GuideInlineCode>tryon.job.completed</GuideInlineCode> /{" "}
              <GuideInlineCode>tryon.job.failed</GuideInlineCode> and skip polling.
            </p>
          </GuideStep>
          <GuideStep number={9} title="Optional extras">
            <GuideBullets>
              <>
                Try-on history: <GuideInlineCode>GET /tryon/history</GuideInlineCode>
              </>
              <>
                Usage / quota: <GuideInlineCode>GET /partner/v1/merchants/me/usage</GuideInlineCode>{" "}
                (secret key)
              </>
              <>
                Bill Gemini on your Google project:{" "}
                <GuideInlineCode>PUT /partner/v1/integrations/google-api-key</GuideInlineCode>
              </>
            </GuideBullets>
          </GuideStep>
          <GuideStep number={10} title="Verify before launch">
            HTTPS everywhere, secret key never in client code, one full test run end to end.
          </GuideStep>
        </GuideStepList>
      </GuideSection>
    </div>
  )
}
