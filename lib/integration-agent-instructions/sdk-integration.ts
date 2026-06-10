import {
  DRESSAPP_PRODUCTION_API_BASE_URL,
  DRESSAPP_PRODUCTION_FRONTEND_BASE_URL,
} from "@/lib/dressapp-api-base"

export const SDK_AGENT_INSTRUCTIONS_FILENAME = "sdk integration.md"

export const SDK_AGENT_INSTRUCTIONS = `# DressApp SDK Integration - AI Agent Instructions

## Role
You are a senior integration engineer agent. Your job is to add DressApp virtual try-on to a merchant's web storefront with the same experience Shopify merchants get. The primary experience now lives **on the product page**: an inline **Try it on** button with size pills, Front/Back picker, inline progress cards, and a result modal - all without leaving the PDP. The floating widget (FAB + 3 tabs) is secondary and can be disabled by the merchant (PDP-only mode).

## Objective
Ship a working end-to-end flow on HTTPS: server creates shopper sessions and syncs products, frontend mounts the studio dock once, every product page binds its product (works on ANY URL structure), shopper creates a body model in the PDP modal on first try-on, then generates try-ons directly on the product page with size/color pickers, inline progress, and a result modal.

## Success criteria
- Secret key (dress_sk_...) exists only in server-side code and environment variables.
- Publishable key (dress_pk_...) and shopper access_token are the only DressApp credentials exposed to the browser.
- One backend route returns a shopper JWT (access_token) per visitor or logged-in user.
- Products are upserted via POST /partner/v1/products; dressApp product_id is stored next to each SKU.
- Frontend mounts the full dock (PartnerStudioDock or script bundle) - NOT the deprecated inline cream-card widget.
- Vite projects: Path A.1 bundler fix applied (dist aliases, React dedupe, overrides) before dock mount - no import or hook errors in console.
- Model creation runs inside the dock panel (no redirect to dressapp.me required).
- On product pages, externalProductId + fallbackSizesJson + fallbackColorsJson are always passed (even when productId is known) so resolve-product backfills the catalog and size/color pickers show. externalProductId can be any string SKU (max 128 chars) - it does not need to be numeric, and the PDP URL does NOT need to contain /products/.
- PDP shows an inline **Try it on** button (same as Shopify) above the first primary CTA that is not a size or color control, mounted via one of: a \`data-dressapp-pdp-tryon-block\` placeholder, a \`data-dressapp-pdp-anchor\` attribute on the buy button, or \`pdpAnchorSelector\`.
- The full PDP flow runs inline: model create modal on first try-on, size pills + Front/Back picker, stacked progress cards, result modal with lightbox - no dock open required.
- If the merchant has their own cart, \`DressApp.setAddToCartHandler\` is registered so the result modal shows "Add tried size to cart".
- SPA storefronts call \`DressApp.setProduct(...)\` on route changes so the widget rebinds without a full reload.
- Full manual test passes: session -> PDP Try it on -> create model in PDP modal -> try-on completes inline on a real product_id.
- UI matches Shopify widget: PDP button + pills chrome, and (when floating widget is enabled) branded FAB bottom-right with three tabs (Try on / My Model / My Try-ons).

## Constraints

DO:
- Store DRESSAPP_MERCHANT_SECRET (dress_sk_...) on the server only.
- Use a stable external_user_ref per shopper (logged-in customer id or persistent anonymous cookie id).
- Call POST /partner/v1/sessions and POST /partner/v1/products with Authorization: Bearer <secret_key>.
- Pass only the access_token JWT to the frontend.
- Register the merchant storefront URL in DressApp settings so the domain is allowed for SDK calls.
- Use PartnerStudioDock from @dressapp/react-widget (React) OR dressapp-partner-widget.js script bundle (no React).
- On Vite + React: apply Path A.1 (dist aliases, React dedupe, npm overrides) before mounting PartnerStudioDock.
- On product detail pages, always pass externalProductId + fallbackSizesJson + fallbackColorsJson (JSON strings from the live PDP). Pass productId too when you have it - resolve-product will backfill sizes/colors on the catalog row. Any PDP URL structure works (e.g. /p/blue-dress, /product/42) - passing the product explicitly is what marks the page as a product page.
- On PDP markup, give the Try it on button a mount point - ONE of: (a) \`<div data-dressapp-pdp-tryon-block></div>\` slot immediately above the first button or link that is not a size or color variant control (e.g. above Add to cart), (b) \`data-dressapp-pdp-anchor\` attribute on the Add to cart button/row (button injects above it), or (c) \`pdpAnchorSelector: "#add-to-cart"\` option / \`data-pdp-anchor-selector\` attr. Set \`mountPdpTryonButton\` on PartnerStudioDock (or rely on merchant embed-config when unset).
- If the storefront has a cart, register \`DressApp.setAddToCartHandler(async (item) => { ... }, { cartUrl: "/cart" })\` so shoppers can add the tried-on size to cart from the result modal. Throw an Error containing "out of stock" to surface the out-of-stock state.
- On SPA route changes, call \`DressApp.setProduct({ externalProductId, storeProductUrl })\` (or \`DressApp.setProduct({})\` when leaving product pages).
- Restart the server after changing environment variables.
- Use HTTPS in production.
- Surface API errors in logs; do not fail silently.

DON'T:
- Put dress_sk_... in client bundles, HTML, Git repos, or browser-accessible env vars.
- Call partner endpoints that require the secret key from the browser.
- Use DressAppWidget as the primary integration (deprecated; renders full dock but prefer PartnerStudioDock).
- Use openModelStudio redirect as the default first-time model flow when the dock is mounted.
- Hardcode product_id without syncing from POST /partner/v1/products.
- Pass only productId on PDP without externalProductId and fallback sizes/colors - the dock will not show size/color pickers if the catalog row is missing that data.
- Skip the PDP button mount point (block / anchor attr / selector) - without one on a non-Shopify theme, the inline Try it on button cannot render and shoppers only get the floating FAB (which the merchant may have disabled).
- Rely on a /products/ URL convention for product detection - explicit externalProductId/productId is the supported path on custom URLs.
- Build a custom add-to-cart UI for try-on results - register \`DressApp.setAddToCartHandler\` and let the result modal CTA call it.
- Ship a simplified inline card UI instead of the full floating dock.
- Ship without testing try-on on a real synced product_id.
- Mount PartnerStudioDock on Vite without Path A.1 - it will fail on import or React hooks.

## Prerequisites
- Merchant has an active DressApp plan with SDK access (all plans).
- Merchant publishable key: dress_pk_live_...
- Merchant secret key: dress_sk_live_...
- DressApp API base URL (production: ${DRESSAPP_PRODUCTION_API_BASE_URL}).
- DressApp frontend app URL (production: ${DRESSAPP_PRODUCTION_FRONTEND_BASE_URL}) for the partner widget script bundle.
- Storefront URL saved in DressApp Credentials settings (public site where try-on runs).
- Node/npm project (React path) OR plain HTML (script-tag path).

## Environment variables (server)
DRESSAPP_API_BASE_URL=${DRESSAPP_PRODUCTION_API_BASE_URL}
DRESSAPP_MERCHANT_SECRET=dress_sk_live_...

Optional (expose to browser via your framework's public env prefix):
DRESSAPP_PUBLISHABLE_KEY=dress_pk_live_...
NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY=dress_pk_live_...
NEXT_PUBLIC_DRESSAPP_API_BASE_URL=${DRESSAPP_PRODUCTION_API_BASE_URL}

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
  "image_urls": ["https://yoursite.com/img/1.jpg"],
  "sizes": ["XS", "S", "M", "L"],
  "colors": [{"label": "Navy"}, {"label": "Black", "hex": "#000000"}]
}

Persist the returned product_id alongside the merchant SKU for try-on calls. Even when product_id is stored, the frontend must still pass externalProductId + fallbackSizesJson + fallbackColorsJson on PDP so GET /partner/v1/embed/resolve-product can backfill sizes/colors if the catalog row is stale or incomplete.

Verify: At least one test SKU has a stored DressApp product_id.

### Step 4: Frontend - mount the full studio dock (recommended)

Choose ONE path:

#### Path A - React (npm)
Action:
npm install @dressapp/react-widget

##### Path A.1 - Vite bundler fix (REQUIRED - do this before mounting the dock)

\`@dressapp/react-widget\` and \`@dressapp/web-sdk\` publish only \`dist/\`, but their package.json \`development\` export points at missing \`src/\` files. Vite dev mode follows that broken export and fails with:

\`[plugin:vite:import-analysis] Failed to resolve import "@dressapp/react-widget"\`

The widget also pulls in its own React copy unless you force a single instance, which causes:

\`Invalid hook call\` / \`Cannot read properties of null (reading 'useState')\`

Apply ALL three fixes below in one pass - do not skip any.

**1) package.json - pin one React for the whole tree**

\`\`\`json
"overrides": {
  "react": "$react",
  "react-dom": "$react-dom"
}
\`\`\`

Run \`npm install\` after adding overrides.

**2) vite.config.ts - resolve dist, dedupe React, pre-bundle widget**

Create or replace \`vite.config.ts\` with:

\`\`\`ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    // Published @dressapp/* packages ship dist only; dev export points at missing src/.
    conditions: ["import", "module", "browser", "default"],
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "@dressapp/react-widget": path.resolve(
        __dirname,
        "node_modules/@dressapp/react-widget/dist/index.js",
      ),
      "@dressapp/web-sdk": path.resolve(
        __dirname,
        "node_modules/@dressapp/web-sdk/dist/index.js",
      ),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@dressapp/react-widget",
    ],
    rolldownOptions: {
      resolve: {
        alias: {
          react: path.resolve(__dirname, "node_modules/react"),
          "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
        },
      },
    },
  },
});
\`\`\`

If your project already has a \`server.proxy\` block (e.g. for \`/api\`), keep it - merge into the config above, do not remove it.

**3) Clear Vite cache and restart**

\`\`\`bash
rm -rf node_modules/.vite
npm run dev
\`\`\`

Hard refresh the browser after restart.

Verify: Dev server starts with no import-analysis error; browser console has no Invalid hook call; FAB renders bottom-right.

##### Path A.2 - Mount PartnerStudioDock

Add once near the app root (layout / app shell):

\`\`\`tsx
import { PartnerStudioDock } from "@dressapp/react-widget";

<PartnerStudioDock
  publishableKey="dress_pk_live_..."
  apiBase="${DRESSAPP_PRODUCTION_API_BASE_URL}"
  getAccessToken={async () => {
    const r = await fetch("/api/dressapp-session", { credentials: "include" });
    const j = await r.json();
    return j.access_token as string;
  }}
  productId={dressAppProductIdOnPdp}
  externalProductId={merchantSkuOrExternalId}
  storeProductUrl={window.location.href}
  fallbackSizesJson={JSON.stringify(["XS", "S", "M", "L"])}
  fallbackColorsJson={JSON.stringify([{ label: "Navy" }, { label: "Black" }])}
  bindProductIdFromProp
  mountPdpTryonButton
  // Optional instead of the slot div below: pdpAnchorSelector="#add-to-cart"
/>
\`\`\`

On the PDP template, add the try-on button mount slot **above the first primary CTA that is not a size or color control** (Add to cart, Buy now, etc.):

\`\`\`html
<div class="product-form__buttons">
  <div data-dressapp-pdp-tryon-block></div>
  <button type="submit" name="add">Add to cart</button>
</div>
\`\`\`

React example (actions area after variant pickers):

\`\`\`tsx
<div className="product-detail__actions">
  <div data-dressapp-pdp-tryon-block className="product-detail__tryon-slot" />
  <button type="button" className="btn btn--primary">Add to cart</button>
</div>
\`\`\`

\`mountPdpTryonButton\` hydrates that slot with the merchant-themed **Try it on** / **מדוד** button. The whole flow then runs inline on the PDP: size pills + Front/Back picker on press, model create modal when the shopper has no model yet, stacked progress cards below the button, and a result modal with lightbox when generation finishes.

Instead of the slot div you can also mark an existing element: add \`data-dressapp-pdp-anchor\` to your Add to cart button/row, or pass \`pdpAnchorSelector="#my-add-to-cart"\` on PartnerStudioDock - the button injects directly above that element. If no mount point exists at all, auto-inject only works on Shopify-style themes (\`/products/\` pages with standard buy-button markup).

On PDP: always pass externalProductId + fallbackSizesJson + fallbackColorsJson, even when productId is known. PartnerStudioDock calls GET /partner/v1/embed/resolve-product to map external_id → product_id and backfill sizes/colors on the catalog row. productId alone is not enough for size/color pickers.

For SPAs, derive the product from your router state (e.g. \`useMatch\` on your PDP route - not \`useParams\` outside \`<Routes>\`) and pass \`bindProductIdFromProp\` so the dock rebinds and clears product context when navigating. Any route pattern works; \`/products/:handle\` is not required.

**Next.js (not Vite):** add \`transpilePackages: ["@dressapp/react-widget", "@dressapp/web-sdk"]\` in \`next.config\` and webpack/turbopack resolve aliases to each package's \`dist/index.js\` plus the same React dedupe aliases. Same root cause applies.

#### Path B - Script tag (no React)
Action: Add mount node and load the partner bundle from the DressApp app host:

<div
  data-dressapp-widget
  data-publishable-key="dress_pk_live_..."
  data-api-base="${DRESSAPP_PRODUCTION_API_BASE_URL}"
  data-session-url="/api/dressapp-session"
  data-dressapp-product-id="12345"
  data-external-product-id="SKU-001"
  data-store-product-url="https://yoursite.com/p/blue-dress"
  data-fallback-title="Blue dress"
  data-fallback-image="https://yoursite.com/img/1.jpg"
  data-fallback-sizes='["XS","S","M","L"]'
  data-fallback-colors='[{"label":"Navy"},{"label":"Black"}]'
  data-pdp-anchor-selector="#add-to-cart"
></div>
<script type="module" src="${DRESSAPP_PRODUCTION_FRONTEND_BASE_URL}/partner/dressapp-partner-widget.js"></script>

Always include data-external-product-id + data-fallback-sizes + data-fallback-colors on PDP, even when data-dressapp-product-id is set. data-pdp-anchor-selector is optional - prefer a \`<div data-dressapp-pdp-tryon-block></div>\` slot or a \`data-dressapp-pdp-anchor\` attribute on the buy button.

#### Path C - web-sdk mount helper
Action:
npm install @dressapp/web-sdk

await DressApp.enable({
  publishableKey: "dress_pk_live_...",
  apiBase: "${DRESSAPP_PRODUCTION_API_BASE_URL}",
  accessToken: shopperJwt,
});

DressApp.mountStudioDock({
  sessionUrl: "/api/dressapp-session",
  productId: dressAppProductId,
  externalProductId: merchantSkuOrExternalId, // any string SKU; works on any URL
  storeProductUrl: window.location.href,
  fallbackTitle: "Blue dress",
  fallbackImageUrl: "https://yoursite.com/img/1.jpg",
  fallbackSizesJson: JSON.stringify(["XS", "S", "M", "L"]),
  fallbackColorsJson: JSON.stringify([{ label: "Navy" }, { label: "Black" }]),
  pdpAnchorSelector: "#add-to-cart", // optional: where the Try it on button injects
});

// Merchant cart hookup (result modal "Add tried size to cart" CTA):
DressApp.setAddToCartHandler(async ({ productPageUrl, sizeLabel, colorLabel, productId }) => {
  await myCart.add({ url: productPageUrl, size: sizeLabel, color: colorLabel });
  // throw new Error("out of stock") to show the out-of-stock state
}, { cartUrl: "/cart" });

// SPA navigation - rebind product without a full reload:
DressApp.setProduct({
  externalProductId: "SKU-002",
  storeProductUrl: location.href,
  fallbackSizesJson: JSON.stringify(["S", "M", "L"]),
  fallbackColorsJson: JSON.stringify([{ label: "White" }]),
});
DressApp.setProduct({}); // clear when leaving product pages

Verify: PDP Try it on button renders at your mount point; pressing it shows size pills + Front/Back; floating FAB appears bottom-right when the merchant has it enabled.

### Step 5: Frontend - first visit model creation
Action: No separate redirect flow needed; model creation happens on the product page.
1. Shopper without a model presses **Try it on** on the PDP - a centered, theme-matched model create modal opens (photos -> details -> model ready) without leaving the page.
2. Alternative entry: the floating dock's My Model tab offers the same wizard inside the panel (when the floating widget is enabled).
3. After the model is ready, the PDP button shows size pills + Front/Back and try-ons run inline.

Legacy alternative (headless/custom UI only): DressApp.openModelStudio({ returnUrl }) - not needed with PartnerStudioDock.

Verify: hasModel() returns true after completing the PDP modal flow; no redirect to dressapp.me required.

### Step 5b: Frontend - PDP product context (sizes & colors)
Action: On every product detail page, pass all of the following to the dock (React props or data-* attrs):
- externalProductId - your SKU or platform product id (same value as external_id in POST /partner/v1/products)
- fallbackSizesJson - JSON array string, e.g. \`["XS","S","M","L"]\`
- fallbackColorsJson - JSON array string, e.g. \`[{"label":"Navy"},{"label":"Black","hex":"#000000"}]\`
- storeProductUrl - canonical PDP URL (for optional storefront enrichment)
- productId - optional; pass when you already have the DressApp catalog id

The dock calls GET /partner/v1/embed/resolve-product?external_id=...&fallback_sizes=...&fallback_colors=... (publishable key). This maps external_id → product_id and backfills sizes/colors on existing catalog rows.

Verify: DevTools Network shows resolve-product with fallback_sizes and fallback_colors; PDP size pills and the dock Try on tab show size and color chips (not "auto size" only).

### Step 5c: Frontend - PDP inline Try it on button (primary experience)
Action: On every product detail page, give the button a mount point - ONE of:
1. \`<div data-dressapp-pdp-tryon-block></div>\` immediately **above** the first button or link that is not a size or color variant control (size/color chips, swatches, and variant pickers come first; then the try-on slot; then Add to cart / Buy now). Most reliable option.
2. \`data-dressapp-pdp-anchor\` attribute on your Add to cart button or buy-button row - the button injects directly above it.
3. \`pdpAnchorSelector\` prop / option / \`data-pdp-anchor-selector\` attr with a CSS selector for your Add to cart element.

Then on \`PartnerStudioDock\`, set \`mountPdpTryonButton\` (or omit it to follow merchant embed-config \`pdp_tryon_button_enabled\`; set \`mountPdpTryonButton={false}\` only when the merchant disabled the inline button).

Any PDP URL structure works - passing \`externalProductId\` (or \`productId\`) is what marks the page as a product page. Without a mount point, auto-inject only works on Shopify-style themes.

The button owns the full flow on-page: size pills (recommended + selected), Front/Back facing picker, model create modal for first-time shoppers, stacked inline progress cards, result modal with lightbox, and (when enabled) the Complete the Look strip.

Script-tag path: place the mount node in PDP HTML before the primary CTA; the bundle reads the same attributes.

Verify: PDP shows a full-width themed **Try it on** (or **מדוד** for Hebrew) button above Add to cart; pressing it shows size pills + Front/Back; picking an angle starts an inline try-on with a progress card; the result opens in a modal on the page.

### Step 5d: Frontend - add tried size to cart (non-Shopify stores)
Action: Register your cart implementation once, after \`DressApp.enable\` (or any time before the first try-on result):

DressApp.setAddToCartHandler(async ({ productPageUrl, sizeLabel, colorLabel, productId }) => {
  // Map productPageUrl/size/color to your variant and add it to your cart.
  // throw new Error("out of stock") to show the out-of-stock state on the CTA.
}, { cartUrl: "/cart" });

When registered, the try-on result modal and dock peek show **Add size X to cart**; success shows Added + a View cart link (omit cartUrl to hide the link). Without a handler, the CTA stays hidden on non-Shopify hosts.

Verify: After a try-on, the result modal shows the add-to-cart CTA; pressing it calls your handler with the tried size/color; the item lands in your cart.

### Step 6: Frontend - try-on
Action: With the dock mounted and PDP product context set (Step 5b):
1. On the PDP, press **Try it on** - size pills and the Front/Back picker appear.
2. Pick an angle - an inline progress card shows below the button; multiple runs stack.
3. When generation finishes, a result thumbnail strip appears under the button; tapping a thumbnail opens the result modal (image, fit line, add-to-cart CTA when wired).
4. Dock alternative (floating widget enabled): open the Try on tab, pick size/color/facing, tap Generate try-on; results also land in My Try-ons.

Headless alternative (custom UI only):
const job = await DressApp.requestTryOn(productId, { async: true });
DressApp.getTryOnJob(jobId)

Verify: Try-on image URL(s) appear in the dock history; same UX as Shopify storefront widget.

### Step 7: Ship and regression test
Action: On HTTPS staging or production, run full path: session -> PDP Try it on -> create model in PDP modal -> inline try-on on real product -> result modal (+ add-to-cart when wired). If the floating widget is enabled, also verify the dock (FAB, 3 tabs).

Verify: All success criteria at the top of this document are met; UI is not a simplified inline card.

## Merchant settings (automatic)
PartnerStudioDock loads widget settings from GET /partner/v1/embed-config:
- widget_scheme (color preset)
- widget_language (en/he)
- allow_out_of_stock_tryon
- tryon_size_filter settings
- pdp_tryon_button_enabled (inline PDP button; forced on when the floating widget is off)
- floating_widget_enabled (FAB + dock; off = PDP-only mode)
- pdp_tryon_facing_picker_enabled (Front/Back picker on the PDP button)
- outfit_suggestions_enabled (Complete the Look strip on the PDP)

Merchants change these on dressapp.me or via PATCH /partner/v1/merchants/me/storefront-settings (secret key). No extra proxy setup required for non-Shopify SDK merchants.

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
| Resolve / backfill product (PDP) | GET /partner/v1/embed/resolve-product | publishable key |
| Current model | GET /user-model/current | shopper access_token |
| Try-on | POST /tryon/{product_id}?async=true | shopper access_token |
| Job status | GET /tryon/jobs/{job_id} | shopper access_token |

## Troubleshooting
- CORS or domain errors: confirm storefront URL is saved in DressApp Credentials and matches browser origin.
- 401 on session route: check secret key and Authorization header format (Bearer dress_sk_...).
- Try-on fails with unknown product: confirm product_id came from POST /partner/v1/products or resolve-product, not external_id alone.
- Try on tab shows no size/color pickers (auto size only): pass externalProductId + fallbackSizesJson + fallbackColorsJson on PDP even when productId is set; confirm resolve-product request includes fallback_sizes and fallback_colors.
- No inline Try it on button on PDP: confirm a mount point exists (\`data-dressapp-pdp-tryon-block\` slot, \`data-dressapp-pdp-anchor\` attr, or \`pdpAnchorSelector\`), \`mountPdpTryonButton\` is not \`false\`, and the page passes \`externalProductId\` or \`productId\`. Check console for \`[dressapp-pdp-tryon-button]\` logs.
- No add-to-cart CTA in the result modal (non-Shopify store): register \`DressApp.setAddToCartHandler\` before try-ons; the CTA is hidden until a handler exists.
- Product context stuck after SPA navigation: call \`DressApp.setProduct({ externalProductId, storeProductUrl, ... })\` on route change (and \`DressApp.setProduct({})\` when leaving product pages).
- Simplified cream card UI instead of full dock: you mounted DressAppWidget or bare DressAppStudioDock without PartnerStudioDock - switch to PartnerStudioDock or script bundle.
- Tabs stacked / broken layout: ensure mount uses data-dressapp-widget on body with script bundle, or PartnerStudioDock at app root with fixed positioning.
- Env changes ignored: restart the server after updating .env.
- \`Failed to resolve import "@dressapp/react-widget"\` (Vite): you skipped Path A.1. Add the vite.config.ts aliases + \`conditions\` that skip the broken \`development\` export, alias both \`@dressapp/react-widget\` and \`@dressapp/web-sdk\` to their \`dist/index.js\`, then \`rm -rf node_modules/.vite\` and restart dev.
- \`Invalid hook call\` / \`useState\` is null (Vite + React): duplicate React copies. Apply Path A.1 in full: \`resolve.dedupe\`, React aliases in \`resolve.alias\` and \`optimizeDeps.rolldownOptions.resolve.alias\`, plus \`overrides\` in package.json. Clear \`node_modules/.vite\`, run \`npm install\`, restart dev, hard refresh.

## Stop condition
Stop when all success criteria pass on HTTPS with a real product: PDP Try it on button -> model create modal -> inline try-on with progress card -> result modal (with add-to-cart CTA when a handler is registered), matching the Shopify PDP experience - plus the floating dock (FAB, 3 tabs) when the merchant has it enabled. Report any blocked step with the exact API error body and the file/route you changed.
`