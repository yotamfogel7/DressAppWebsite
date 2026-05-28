import type { PlanSlug } from "@/lib/plan-slugs"
import { PLAN_LABELS } from "@/lib/plan-slugs"

/** Monthly try-on allowance per plan (matches public pricing copy). */
export const PLAN_MONTHLY_TRY_ON_ALLOWANCE: Record<PlanSlug, number | null> = {
  starter: 150,
  growth: 450,
  pro: 950,
  enterprise: 2500,
  "enterprise-plus": null,
}

export function getPlanMonthlyTryOnAllowance(slug: PlanSlug | null): number | null {
  if (!slug) return null
  return PLAN_MONTHLY_TRY_ON_ALLOWANCE[slug] ?? null
}

export function getPlanLabel(slug: PlanSlug | null): string | null {
  if (!slug) return null
  return PLAN_LABELS[slug] ?? null
}
