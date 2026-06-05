# DressApp Shopify integration

No-code install path for merchants: this folder holds the **Shopify app** that connects a shop to DressApp Partner API.

## What it does

1. OAuth install → receives Shopify Admin API access token.
2. Registers the shop with DressApp via `POST /partner/v1/platforms/shopify/install` (uses your **Partner secret key**).
3. Theme app extension (optional) injects the DressApp loader script on product pages.

## Prerequisites

- DressApp backend reachable from the internet (tunnel in dev: Cloudflare / ngrok).
- Partner merchant provisioned: `POST /partner/v1/admin/merchants` with `X-Partner-Admin-Secret` → save `secret_key` and `publishable_key`.
- Env vars (see `.env.example` in this folder):

| Variable | Purpose |
|----------|---------|
| `SHOPIFY_API_KEY` | From Shopify Partners app |
| `SHOPIFY_API_SECRET` | From Shopify Partners app |
| `SCOPES` | e.g. `read_products` (expand as needed) |
| `HOST` | Tunnel URL hosting this Node app |
| `DRESSAPP_API_BASE` | Your DressApp API origin (e.g. `https://dressapp.me`) |
| `DRESSAPP_PARTNER_SECRET_KEY` | `dress_sk_live_…` from Partner bootstrap |

## Development

```bash
cd integrations/shopify
npm install
npm run dev
```

Use Shopify CLI for tunnel + install URL (`shopify app dev`) once `shopify.app.toml` is configured for your Partner Dashboard app.

## Backend endpoints used

- `POST /partner/v1/platforms/shopify/install` - Bearer secret key; body `{ shop_domain, access_token }`.
- `GET /partner/v1/embed-config` - publishable key (used by storefront SDK).

## Files

- `server.mjs` - minimal OAuth + registration server (Node 18+).
- `shopify.app.toml` - template for Shopify CLI / Partners.
- `extensions/theme-app-extension/` - injects loader from `@dressapp/web-sdk` (see monorepo `packages/dressapp-web-sdk`).
