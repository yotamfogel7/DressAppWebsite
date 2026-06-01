import { auth } from "@/auth"
import { userHasActivePlan } from "@/lib/user-active-plan"

export async function getPostAuthRedirectPath(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    return "/login"
  }
  if (!session.user.onboardingComplete) {
    return "/onboarding"
  }
  if (await userHasActivePlan(session.user.id)) {
    return "/settings"
  }
  return "/onboarding"
}
