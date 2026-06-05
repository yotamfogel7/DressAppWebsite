import { getUserOnboardingProfile } from "@/lib/auth-db"
import { isOnboardingComplete } from "@/lib/onboarding"
import { userCanAccessProduct } from "@/lib/user-active-plan"

export async function isUserFullyOnboardedInDb(
  userId: string,
): Promise<boolean> {
  const profile = await getUserOnboardingProfile(userId)
  if (!isOnboardingComplete(profile)) {
    return false
  }
  return userCanAccessProduct(userId)
}
