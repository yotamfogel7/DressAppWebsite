# On-demand try-on billing - backend implementation handoff

This document describes what the **DressApp Main Site** already implements and what the **DressApp API/backend repo** must implement for prepaid on-demand try-ons to work end-to-end.

## Product rules

1. On-demand try-ons are **disabled by default** for every merchant.
2. Merchants **cannot enable** on-demand or set a monthly on-demand budget until **included plan try-ons for the current period are fully used** (`used >= plan_monthly_allowance`).
3. After the cap, merchants may:
   - Enable on-demand try-ons.
   - Set a **monthly on-demand budget** (spend cap for the period).
   - **Prepay** via PayPal top-up (Main Site captures payment, then credits wallet via admin API).
4. Extra try-ons run only while **prepaid wallet balance > 0** and **period spend < monthly budget**.
5. No fake wallet state. If billing cannot be loaded, return an error.

## Main Site (already implemented)

### UI

- Settings → **Billing** (`/settings/billing`)
- Toggle on-demand (off by default), monthly budget input, wallet summary, PayPal top-up
- Locked UI until plan cap reached; shows estimated try-ons at **$0.07–$0.11** per try-on
- Usage sidebar links to Billing when plan cap is reached (`remaining === 0`)

### APIs (Main Site)

| Route | Purpose |
|--------|---------|
| `GET /api/settings/on-demand-tryons` | Proxy wallet status + plan usage |
| `PATCH /api/settings/on-demand-tryons` | Enable/disable + set `monthly_budget_cents` (guards cap locally) |
| `POST /api/billing/on-demand-tryons/create-order` | PayPal order for top-up amount |
| `POST /api/billing/on-demand-tryons/capture-order` | Capture PayPal → credit wallet via admin API |

### Libraries

- `lib/on-demand-tryons.ts` - budget limits, USD helpers, try-on estimates
- `lib/dressapp-monthly-usage.ts` - UTC month `try_on_count` from usage API
- `lib/dressapp-on-demand-wallet.ts` - client for wallet GET/PATCH and admin credit
- `lib/paypal.ts` - `createPayPalOrderForAmount`, `capturePayPalOrder`

### Expected DressApp partner endpoints (backend must implement)

#### `GET /partner/v1/merchants/me/on-demand-tryons`

Auth: merchant secret (`Authorization: Bearer dress_sk_…`) + optional `X-Merchant-Password`.

Response JSON (snake_case):

```json
{
  "enabled": false,
  "cap_reached": true,
  "plan_monthly_allowance": 450,
  "used_this_month": 450,
  "remaining_plan_tryons": 0,
  "monthly_budget_cents": 5000,
  "balance_cents": 2500,
  "spent_this_period_cents": 1200,
  "period_start": "2026-05-01T00:00:00.000Z",
  "period_end": "2026-05-31T23:59:59.999Z",
  "unit_cost_cents": 9,
  "merchant_id": "mcht_abc123"
}
```

- `enabled`: default `false`.
- `cap_reached`: `true` when included plan try-ons for the period are exhausted (backend should compute from plan + usage, not trust Main Site).
- `merchant_id`: required for PayPal credit path from Main Site.

#### `PATCH /partner/v1/merchants/me/on-demand-tryons`

Body:

```json
{ "enabled": true, "monthly_budget_cents": 5000 }
```

Rules:

- Reject with **403** if `cap_reached` is false.
- Reject enabling without a valid `monthly_budget_cents` if your product requires it.
- Validate budget min/max (Main Site uses $5–$5000).

#### `POST /partner/v1/admin/merchants/{merchant_id}/on-demand-wallet/credits`

Auth: `X-Partner-Admin-Secret` (not merchant key).

Body:

```json
{
  "amount_cents": 5000,
  "paypal_capture_id": "CAPTURE_ID",
  "idempotency_key": "paypal:CAPTURE_ID"
}
```

Rules:

- Idempotent on `idempotency_key` or `paypal_capture_id`.
- Increase `balance_cents`; append ledger row.
- Return `{ "balance_cents": 7500 }` (and optional ledger id).

### Try-on job enforcement (critical)

In try-on creation (before queueing work):

1. If `used_this_month < plan_allowance` → allow; bill as included (existing behavior).
2. Else if `cap_reached`:
   - Require `enabled === true`.
   - Require `balance_cents >= unit_cost_cents` (or reservation amount).
   - Require `spent_this_period_cents + cost <= monthly_budget_cents`.
   - **Atomically** reserve/debit wallet (row lock on wallet).
3. On job **failure** after debit → refund/release in ledger.
4. On success → finalize debit if using reserve/release pattern.
5. If wallet or budget exhausted → **403/402** with clear error JSON (`error` field).

Suggested env: `ON_DEMAND_TRYON_UNIT_COST_CENTS` (e.g. `9` for $0.09). Expose as `unit_cost_cents` in GET wallet.

### Data model (backend)

**`merchant_on_demand_wallets`**

| Column | Type | Notes |
|--------|------|--------|
| merchant_id | PK/FK | |
| enabled | bool | default false |
| monthly_budget_cents | int | default 0 |
| balance_cents | int | prepaid funds |
| spent_this_period_cents | int | on-demand spend in period |
| period_start / period_end | timestamptz | align with billing month |
| updated_at | timestamptz | |

**`merchant_on_demand_ledger`** (append-only)

| Column | Notes |
|--------|--------|
| id | |
| merchant_id | |
| type | `credit`, `debit`, `reserve`, `release`, `refund` |
| amount_cents | |
| paypal_capture_id | nullable |
| idempotency_key | unique |
| try_on_job_id | nullable |
| created_at | |

### Plan allowance sync

Main Site uses hardcoded allowances in `lib/plan-try-on-allowance.ts`. Backend should either:

- Store plan tier per merchant at creation/subscription time, or
- Accept plan from a future sync webhook.

Until synced, backend can mirror the same numbers per plan slug or use a default from merchant metadata.

### Errors

Use consistent JSON: `{ "error": "human-readable message" }`.

Main Site surfaces these in Billing UI and does not invent wallet balances on failure.

## Suggested implementation prompt (for backend repo)

Implement prepaid on-demand try-on billing. It must be disabled by default, locked until a merchant reaches the current monthly plan try-on cap, then allow prepaid wallet top-ups and extra try-ons until the prepaid budget is exhausted. Add authoritative wallet tables, ledger entries, partner/admin endpoints, and atomic enforcement in try-on job creation. Use $0.07–$0.11 per try-on for UI estimates, but expose one authoritative `unit_cost_cents`. Do not allow client-side-only enforcement or fake fallback data. Return clear errors when wallet state, plan usage, or billing state cannot be loaded.

## Verification checklist (backend)

- [ ] New merchant: `enabled=false`, cannot PATCH enable before cap
- [ ] At cap: PATCH enable + budget succeeds
- [ ] Top-up credit idempotent (duplicate capture id)
- [ ] Try-on at cap with wallet off → blocked
- [ ] Try-on at cap with wallet on + balance → succeeds; balance decreases
- [ ] Concurrent try-ons cannot overspend balance or budget
- [ ] Failed job refunds reservation

## Verification checklist (Main Site)

- [ ] Billing page locked below cap
- [ ] Billing unlocks at cap (when backend returns `cap_reached: true`)
- [ ] PayPal top-up create/capture errors shown clearly
- [ ] Wallet unavailable shows destructive alert (no fake numbers)
