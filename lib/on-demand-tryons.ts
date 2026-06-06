/** On-demand try-on unit cost (USD) for merchant-facing estimates and billing copy. */
export const ON_DEMAND_TRYON_COST_USD = 0.16

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

/** Approximate extra try-ons for a prepaid budget at $0.16 per try-on. */
export function estimateOnDemandTryOnCount(budgetCents: number): number {
  if (!Number.isFinite(budgetCents) || budgetCents <= 0) return 0
  const budgetUsd = usdCentsToDollars(budgetCents)
  return Math.floor(budgetUsd / ON_DEMAND_TRYON_COST_USD)
}

export function estimateOnDemandTryOnRange(budgetCents: number): {
  minTryOns: number
  maxTryOns: number
} {
  const count = estimateOnDemandTryOnCount(budgetCents)
  return { minTryOns: count, maxTryOns: count }
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
