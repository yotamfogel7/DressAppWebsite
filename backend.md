# Partner API: merchant usage (backend spec)

This document describes what the DressApp **partner API** (or a dedicated analytics service behind the same auth) must expose so the marketing site **Usage** page can show aggregate counts and the frontend can compute **estimated spend** from public list prices.

The **main site** calls this endpoint from the browser using the merchant **secret** key unless you add a same-origin proxy (recommended for production) - see [Security](#security).

---

## Endpoint

`GET /partner/v1/merchants/me/usage`

- **Auth:** `Authorization: Bearer <merchant_secret_key>` (`dress_sk_…`), same as other partner routes. **Also** send the merchant dashboard password from merchant creation: header `X-Merchant-Password: <password>` (same value as `password` on `POST /partner/v1/admin/merchants`). The API must accept this header on `GET` and include it in **CORS** `Access-Control-Allow-Headers` when the Usage page calls the API from the browser.
- **Success:** `200` + JSON body (schema below).
- **Errors:** Use normal partner API error JSON; the frontend surfaces status and body for debugging.

### Optional query parameters (v1 optional; safe to ignore)

| Query | Meaning |
|--------|--------|
| `from` | ISO-8601 instant; include usage on or after this time (inclusive). |
| `to` | ISO-8601 instant; include usage on or before this time (inclusive). |

If omitted, return **all-time** aggregates for the merchant (or your agreed default window, e.g. current billing month - document the default in API docs if not all-time).

---

## Response JSON (required fields)

All integer counts are **non-negative**. Omitting a field should be treated as invalid; return explicit zeros when there is no usage.

| Field | Type | Description |
|--------|------|--------------|
| `try_on_count` | integer | Total **completed, billable** virtual try-ons for this merchant (see [Semantics](#semantics)). |
| `user_model_generation_count` | integer | Total **completed, billable** user model generations (including refreshes if you bill them the same way). |
| `users_with_model_count` | integer | Count of **distinct users** who have at least one completed model generation for this merchant. |
| `users_with_try_on_count` | integer | Count of **distinct users** who have at least one completed try-on for this merchant. |

### Optional transparency fields

| Field | Type | Description |
|--------|------|--------------|
| `merchant_id` | string | Internal or external merchant identifier. |
| `period_from` | string (ISO-8601) | Effective start of the aggregated window. |
| `period_to` | string (ISO-8601) | Effective end of the aggregated window. |

Example:

```json
{
  "try_on_count": 1240,
  "user_model_generation_count": 380,
  "users_with_model_count": 310,
  "users_with_try_on_count": 290,
  "merchant_id": "mcht_abc123",
  "period_from": "2026-01-01T00:00:00.000Z",
  "period_to": "2026-05-11T23:59:59.999Z"
}
```

---

## Semantics

- **User (distinct):** The same stable identity you use for partner sessions - e.g. `external_user_ref` from `POST /partner/v1/sessions`, or your internal shopper id keyed to that merchant. Two different `external_user_ref` values count as two users.
- **Try-on (`try_on_count`):** Increment only when a try-on **succeeds** and would be counted toward usage-based billing (align with your invoice line item for “virtual try-on”).
- **User model generation (`user_model_generation_count`):** Increment when a **user model / digital twin** job **succeeds** and would be billed as a model line item (including refresh if you bill refreshes).
- **`users_with_model_count`:** Distinct users with ≥1 successful model generation (lifetime or within the requested window, consistently with the counts above).
- **`users_with_try_on_count`:** Distinct users with ≥1 successful try-on (same window rule).

---

## CORS

If merchants load the Usage page on **this marketing domain** and the browser calls the API **directly**, the API must send appropriate **CORS** headers for `GET` with `Authorization` and **`X-Merchant-Password`** from that origin (preflight must allow both request headers - or use a wildcard policy only if acceptable for your threat model).

If CORS is not desired for browser calls, merchants should deploy a **small BFF** (same origin as their storefront or ops tool) that holds the secret server-side and proxies `GET …/usage` with `Authorization: Bearer …`. The marketing-site UI can later be pointed at that proxy via configuration.

---

## Security

- The **merchant secret** must never be logged server-side in clear text or committed to repos.
- **Browser usage:** Convenient for internal checks; for production partner dashboards, prefer **server-side** proxying so the secret is not stored in page scripts or extension-accessible memory longer than necessary.
- Apply **rate limiting** on this endpoint per merchant key to reduce brute-force and enumeration risk.

---

## Non-goals (v1)

- Per-SKU or per-product breakdown.
- Sub-second real-time; eventual consistency (e.g. few minutes lag) is acceptable if documented.

---

## Frontend reference

The main site expects:

- **URL:** `{DRESSAPP_API_BASE}/partner/v1/merchants/me/usage` (no trailing slash on base).
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <dress_sk_…>` and `X-Merchant-Password: <merchant_dashboard_password>`

Estimated USD on the client uses list prices from [`lib/dressapp-usage-pricing.ts`](lib/dressapp-usage-pricing.ts) (must stay aligned with public pricing copy).
