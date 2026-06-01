/** Estimated on-demand try-on unit cost range (USD) for merchant-facing estimates. */
export const ON_DEMAND_TRYON_COST_MIN_USD = 0.07
export const ON_DEMAND_TRYON_COST_MAX_USD = 0.11

/** Minimum prepaid top-up / budget (USD cents). */
export const ON_DEMAND_BUDGET_MIN_CENTS = 500

/** Maximum prepaid top-up / budget (USD cents). */
export const ON_DEMAND_BUDGET_MAX_CENTS = 500_000

export function usdCentsToDollars(cents: number): number {
  return cents / 100
}

export function dollarsToUsdCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdCentsToDollars(cents))
}

/** Approximate extra try-ons for a prepaid budget using $0.07-$0.11 per try-on. */
export function estimateOnDemandTryOnRange(budgetCents: number): {
  minTryOns: number
  maxTryOns: number
} {
  if (!Number.isFinite(budgetCents) || budgetCents <= 0) {
    return { minTryOns: 0, maxTryOns: 0 }
  }
  const budgetUsd = usdCentsToDollars(budgetCents)
  const maxTryOns = Math.floor(budgetUsd / ON_DEMAND_TRYON_COST_MIN_USD)
  const minTryOns = Math.floor(budgetUsd / ON_DEMAND_TRYON_COST_MAX_USD)
  return { minTryOns, maxTryOns }
}

export function parseBudgetUsdInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/^\$/, "")
  if (!trimmed) return null
  const n = Number.parseFloat(trimmed)
  if (!Number.isFinite(n) || n <= 0) return null
  return dollarsToUsdCents(n)
}

export function validateBudgetCents(cents: number): string | null {
  if (!Number.isInteger(cents) || cents < ON_DEMAND_BUDGET_MIN_CENTS) {
    return `Minimum budget is ${formatUsdFromCents(ON_DEMAND_BUDGET_MIN_CENTS)}.`
  }
  if (cents > ON_DEMAND_BUDGET_MAX_CENTS) {
    return `Maximum budget is ${formatUsdFromCents(ON_DEMAND_BUDGET_MAX_CENTS)}.`
  }
  return null
}
