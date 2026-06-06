# Dogfood QA Report

**Target:** https://dressapp.me
**Date:** 2026-06-06
**Scope:** Full site exploratory QA (landing/home, navigation, features/pricing sections, contact area)
**Tester:** Hermes Agent (automated exploratory QA)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🟠 High | 3 |
| 🟡 Medium | 2 |
| 🔵 Low | 1 |
| **Total** | **6** |

**Overall Assessment:** The homepage is functionally loaded but has noticeable layout and content presentation issues, including a large missing content gap, awkward header typography, and pricing plan list rendering problems.

---

## Issues

### Issue #1: Hero headline wraps into 4 unbalanced lines

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Visual |
| **URL** | https://dressapp.me/ |

**Description:** The main H1 "Premium Virtual Try-ons for your store" wraps into four narrow lines, making the hero text column very tall and leaving excessive whitespace beside the product preview.

**Steps to Reproduce:**
1. Navigate to https://dressapp.me
2. View the hero heading in the top-left section

**Expected Behavior:** Heading should fit on two lines or be sized to maintain balanced hero proportions.

**Actual Behavior:** Heading breaks across four lines, creating a visually unbalanced layout.

**Screenshot:**
MEDIA:/Users/yotamfogel/.hermes/cache/screenshots/browser_screenshot_c5749b39f28c413494f306ae774113c9.png

---

### Issue #2: Large empty white gap in the middle of the page

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Visual / Content |
| **URL** | https://dressapp.me/ |

**Description:** There is a large expanse of empty white space between the "Accurate, realistic user models" section and the footer, with a faint empty container outline visible. A content section appears missing or failed to render.

**Steps to Reproduce:**
1. Navigate to https://dressapp.me
2. Scroll down past the features/how-it-works sections

**Expected Behavior:** Page should smoothly continue into appropriate content (social proof, FAQ, CTA, etc.) without a large blank area.

**Actual Behavior:** A large blank gap appears in the middle of the page, likely due to an empty or failed content container.

**Screenshot:**
MEDIA:/Users/yotamfogel/.hermes/cache/screenshots/browser_screenshot_836e4495adc845ba9fa5d7d7855dbbe8.png

---

### Issue #3: Pricing plan free-text list items appear empty in DOM

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Content |
| **URL** | https://dressapp.me/ |

**Description:** In the pricing section, the per-plan feature lists render as generic listitem entries with no visible text content in accessible output, preventing users from understanding differences between tiers through the DOM structure.

**Steps to Reproduce:**
1. Navigate to https://dressapp.me
2. Inspect the Pricing section list items

**Expected Behavior:** Each pricing plan should show readable feature bullets.

**Actual Behavior:** List items render with no inline text in the accessible snapshot, making plan comparisons unclear in structured content views.

**Screenshot:**
MEDIA:/Users/yotamfogel/.hermes/cache/screenshots/browser_screenshot_32220a4ef27d4ac2b41493ad0984640e.png

---

### Issue #4: Shell headings contain stage title with no descriptive text

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Content |
| **URL** | https://dressapp.me/ |

**Description:** The three-step and feature headings appear as section stage titles without immediately visible descriptive text in several places until expanded/re-rendered views are checked, making quick scanning harder.

**Steps to Reproduce:**
1. Navigate to https://dressapp.me
2. Read "Get started in three simple steps" and feature headings

**Expected Behavior:** Headings should include brief subtitles or descriptions directly below them.

**Actual Behavior:** Some headings appear as standalone titles with no visible associated explanatory text.

---

### Issue #5: Contact social links may open in same tab

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | UX |
| **URL** | https://dressapp.me/ |

**Description:** The footer social links likely lack `target="_blank"`/`rel` external-link behavior, causing users to leave the site on click.

**Steps to Reproduce:**
1. Navigate to https://dressapp.me
2. Click Twitter/LinkedIn/GitHub in the footer

**Expected Behavior:** External social links open in a new tab while preserving the current page.

**Actual Behavior:** Links can navigate away from the site instead of opening externally.

---

### Issue #6: “Try DressApp in our demo store” CTA has inconsistent presentation

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Visual / UX |
| **URL** | https://dressapp.me/ |

**Description:** The primary CTA appears both as a styled button and a text link on the same page, creating inconsistent visual treatment for the same action.

**Steps to Reproduce:**
1. Navigate to https://dressapp.me
2. Compare the CTA in the header vs hero section

**Expected Behavior:** Primary CTA should use a single consistent button or link style across the page.

**Actual Behavior:** The same CTA action is shown with different styling, which can confuse users about priority/behavior.

---

## Issues Summary Table

| # | Title | Severity | Category | URL |
|---|-------|----------|----------|-----|
| 1 | Hero headline wraps into 4 unbalanced lines | Medium | Visual | https://dressapp.me/ |
| 2 | Large empty white gap in the middle of the page | High | Visual / Content | https://dressapp.me/ |
| 3 | Pricing plan list items appear empty in DOM | High | Content | https://dressapp.me/ |
| 4 | Shell headings contain stage title with no descriptive text | Medium | Content | https://dressapp.me/ |
| 5 | Contact social links may open in same tab | Low | UX | https://dressapp.me/ |
| 6 | “Try DressApp in our demo store” CTA has inconsistent presentation | Low | Visual / UX | https://dressapp.me/ |

---

## Testing Coverage

### Pages Tested
- https://dressapp.me/ (homepage)

### Features Tested
- Header navigation links
- Primary hero content and sizes selector
- Demo CTA interaction flow
- How-it-works sections
- Features section
- Pricing section
- Contact section and footer links

### Not Tested / Out of Scope
- Pricing/plan flow links (`Choose Starter/Growth/Pro/Scale`)
- Demo store itself after CTA click
- Sign up / Log in flows
- Integrations page
- 404/error states
- Mobile responsiveness
- Cross-browser testing

### Blockers
- Browser automation entered a 502 CDP/WebSocket state partway through testing, limiting deeper flow automation. Issues above are based on DOM snapshots, vision analysis, and console checks from the accessible portion of the session.

---

## Notes

- No JavaScript console errors were observed in the sessions that did succeed.
- Reopening the browser session is recommended before verifying or fixing issues interactively.
