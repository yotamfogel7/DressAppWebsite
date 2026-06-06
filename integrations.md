# Try-on integration guide

Three ways to add DressApp virtual try-on to a store. Pick the path that matches how you sell.

| Method | Best for | You write code? |
|--------|----------|-----------------|
| **Shopify App** | Shopify merchants | Almost none (install + theme block) |
| **SDK** | Your own website or app shell | A little (one backend route + a JS snippet) |
| **API** | Mobile apps, headless stacks, full custom UI | Yes (you call REST endpoints yourself) |

All three use the same try-on engine. The difference is how much DressApp handles for you.

---

## How it works (all paths)

Every shopper needs two things before try-on works:

1. **Identity** - a short-lived token that ties them to their digital model.
2. **Catalog** - each product you want to try on must exist in DressApp with a `product_id`.

First-time shoppers also need a **digital model** (photos + measurements). After that, try-on is one click.

Your **secret key** stays on your server. The browser only ever sees the **publishable key** and the shopper token.

---

## 1. Shopify App

For stores on Shopify. Install from the App Store, turn on a theme block, done.

### What DressApp handles for you

- Creates your merchant account on first install (no manual API signup).
- Syncs products from Shopify.
- Mints shopper sessions through Shopify's app proxy (no secret key in the theme).

### Steps

1. **Install the app** from the Shopify App Store (or use the dev install link while testing).
2. **Approve permissions** when Shopify asks - the app needs product access and the app proxy.
3. **Open Online Store → Themes → Customize.**
4. **On a product template**, add the **DressApp Try-On** block and save.
5. **Optional:** under Theme settings → App embeds, turn on **Storefront components (Shopify)** if your theme shows console warnings about `shopify-account`.
6. **Test on a live product page** - open the storefront (not Admin), click try-on, create a model if prompted, generate a try-on.

### Quick sanity check

Visit this URL on your storefront (replace with your shop domain):

`https://YOUR-STORE.myshopify.com/apps/dressapp/session`

You should see JSON with an `access_token`. If you get a 404, the app proxy is not set up yet - reinstall or redeploy the app config.

### Merchant setup (DressApp team / self-host only)

If you run the Shopify app yourself (not the public listing):

1. Point `DRESSAPP_API_BASE` at your DressApp API.
2. Set `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, and `HOST` in `integrations/shopify/.env`.
3. Run `shopify app dev` or deploy so OAuth, webhooks, and the app proxy are live.
4. Build the storefront widget: from `frontend/`, run `npm run build` so `/partner/dressapp-react-widget.js` exists on your deployed site.

More detail: [integrations/shopify/README.md](../../integrations/shopify/README.md)

---

## 2. SDK

For any website you control. DressApp ships a browser SDK that wraps sessions, model studio, and try-on calls.

Packages:

- **`@dressapp/web-sdk`** - lightweight JS (`DressApp.enable()`, try-on buttons, model studio redirect).
- **`@dressapp/react-widget`** - React components (floating studio dock, inline PDP widget). Built on the web SDK.

### Steps

1. **Get keys.** DressApp ops creates a merchant (`POST /partner/v1/admin/merchants`). You receive a **secret key** (`dress_sk_…`) and **publishable key** (`dress_pk_…`). Store the secret in your secrets manager.

2. **Allow your domain.** Add your storefront origin to the merchant's `allowed_origins`, or ask DressApp to add it to `PARTNER_CORS_ORIGINS` on the API.

3. **Backend: shopper session.** Add one route on your server, for example `GET /api/dressapp-session`. It calls DressApp with your secret key:

   `POST /partner/v1/sessions`  
   Body: `{ "external_user_ref": "<stable shopper id>" }`  
   Return the `access_token` to your frontend.

   Use your logged-in customer ID, or a persistent anonymous cookie ID for guests.

4. **Backend: product sync.** When products are created or updated, call:

   `POST /partner/v1/products`  
   Same secret key. Include your SKU as `external_id`, plus title, URL, and image URLs.

   Save the returned **`product_id`** next to that SKU in your database.

5. **Frontend: install the SDK.**

   ```bash
   npm install @dressapp/web-sdk
   ```

   Or for React:

   ```bash
   npm install @dressapp/react-widget
   ```

6. **Frontend: enable DressApp** after you fetch the shopper token from your backend:

   ```ts
   import { DressApp } from "@dressapp/web-sdk";

   await DressApp.enable({
     publishableKey: "dress_pk_live_…",
     apiBase: "https://api.dressapp.me",
     accessToken: shopperJwt,
   });
   ```

7. **First visit - no model yet.** Check `await DressApp.hasModel()`. If false, show a "Create my model" button that opens:

   `DressApp.openModelStudio({ returnUrl: window.location.href })`

   The shopper finishes photos on DressApp, then clicks **Continue to store** to come back.

8. **Try-on.** When `hasModel()` is true, call:

   `await DressApp.requestTryOn(productId, { async: true })`

   Poll `DressApp.getTryOnJob(jobId)` until the job completes, or register webhooks on your server (optional).

9. **Ship it.** Test the full path on HTTPS: session → model → return → try-on on a real product.

React shortcut: drop `<DressAppStudioDock />` or `<DressAppWidget productId={…} />` from `@dressapp/react-widget` instead of wiring every button yourself. Same backend requirements.

More detail: [INTEGRATION_MANUAL.md](./INTEGRATION_MANUAL.md) · [packages/dressapp-react-widget/README.md](../../packages/dressapp-react-widget/README.md)

---

## 3. API

For teams building their own UI - mobile apps, server-rendered sites, or anything that does not want our JS bundle. You call the same REST endpoints the SDK uses under the hood.

### Steps

1. **Get keys** - same as SDK step 1 (`POST /partner/v1/admin/merchants` → secret + publishable keys).

2. **Allow your domain** - same as SDK step 2 (CORS / `allowed_origins`).

3. **Create shopper sessions (server only).**

   ```
   POST /partner/v1/sessions
   Authorization: Bearer dress_sk_live_…
   { "external_user_ref": "customer-12345" }
   ```

   Response: `{ "access_token": "…" }` - a JWT. Never send the secret key to the client; only pass this token.

4. **Sync catalog (server only).**

   ```
   POST /partner/v1/products
   Authorization: Bearer dress_sk_live_…
   {
     "external_id": "SKU-001",
     "title": "Blue dress",
     "url": "https://yoursite.com/p/blue-dress",
     "image_urls": ["https://yoursite.com/img/1.jpg"],
     "gender": "women"
   }
   ```

   Store the returned `product_id` for try-on calls.

5. **Check if the shopper has a model.**

   ```
   GET /user-model/current
   Authorization: Bearer <shopper access_token>
   ```

   `null` or empty → they need onboarding first.

6. **Model creation.** Send the shopper to DressApp's model studio:

   ```
   GET /embed/model-studio?access_token=<token>&partner_return=https://yoursite.com/return
   ```

   Or build the onboarding URL from `GET /partner/v1/embed-config` (publishable key) → use `public_app_url` + `/onboarding?access_token=…`.

   They upload photos and measurements on DressApp. When done, redirect back to your site.

7. **Start a try-on (async recommended).**

   ```
   POST /tryon/{product_id}?async=true
   Authorization: Bearer <shopper access_token>
   ```

   Response (HTTP 202): `{ "job_id": "…" }`

8. **Poll for the result.**

   ```
   GET /tryon/jobs/{job_id}
   Authorization: Bearer <shopper access_token>
   ```

   When status is `completed`, the response includes image URL(s). Show them in your UI.

   **Alternative:** register webhooks (`POST /partner/v1/webhooks`) for `tryon.job.completed` / `tryon.job.failed` and skip polling.

9. **Optional extras.**

   - Try-on history: `GET /tryon/history`
   - Usage / quota: `GET /partner/v1/merchants/me/usage` (secret key)
   - Bill Gemini on your Google project: `PUT /partner/v1/integrations/google-api-key`

10. **Verify before launch** - HTTPS everywhere, secret key never in client code, one full test run end to end.

More detail: [quickstart.md](./quickstart.md) · [certification.md](./certification.md)

---

## Which path should I pick?

- **On Shopify and don't want to code?** → Shopify App.
- **Custom website and you want the fastest integration?** → SDK (or React widget).
- **Mobile app, or you need full control over every screen?** → API.

You can combine them. A Shopify store uses the app; a separate headless storefront for the same brand would use SDK or API with the same merchant keys.

---

## Need help?

| Topic | Doc |
|-------|-----|
| Full SDK walkthrough | [INTEGRATION_MANUAL.md](./INTEGRATION_MANUAL.md) |
| API examples | [quickstart.md](./quickstart.md) |
| Pre-launch checklist | [certification.md](./certification.md) |
| Shopify dev setup | [integrations/shopify/README.md](../../integrations/shopify/README.md) |
