import { auth } from "@/auth"
import {
  buildOnboardingRedirectPath,
  isSafeInternalPath,
} from "@/lib/onboarding-access"
import { resolveSessionUser } from "@/lib/session-user"
import { userCanAccessProduct } from "@/lib/user-active-plan"

export async function getPostAuthRedirectPath(
  nextPath?: string | null,
): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    return "/login"
  }
  if (!session.user.onboardingComplete) {
    return buildOnboardingRedirectPath(nextPath)
  }

  const resolvedUser = await resolveSessionUser(session)
  if (!resolvedUser) {
    return "/login"
  }

  if (await userCanAccessProduct(resolvedUser.id)) {
    if (isSafeInternalPath(nextPath)) {
      return nextPath
    }
    return "/settings/usage"
  }
  return buildOnboardingRedirectPath(nextPath)
}
