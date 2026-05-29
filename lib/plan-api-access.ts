import type { PlanSlug } from "@/lib/plan-slugs"

/** Pro+ plans may use the JavaScript SDK and direct REST API (same DressApp partner endpoints). */
const API_ACCESS_PLANS = new Set<PlanSlug>(["pro", "enterprise", "enterprise-plus"])

export function planApiAccessAllowed(planSlug: PlanSlug | null): boolean {
  if (!planSlug) return false
  return API_ACCESS_PLANS.has(planSlug)
}
