# DressApp integration manual (your own website)

Use this when you want virtual **model creation** + **try-on** on a site you control. Your **secret** keys stay on your server; the browser only gets a **publishable** key and a **shopper JWT**.

---

## Prerequisites

| Item | Purpose |
|------|---------|
| DressApp **API** reachable over HTTPS | Partner endpoints live on the same API as the main app |
| **Merchant** provisioned | You get `dress_sk_live_…` (secret) + `dress_pk_live_…` (publishable) |
| Your storefront URL allowed | CORS — see step 1 |

---

## Step 1 — One-time API setup (DressApp ops / backend)

1. Set **`PARTNER_ADMIN_SECRET`** in the DressApp API `.env` and restart the API.
2. Create the merchant:

   `POST /partner/v1/admin/merchants`  
   Header: `X-Partner-Admin-Secret: <your secret>`  
   Body: `name`, `slug`, optional `allowed_origins` (your site origin, e.g. `https://shop.example.com`).

3. Store the returned **`secret_key`** and **`publishable_key`** in your secrets manager (never commit them).

4. **CORS:** Either list your origin in the merchant `allowed_origins` **or** add it to **`PARTNER_CORS_ORIGINS`** (comma-separated) on the API.

5. If the API hostname differs from your marketing site, set **`PUBLIC_API_BASE_URL`** on the API so the SDK knows where to call.

---

## Step 2 — Your backend (required)

Implement **one server-side flow** that holds the **secret** key.

### 2a — Shopper session (every visitor or logged-in user)

`POST https://<API>/partner/v1/sessions`  

Headers: `Authorization: Bearer <secret_key>`  
Body: `{ "external_user_ref": "<stable id>" }` (e.g. your customer id or anonymous cookie id)

Response: **`access_token`** → send this to your frontend (short-lived JWT).

### 2b — Catalog (so try-on knows which product)

For each sellable SKU you want to try on:

`POST https://<API>/partner/v1/products`  

Same `Authorization: Bearer <secret_key>`  
Body includes `external_id` (your SKU), `title`, `url`, `image_urls`, etc.

Save the returned **`product_id`** next to that SKU in **your** database or cache.

---

## Step 3 — Your frontend (SDK)

1. Add **`@dressapp/web-sdk`** (build from `packages/dressapp-web-sdk` or publish to your CDN).

2. After your page loads the shopper JWT from **your** backend:

```ts
import { DressApp } from "@dressapp/web-sdk";

await DressApp.enable({
  publishableKey: "dress_pk_live_…",
  apiBase: "https://YOUR_DRESSAPP_API_ORIGIN",
  accessToken: shopperJwtFromYourBackend,
});
```

3. **First-time model:** if `await DressApp.hasModel()` is false, show a button that runs:

   `DressApp.openModelStudio({ returnUrl: window.location.href })`  

   (Opens DressApp onboarding; after **Done**, shopper can use **Continue to store** back to your URL.)

4. **Try-on:** if `hasModel()` is true, call:

   `await DressApp.requestTryOn(dressAppProductId, { async: true })`  

   Then poll `DressApp.getTryOnJob(jobId)` **or** receive **webhooks** on your server (optional).

---

## Step 4 — Verify before launch

- [ ] HTTPS everywhere (your site + API).
- [ ] Secret key **never** in HTML, GitHub, or client bundles.
- [ ] One full test: session → model studio → return to site → try-on on a real `product_id`.
- [ ] Error paths: show API error text in dev tools / logs (no silent failures).

---

## Optional

| Topic | Where |
|-------|--------|
| Webhooks for async jobs | [quickstart](./quickstart.md) § webhooks |
| **Enterprise:** bill Gemini on **your** Google project | [quickstart](./quickstart.md) § enterprise Gemini key |
| Shopify-specific install | [integrations/shopify/README.md](../../integrations/shopify/README.md) |
| Sandbox env checklist | [sandbox](./sandbox.md) |

---

## Quick reference — URLs

| Action | Method / path |
|--------|----------------|
| Health | `GET /partner/v1/health` |
| Embed config (publishable key) | `GET /partner/v1/embed-config` |
| Session | `POST /partner/v1/sessions` (secret) |
| Upsert product | `POST /partner/v1/products` (secret) |
| Try-on | `POST /tryon/{product_id}?async=true` (shopper JWT) |
| Async job status | `GET /tryon/jobs/{job_id}` (shopper JWT) |

---

## Support files in this repo

- `backend/app/routers/partner_v1.py` — Partner API  
- `packages/dressapp-web-sdk` — Browser SDK  
- `docs/partner/quickstart.md` — Expanded API examples  
