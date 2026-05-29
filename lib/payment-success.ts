export const FRESH_PLAN_PURCHASE_KEY = "dressapp:fresh-plan-purchase"

export function markFreshPlanPurchase(): void {
  try {
    window.sessionStorage.setItem(FRESH_PLAN_PURCHASE_KEY, "1")
  } catch {
    // ignore storage failures
  }
}

export function consumeFreshPlanPurchase(): boolean {
  if (typeof window === "undefined") return false
  try {
    const fresh = window.sessionStorage.getItem(FRESH_PLAN_PURCHASE_KEY) === "1"
    if (fresh) window.sessionStorage.removeItem(FRESH_PLAN_PURCHASE_KEY)
    return fresh
  } catch {
    return false
  }
}
