export const PLAN_SLUGS = [
  "starter",
  "growth",
  "pro",
  "enterprise",
  "enterprise-plus",
] as const

export type PlanSlug = (typeof PLAN_SLUGS)[number]

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
