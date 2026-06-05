export const SDK_AGENT_INSTRUCTIONS_FILENAME = "sdk integration.md"

export const SDK_AGENT_INSTRUCTIONS = `# DressApp SDK Integration - AI Agent Instructions

## Role
You are a senior integration engineer agent. Your job is to add DressApp virtual try-on to a merchant's web storefront using the same floating widget Shopify merchants get (FAB + 3 tabs + inline model create + try-on history).

## Objective
Ship a working end-to-end flow on HTTPS: server creates shopper sessions and syncs products, frontend mounts the full studio dock, shopper creates a body model once inside the panel, then can try on synced products with size/color pickers and history.

## Success criteria
- Secret key (dress_sk_...) exists only in server-side code and environment variables.
- Publishable key (dress_pk_...) and shopper access_token are the only DressApp credentials exposed to the browser.
- One backend route returns a shopper JWT (access_token) per visitor or logged-in user.
- Products are upserted via POST /partner/v1/products; dressApp product_id is stored next to each SKU.
- Frontend mounts the full dock (PartnerStudioDock or script bundle) - NOT the deprecated inline cream-card widget.
- Model creation runs inside the dock panel (no redirect to dressapp.me required).
- On product pages, productId is passed so the Try on tab shows sizes, colors, and fit info.
- Full manual test passes: session -> open dock -> create model in panel -> try-on on a real product_id.
- UI matches Shopify widget: branded FAB bottom-right, dark themed panel, three tabs (Try on / My Model / My Try-ons).

## Constraints

DO:
- Store DRESSAPP_MERCHANT_SECRET (dress_sk_...) on the server only.
- Use a stable external_user_ref per shopper (logged-in customer id or persistent anonymous cookie id).
- Call POST /partner/v1/sessions and POST /partner/v1/products with Authorization: Bearer <secret_key>.
- Pass only the access_token JWT to the frontend.
- Register the merchant storefront URL in DressApp settings so the domain is allowed for SDK calls.
- Use PartnerStudioDock from @dressapp/react-widget (React) OR dressapp-partner-widget.js script bundle (no React).
- Pass productId on product detail pages.
- Restart the server after changing environment variables.
- Use HTTPS in production.
- Surface API errors in logs; do not fail silently.

DON'T:
- Put dress_sk_... in client bundles, HTML, Git repos, or browser-accessible env vars.
- Call partner endpoints that require the secret key from the browser.
- Use DressAppWidget as the primary integration (deprecated; renders full dock but prefer PartnerStudioDock).
- Use openModelStudio redirect as the default first-time model flow when the dock is mounted.
- Hardcode product_id without syncing from POST /partner/v1/products.
- Ship a simplified inline card UI instead of the full floating dock.
- Ship without testing try-on on a real synced product_id.

## Prerequisites
- Merchant has an active DressApp plan with SDK access (all plans).
- Merchant publishable key: dress_pk_live_...
- Merchant secret key: dress_sk_live_...
- DressApp API base URL (example production: https://dress-appbackend.com).
- Storefront URL saved in DressApp Credentials settings (public site where try-on runs).
- Node/npm project (React path) OR plain HTML (script-tag path).

## Environment variables (server)
DRESSAPP_API_BASE_URL=https://YOUR_DRESSAPP_API
DRESSAPP_MERCHANT_SECRET=dress_sk_live_...

Optional (expose to browser via your framework's public env prefix):
DRESSAPP_PUBLISHABLE_KEY=dress_pk_live_...
NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY=dress_pk_live_...
NEXT_PUBLIC_DRESSAPP_API_BASE_URL=https://YOUR_DRESSAPP_API

## Integration workflow

### Step 1: Configure credentials and allowed domain
Action:
1. Confirm merchant has publishable and secret keys from DressApp Settings > Credentials.
2. Save the storefront URL (e.g. https://your-store.com) in Credentials so DressApp allows that origin.
3. Add keys to server environment; restart the server.

Verify: Server process has DRESSAPP_MERCHANT_SECRET set; storefront URL matches the site you will embed SDK on.

### Step 2: Backend - shopper session route
Action: Add a server route (example: GET /api/dressapp-session) that:
1. Resolves external_user_ref (customer id or anonymous id).
2. POSTs to {apiBase}/partner/v1/sessions with header Authorization: Bearer <secret_key> and body { "external_user_ref": "<id>" }.
3. Returns { "access_token": "<jwt>" } to the frontend.

Example request:
POST /partner/v1/sessions
Authorization: Bearer dress_sk_live_...
Content-Type: application/json

{ "external_user_ref": "customer-12345" }

Example response:
{ "access_token": "eyJ..." }

Verify: Calling your route from the browser returns a non-empty access_token; secret key never appears in network tab responses.

### Step 3: Backend - product catalog sync
Action: When products are created or updated in the merchant catalog, POST to {apiBase}/partner/v1/products with the secret key:

{
  "external_id": "SKU-001",
  "title": "Blue dress",
  "url": "https://yoursite.com/p/blue-dress",
  "image_urls": ["https://yoursite.com/img/1.jpg"]
}

Persist the returned product_id alongside the merchant SKU for try-on calls.

Verify: At least one test SKU has a stored DressApp product_id.

### Step 4: Frontend - mount the full studio dock (recommended)

Choose ONE path:

#### Path A - React (npm)
Action:
npm install @dressapp/react-widget

Add once near the app root (layout / app shell):

import { PartnerStudioDock } from "@dressapp/react-widget";

<PartnerStudioDock
  publishableKey="dress_pk_live_..."
  apiBase="https://YOUR_DRESSAPP_API"
  getAccessToken={async () => {
    const r = await fetch("/api/dressapp-session", { credentials: "include" });
    const j = await r.json();
    return j.access_token as string;
  }}
  productId={dressAppProductIdOnPdp}
/>

productId is optional globally but REQUIRED on product detail pages for size/color try-on UI.

#### Path B - Script tag (no React)
Action: Add mount node and load the partner bundle from the DressApp app host:

<div
  data-dressapp-widget
  data-publishable-key="dress_pk_live_..."
  data-api-base="https://YOUR_DRESSAPP_API"
  data-session-url="/api/dressapp-session"
  data-dressapp-product-id="12345"
></div>
<script type="module" src="https://YOUR_DRESSAPP_APP_HOST/partner/dressapp-partner-widget.js"></script>

#### Path C - web-sdk mount helper
Action:
npm install @dressapp/web-sdk

await DressApp.enable({
  publishableKey: "dress_pk_live_...",
  apiBase: "https://YOUR_DRESSAPP_API",
  accessToken: shopperJwt,
});

DressApp.mountStudioDock({
  sessionUrl: "/api/dressapp-session",
  productId: dressAppProductId,
});

Verify: Floating FAB appears bottom-right; opening panel shows three tabs; model create runs inside panel.

### Step 5: Frontend - first visit model creation
Action: No separate redirect flow needed when the dock is mounted.
1. Shopper opens the dock (FAB bottom-right).
2. My Model tab offers Create my model inside the panel (photos, measurements, ready preview).
3. After model is ready, Try on tab unlocks for synced products.

Legacy alternative (headless/custom UI only): DressApp.openModelStudio({ returnUrl }) - not needed with PartnerStudioDock.

Verify: hasModel() returns true after completing inline model flow; no redirect to dressapp.me required.

### Step 6: Frontend - try-on
Action: With the dock mounted and productId set on PDP:
1. Open Try on tab.
2. Pick size/color/facing as shown.
3. Tap Generate try-on; results appear in panel and My Try-ons tab.

Headless alternative (custom UI only):
const job = await DressApp.requestTryOn(productId, { async: true });
DressApp.getTryOnJob(jobId)

Verify: Try-on image URL(s) appear in the dock history; same UX as Shopify storefront widget.

### Step 7: Ship and regression test
Action: On HTTPS staging or production, run full path: session -> open dock -> create model in panel -> try-on on real product.

Verify: All success criteria at the top of this document are met; UI is not a simplified inline card.

## Merchant settings (automatic)
PartnerStudioDock loads widget settings from GET /partner/v1/embed-config:
- widget_scheme (color preset)
- widget_language (en/he)
- allow_out_of_stock_tryon
- tryon_size_filter settings
- pdp_tryon_button_enabled

No extra proxy setup required for non-Shopify SDK merchants.

## Deprecated / advanced
- DressAppWidget - deprecated; use PartnerStudioDock instead.
- DressAppStudioDock - lower-level; use only when customizing labels/props beyond PartnerStudioDock.
- openModelStudio redirect - optional for headless integrations only.

## API quick reference
| Action | Method / path | Auth |
|--------|---------------|------|
| Health | GET /partner/v1/health | none |
| Embed config (+ storefront settings) | GET /partner/v1/embed-config | publishable key |
| Session | POST /partner/v1/sessions | secret key |
| Upsert product | POST /partner/v1/products | secret key |
| Current model | GET /user-model/current | shopper access_token |
| Try-on | POST /tryon/{product_id}?async=true | shopper access_token |
| Job status | GET /tryon/jobs/{job_id} | shopper access_token |

## Troubleshooting
- CORS or domain errors: confirm storefront URL is saved in DressApp Credentials and matches browser origin.
- 401 on session route: check secret key and Authorization header format (Bearer dress_sk_...).
- Try-on fails with unknown product: confirm product_id came from POST /partner/v1/products, not external_id alone.
- Simplified cream card UI instead of full dock: you mounted DressAppWidget or bare DressAppStudioDock without PartnerStudioDock - switch to PartnerStudioDock or script bundle.
- Tabs stacked / broken layout: ensure mount uses data-dressapp-widget on body with script bundle, or PartnerStudioDock at app root with fixed positioning.
- Env changes ignored: restart the server after updating .env.

## Stop condition
Stop when all success criteria pass on HTTPS with a real product and the UI matches the Shopify floating dock (FAB, 3 tabs, inline model create). Report any blocked step with the exact API error body and the file/route you changed.
`
