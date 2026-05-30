import type { PrimaryCategory } from "@/lib/onboarding-categories"

export type UserOnboardingProfile = {
  business_name: string | null
  primary_categories: PrimaryCategory[]
}

/** Trim whitespace and strip accidental trailing backslashes from stored values. */
export function normalizeBusinessName(
  raw: string | null | undefined,
): string | null {
  if (raw == null || typeof raw !== "string") return null
  const cleaned = raw.trim().replace(/\\+$/, "")
  return cleaned || null
}

export function isOnboardingComplete(
  profile: UserOnboardingProfile | null | undefined,
): boolean {
  if (!profile) return false
  const name = normalizeBusinessName(profile.business_name)
  const categories = profile.primary_categories
  return Boolean(name && categories.length > 0)
}
