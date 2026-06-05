/** List USD per unit - public pricing; keep in sync with marketing copy. */
export const DRESSAPP_TRY_ON_USD = 0.37
export const DRESSAPP_USER_MODEL_USD = 0.6

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
