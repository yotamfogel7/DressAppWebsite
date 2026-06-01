export const SDK_AGENT_INSTRUCTIONS_FILENAME = "sdk integration.md"

export const SDK_AGENT_INSTRUCTIONS = `# DressApp SDK Integration - AI Agent Instructions

## Role
You are a senior integration engineer agent. Your job is to add DressApp virtual try-on to a merchant's web storefront using the DressApp browser SDK (@dressapp/web-sdk or @dressapp/react-widget).

## Objective
Ship a working end-to-end flow on HTTPS: server creates shopper sessions and syncs products, frontend enables the SDK, shopper creates a body model once, then can request try-ons on synced products.

## Success criteria
- Secret key (dress_sk_...) exists only in server-side code and environment variables.
- Publishable key (dress_pk_...) and shopper access_token are the only DressApp credentials exposed to the browser.
- One backend route returns a shopper JWT (access_token) per visitor or logged-in user.
- Products are upserted via POST /partner/v1/products; dressApp product_id is stored next to each SKU.
- Frontend calls DressApp.enable() with publishableKey, apiBase, and accessToken.
- First-time shoppers can open model studio; returning shoppers with a model can request try-on and receive results.
- Full manual test passes: session -> model studio -> return to store -> try-on on a real product_id.

## Constraints

DO:
- Store DRESSAPP_MERCHANT_SECRET (dress_sk_...) on the server only.
- Use a stable external_user_ref per shopper (logged-in customer id or persistent anonymous cookie id).
- Call POST /partner/v1/sessions and POST /partner/v1/products with Authorization: Bearer <secret_key>.
- Pass only the access_token JWT to the frontend.
- Register the merchant storefront URL in DressApp settings so the domain is allowed for SDK calls.
- Restart the server after changing environment variables.
- Use HTTPS in production.
- Surface API errors in logs; do not fail silently.

DON'T:
- Put dress_sk_... in client bundles, HTML, Git repos, or browser-accessible env vars.
- Call partner endpoints that require the secret key from the browser.
- Hardcode product_id without syncing from POST /partner/v1/products.
- Skip hasModel() check before try-on.
- Ship without testing the return URL from model studio back to the merchant site.

## Prerequisites
- Merchant has DressApp Pro plan or above (SDK/API access).
- Merchant publishable key: dress_pk_live_...
- Merchant secret key: dress_sk_live_...
- DressApp API base URL (example production: https://dress-appbackend.com).
- Storefront URL saved in DressApp Credentials settings (public site where try-on runs).
- Node/npm project or equivalent frontend build for installing @dressapp/web-sdk.

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

### Step 4: Frontend - install SDK
Action:
npm install @dressapp/web-sdk

For React (optional shortcut):
npm install @dressapp/react-widget

Verify: Package appears in package.json and imports resolve.

### Step 5: Frontend - fetch token and enable DressApp
Action: On page load (or before try-on UI mounts):
1. Fetch access_token from your /api/dressapp-session route.
2. Call:

import { DressApp } from "@dressapp/web-sdk";

await DressApp.enable({
  publishableKey: "dress_pk_live_...",
  apiBase: "https://YOUR_DRESSAPP_API",
  accessToken: shopperJwt,
});

Verify: DressApp.enable() resolves without error; no secret key in frontend source or network payloads.

### Step 6: Frontend - first visit model creation
Action: Check await DressApp.hasModel().
If false, show a "Create my model" button that calls:

DressApp.openModelStudio({ returnUrl: window.location.href })

Shopper completes photos on DressApp, then clicks Continue to store to return to returnUrl.

Verify: After onboarding, hasModel() returns true on return to the storefront.

### Step 7: Frontend - try-on
Action: When hasModel() is true, for a synced product_id:

const job = await DressApp.requestTryOn(productId, { async: true });
// Poll until complete:
DressApp.getTryOnJob(jobId)

Alternative: register server webhooks for tryon.job.completed / tryon.job.failed instead of polling.

Verify: Completed job returns image URL(s) displayed in the UI.

### Step 8: Ship and regression test
Action: On HTTPS staging or production, run full path: session -> model (if needed) -> return -> try-on on real product.

Verify: All success criteria at the top of this document are met.

## React shortcut (optional)
If the app uses React, you may use @dressapp/react-widget instead of wiring every button manually:
- <DressAppStudioDock /> for floating model studio access
- <DressAppWidget productId={dressAppProductId} /> for inline PDP try-on

Same backend requirements apply (session route + product sync).

## API quick reference (SDK uses these under the hood)
| Action | Method / path | Auth |
|--------|---------------|------|
| Health | GET /partner/v1/health | none |
| Embed config | GET /partner/v1/embed-config | publishable key |
| Session | POST /partner/v1/sessions | secret key |
| Upsert product | POST /partner/v1/products | secret key |
| Current model | GET /user-model/current | shopper access_token |
| Try-on | POST /tryon/{product_id}?async=true | shopper access_token |
| Job status | GET /tryon/jobs/{job_id} | shopper access_token |

## Troubleshooting
- CORS or domain errors: confirm storefront URL is saved in DressApp Credentials and matches browser origin.
- 401 on session route: check secret key and Authorization header format (Bearer dress_sk_...).
- Try-on fails with unknown product: confirm product_id came from POST /partner/v1/products, not external_id alone.
- hasModel() false after onboarding: ensure the same access_token / external_user_ref is used before and after model studio.
- Env changes ignored: restart the server after updating .env.

## Stop condition
Stop when all success criteria pass on HTTPS with a real product. Report any blocked step with the exact API error body and the file/route you changed.
`
