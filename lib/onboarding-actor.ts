import { auth } from "@/auth"
import { getUserOnboardingProfile, getUserWithPasswordByEmail, resolveAuthUserId } from "@/lib/auth-db"
import { isOnboardingComplete } from "@/lib/onboarding"
import { getJwtLoginEmail, resolveSessionUser } from "@/lib/session-user"
import {
  ensureVerifiedPendingSignupFromSession,
  getVerifiedPendingSignup,
  isPendingSignupProfileComplete,
  pendingSignupProfile,
} from "@/lib/pending-signup-db"
import { readPendingSignupSession } from "@/lib/pending-signup-cookie"

export type OnboardingActor =
  | {
      kind: "user"
      id: number
      email: string
      name: string | null
      profileComplete: boolean
    }
  | {
      kind: "pending"
      email: string
      name: string | null
      profileComplete: boolean
    }

export async function resolveAccountForSession(
  session: NonNullable<Awaited<ReturnType<typeof auth>>>,
): Promise<{ id: number; email: string; name: string | null } | null> {
  const fromSession = await resolveSessionUser(session)
  if (fromSession) return fromSession

  if (!session.user?.id) return null

  const jwtEmail = await getJwtLoginEmail()
  const resolved = await resolveAuthUserId(
    session.user.id,
    session.user.email ?? jwtEmail,
  )
  if (resolved) return resolved

  if (jwtEmail) {
    const account = await getUserWithPasswordByEmail(jwtEmail)
    if (account?.email?.trim()) {
      return {
        id: account.id,
        email: account.email,
        name: account.name,
      }
    }
  }

  return null
}

function buildUserActor(account: {
  id: number
  email: string
  name: string | null
  profileComplete: boolean
}): OnboardingActor {
  return {
    kind: "user",
    id: account.id,
    email: account.email,
    name: account.name,
    profileComplete: account.profileComplete,
  }
}

export async function resolveOnboardingActor(): Promise<OnboardingActor | null> {
  const session = await auth()
  if (session?.user?.id) {
    const account = await resolveAccountForSession(session)
    if (account) {
      const profile = await getUserOnboardingProfile(account.id)
      return buildUserActor({
        ...account,
        profileComplete: isOnboardingComplete(profile),
      })
    }
  }

  const pendingSession = await readPendingSignupSession()
  if (pendingSession) {
    const existingUser = await getUserWithPasswordByEmail(pendingSession.email)
    if (existingUser) {
      const profile = await getUserOnboardingProfile(existingUser.id)
      return buildUserActor({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        profileComplete: isOnboardingComplete(profile),
      })
    }

    const row = await ensureVerifiedPendingSignupFromSession(pendingSession)
    if (!row) return null
    return {
      kind: "pending",
      email: row.email,
      name: row.name,
      profileComplete: isPendingSignupProfileComplete(row),
    }
  }

  return null
}

export async function getPendingSignupProfileState(email: string) {
  const row = await getVerifiedPendingSignup(email)
  if (!row) return null
  return {
    profile: pendingSignupProfile(row),
    profileComplete: isPendingSignupProfileComplete(row),
  }
}
