import type { PlanSlug } from "@/lib/plan-slugs"

/** Pro+ plans may use the direct REST API (same DressApp partner endpoints). */
const API_ACCESS_PLANS = new Set<PlanSlug>(["pro", "enterprise", "enterprise-plus"])

export function planApiAccessAllowed(planSlug: PlanSlug | null): boolean {
  if (!planSlug) return false
  return API_ACCESS_PLANS.has(planSlug)
}

/** All plans may use the JavaScript SDK. */
export function planSdkAccessAllowed(
  _planSlug?: PlanSlug | null,
  _onSignupTrial = false,
): boolean {
  return true
}
