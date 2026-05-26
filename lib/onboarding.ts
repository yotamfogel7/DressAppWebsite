import type { PrimaryCategory } from "@/lib/onboarding-categories"

export type UserOnboardingProfile = {
  business_name: string | null
  primary_categories: PrimaryCategory[]
}

export function isOnboardingComplete(
  profile: UserOnboardingProfile | null | undefined,
): boolean {
  if (!profile) return false
  const name = profile.business_name?.trim()
  const categories = profile.primary_categories
  return Boolean(name && categories.length > 0)
}
