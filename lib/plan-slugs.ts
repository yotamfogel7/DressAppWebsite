export const PLAN_SLUGS = [
  "starter",
  "growth",
  "pro",
  "enterprise",
  "enterprise-plus",
] as const

/** Landing/onboarding free trial - not a paid PayPal plan. */
export const FREE_TRIAL_PLAN_SLUG = "free-trial" as const

export type PlanSlug = (typeof PLAN_SLUGS)[number]

export type PricingPlanSlug = PlanSlug | typeof FREE_TRIAL_PLAN_SLUG

export function isFreeTrialPlanSlug(
  value: string | null | undefined,
): boolean {
  if (value == null || typeof value !== "string") return false
  return value.trim().toLowerCase() === FREE_TRIAL_PLAN_SLUG
}

export function buildFreeTrialOnboardingPath(): string {
  return `/onboarding?intent=${FREE_TRIAL_PLAN_SLUG}`
}

export const PLAN_LABELS: Record<PlanSlug, string> = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
  enterprise: "Scale",
  "enterprise-plus": "Enterprise+",
}

export function isPlanSlug(value: string): value is PlanSlug {
  return (PLAN_SLUGS as readonly string[]).includes(value)
}

export function normalizePlanSlug(
  raw: string | null | undefined,
): PlanSlug | null {
  if (raw == null || typeof raw !== "string") return null
  const t = raw.trim().toLowerCase().replace(/\s+/g, "-")
  return isPlanSlug(t) ? t : null
}
