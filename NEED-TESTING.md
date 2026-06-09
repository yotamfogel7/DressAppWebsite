## Partner outreach credibility (landing page)
1. CTA copy says "Now onboarding design partners" - no "hundreds of brands" language anywhere on the page.
2. Footer has only working links (Features, Pricing, Integrations, Privacy, Terms) - no dead `#` links or social icons.
3. Contact section shows `support@dressapp.me` (not Gmail) and Instagram displays `dressapp.me`.
4. Click **Schedule a demo** - opens mailto to support@dressapp.me (or Calendly after URL is set in `.env`).
5. Hero loads with content visible immediately (no multi-second blank gradient).
6. Hero try-on demo loads on size **L** with "GOOD FIT - A BIT OVERSIZED" matching "Recommended size: L".
7. **Generate user model** works on first click (no blank panel flash).
8. `dressapp.ai` redirects to `dressapp.me` after deploy (requires DNS on same Vercel project).
9. Vercel Web Analytics enabled in project settings - no console error on load.

## Hero try-on demo
1. Click each size pill (XS–XL) and confirm the fit label under the try-on image matches the new bands (e.g. "VERY SMALL - EXTREMELY TIGHT" for XS, "GOOD FIT - JUST YOUR SIZE" for M) and colors look right (red for XS/XL, amber for S, green for M/L).

## Storefront widget colors
1. Go to Settings > General > Storefront widget colors and confirm the live preview shows the real DressApp FAB icon (not a generic person icon).
2. Switch between DressApp night, Soft day, and Dawn - the FAB icon, dock panel colors, and product page **Try it on** button should update immediately in the preview.
3. Confirm the preview is only as wide as its content (product card + 10px gap + dock), not stretched across the column. Product card has a photo, normal **Try it on** button, and **Add to cart** stub; dock + FAB sit on the right.
4. Hover widget UI controls (tabs, **View model**, size pills, **Generate try-on**, FAB) - cursor should be pointer and elements should brighten or scale slightly.
5. Hover product card **Try it on** and **Add to cart** buttons - cursor should be pointer; **Try it on** brightens, **Add to cart** gets a slightly darker gray background on hover. Both should press down slightly on click.
6. Confirm the dock header shows only **DressApp** (no "Your model is ready" line).
7. Confirm tab order is **My model**, **My try-ons**, **Try on** (left to right) and each tab is clickable with its own preview content.
8. Switch color scheme while on **My try-ons** or **Try on** - preview should reset to **My model**.
9. Save a scheme and confirm it persists after reload.

## On-demand try-ons billing
0. Go to Settings > Billing and confirm the top card always shows your plan state: paid plan, **Free trial**, or **No plan selected** with a **Choose a plan** / **Change plan** button.
1. Go to Settings > Billing and confirm the budget helper text says: "Insert a value between $5 and $5,000… Each try-on costs $0.16".
2. Enter $25.00 as monthly budget - estimated try-ons should show **156** (25 / 0.16).
3. After plan cap is reached, top up wallet and confirm each on-demand try-on deducts **$0.16** from balance (check wallet balance before/after one try-on).

## Credentials
6. Go to Settings > Credentials and confirm only merchant keys (publishable + secret) are shown - no Storefront URL section.

## SDK Merchant Storefront Settings
2. Go to Settings > General > Storefront behavior and verify the layout: 3 settings stacked vertically (full-width card), icon chips on the left, label + control grouped on each row (control sits next to text, not at far edge).
3. Verify 3 settings appear: "Widget language", "Allow try-on for out-of-stock sizes", and "Show Try it on button on product pages".
4. Confirm inline examples sit to the right of each toggle: grayed-out **XL** size pills for out-of-stock, and a mini **Try it on** button for the PDP toggle.
5. Language control is a segmented button group (English/Hebrew, shared border, dark fill on active).
6. Toggle each setting, save, and confirm the page reloads with the saved values.
7. Verify the DressApp backend GET /partner/v1/embed-config reflects the updated settings (check widget_language, allow_out_of_stock_tryon, pdp_tryon_button_enabled).
8. Verify widget color save also syncs to backend embed-config (widget_scheme field).
