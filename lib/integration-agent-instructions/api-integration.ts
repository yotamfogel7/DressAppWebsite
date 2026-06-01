export const API_AGENT_INSTRUCTIONS_FILENAME = "api integration.md"

export const API_AGENT_INSTRUCTIONS = `# DressApp API Integration - AI Agent Instructions

## Role
You are a senior integration engineer agent. Your job is to integrate DressApp virtual try-on by calling DressApp REST endpoints directly - for mobile apps, custom server-rendered sites, or any client where the DressApp JS SDK is not used.

## Objective
Ship a working end-to-end flow: server holds the secret key and syncs catalog, client receives only shopper JWTs, shopper completes model onboarding once, then try-on jobs run asynchronously and return image URLs.

## Success criteria
- Secret key (dress_sk_...) used only on the server; never sent to clients.
- Shopper access_token (JWT from POST /partner/v1/sessions) is the only credential on client devices.
- Merchant origin is allowed (allowed_origins or PARTNER_CORS_ORIGINS on the API).
- Products synced via POST /partner/v1/products; product_id stored per SKU.
- Model onboarding reachable via embed URL or onboarding flow.
- Try-on started with POST /tryon/{product_id}?async=true; result retrieved via polling or webhooks.
- Full manual test on HTTPS: session -> model -> try-on -> completed image URL.

## Constraints

DO:
- Create shopper sessions server-side with POST /partner/v1/sessions and Authorization: Bearer <secret_key>.
- Sync catalog server-side with POST /partner/v1/products using the secret key.
- Pass only access_token to mobile apps, SPAs, or other clients.
- Use GET /user-model/current with the shopper token to check if onboarding is required.
- Poll GET /tryon/jobs/{job_id} or register webhooks for async completion.
- Use HTTPS everywhere in production.
- Log and propagate API error responses for debugging.

DON'T:
- Embed dress_sk_... in mobile apps, client code, or public repos.
- Call POST /partner/v1/sessions or POST /partner/v1/products from untrusted clients.
- Start try-on before confirming a model exists (unless you intentionally route to onboarding first).
- Assume external_id equals product_id; always use the id returned by the products API.
- Skip end-to-end verification before launch.

## Prerequisites
- Merchant has DressApp Pro plan or above (API access).
- Merchant secret key: dress_sk_live_...
- Merchant publishable key: dress_pk_live_... (for embed-config / public URLs if needed).
- DressApp API base URL (example production: https://dress-appbackend.com).
- Storefront or app origin registered in allowed_origins.

## Integration workflow

### Step 1: Obtain and store keys
Action:
1. Retrieve secret and publishable keys from DressApp Settings > Credentials (or POST /partner/v1/admin/merchants during initial provisioning).
2. Store dress_sk_... in server secrets manager or server-only environment variables.

Verify: Secret key is not present in any client repository or bundle.

### Step 2: Allow your domain or app origin
Action: Ensure the merchant allowed_origins includes your site origin, or the API has PARTNER_CORS_ORIGINS configured for browser-based clients.

Verify: Browser or app requests from your origin are not blocked by CORS when using shopper JWT endpoints.

### Step 3: Server - create shopper sessions
Action: For each shopper, your server calls:

POST {apiBase}/partner/v1/sessions
Authorization: Bearer dress_sk_live_...
Content-Type: application/json

{ "external_user_ref": "customer-12345" }

Response: { "access_token": "eyJ..." }

Return access_token to the client. Use a stable external_user_ref (customer id or persistent anonymous id).

Verify: Client receives JWT only; secret key never leaves the server.

### Step 4: Server - sync product catalog
Action: For each sellable SKU:

POST {apiBase}/partner/v1/products
Authorization: Bearer dress_sk_live_...

{
  "external_id": "SKU-001",
  "title": "Blue dress",
  "url": "https://yoursite.com/p/blue-dress",
  "image_urls": ["https://yoursite.com/img/1.jpg"],
  "gender": "women"
}

Store the returned product_id with the SKU in your database.

Verify: Try-on calls use DressApp product_id, not external_id.

### Step 5: Client - check if shopper has a model
Action:

GET {apiBase}/user-model/current
Authorization: Bearer <shopper access_token>

If response is null or empty, route shopper to model creation (Step 6).

Verify: Correct branch: onboarding vs try-on based on response.

### Step 6: Model creation (onboarding)
Action: Send the shopper to DressApp model studio. Option A - embed URL:

GET {apiBase}/embed/model-studio?access_token=<token>&partner_return=https://yoursite.com/return

Option B - build URL from embed config:
1. GET /partner/v1/embed-config with publishable key.
2. Use public_app_url + /onboarding?access_token=... with partner_return query param.

After completion, shopper returns to partner_return URL.

Verify: GET /user-model/current returns a model after onboarding.

### Step 7: Start a try-on job
Action:

POST {apiBase}/tryon/{product_id}?async=true
Authorization: Bearer <shopper access_token>

Response (HTTP 202): { "job_id": "..." }

Verify: Response is 202 with job_id; product_id is from catalog sync.

### Step 8: Retrieve try-on result
Action - polling:

GET {apiBase}/tryon/jobs/{job_id}
Authorization: Bearer <shopper access_token>

When status is "completed", response includes image URL(s). Display or persist as needed.

Action - alternative (recommended at scale):
Register webhooks via POST /partner/v1/webhooks for events tryon.job.completed and tryon.job.failed; handle completion on your server and notify the client.

Verify: Completed job yields usable image URL(s) in UI or API response to client.

### Step 9: Optional extras
- Try-on history: GET /tryon/history (shopper access_token)
- Usage / quota: GET /partner/v1/merchants/me/usage (secret key)
- Enterprise Gemini billing on merchant Google project: PUT /partner/v1/integrations/google-api-key (secret key)

### Step 10: Verify before launch
Action: Run one full HTTPS test: session -> model (if needed) -> try-on -> completed image.

Checklist:
- HTTPS on all endpoints
- Secret key never in client code
- One end-to-end success path documented for QA

Verify: All success criteria at the top of this document are met.

## API quick reference
| Action | Method / path | Auth |
|--------|---------------|------|
| Health | GET /partner/v1/health | none |
| Embed config | GET /partner/v1/embed-config | publishable key |
| Session | POST /partner/v1/sessions | secret key |
| Upsert product | POST /partner/v1/products | secret key |
| Current model | GET /user-model/current | shopper access_token |
| Model studio embed | GET /embed/model-studio | access_token query param |
| Try-on | POST /tryon/{product_id}?async=true | shopper access_token |
| Job status | GET /tryon/jobs/{job_id} | shopper access_token |
| Webhooks | POST /partner/v1/webhooks | secret key |
| Usage | GET /partner/v1/merchants/me/usage | secret key |

## When to prefer SDK instead
If the merchant storefront is a browser site they control and speed matters, recommend @dressapp/web-sdk - it wraps the same endpoints. Use this API document when building custom UI (mobile native, server-rendered, or non-JS clients).

## Troubleshooting
- 401 on partner routes: verify Bearer secret key header and key is live (dress_sk_live_...).
- 401 on try-on routes: use shopper access_token, not secret key.
- Unknown product_id: re-sync SKU via POST /partner/v1/products and use returned id.
- Job stuck: poll job endpoint; check webhook delivery if configured.
- CORS failures in browser clients: update allowed_origins for the merchant.

## Stop condition
Stop when all success criteria pass on HTTPS with a real product_id. Report any blocked step with exact HTTP status, response body, and the route/file you changed.
`
