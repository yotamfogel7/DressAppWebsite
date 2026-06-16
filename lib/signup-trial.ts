import {
  getUserPreferences,
  getUserSelectedPlan,
  resolveAuthUserId,
  updateUserPreferences,
} from "@/lib/auth-db"
import { ensureMerchantForUser } from "@/lib/ensure-merchant-for-user"
import { normalizePlanSlug } from "@/lib/plan-slugs"

export type SignupTrialUserContext = {
  email?: string | null
  name?: string | null
}

export { SIGNUP_TRIAL_DURATION_DAYS, SIGNUP_TRIAL_TRYON_ALLOWANCE } from "@/lib/signup-trial-constants"

const SIGNUP_TRIAL_STARTED_AT_KEY = "signupTrialStartedAt"

export async function isUserOnSignupTrial(
  userId: string | number,
): Promise<boolean> {
  const prefs = await getUserPreferences(userId)
  const startedAt = prefs[SIGNUP_TRIAL_STARTED_AT_KEY]
  return typeof startedAt === "string" && startedAt.length > 0
}

async function userHasPaidPlan(userId: string | number): Promise<boolean> {
  const planRaw = await getUserSelectedPlan(userId)
  return normalizePlanSlug(planRaw) !== null
}

/** Starts the default free trial when the user has no paid plan yet. */
export async function ensureDefaultSignupTrial(
  userId: string | number,
  context?: SignupTrialUserContext,
): Promise<boolean> {
  const resolved = await resolveAuthUserId(userId, context?.email)
  if (!resolved) return false

  if (await userHasPaidPlan(resolved.id)) return false
  if (await isUserOnSignupTrial(resolved.id)) return true
  try {
    await startSignupTrial(userId, context)
    return true
  } catch (e) {
    console.error("[ensureDefaultSignupTrial] could not start trial", e)
    return false
  }
}

export async function startSignupTrial(
  userId: string | number,
  context?: SignupTrialUserContext,
): Promise<void> {
  const resolved = await resolveAuthUserId(userId, context?.email)
  if (!resolved) {
    throw new Error(
      "Could not find your account. Sign out, sign in again, and retry.",
    )
  }

  const alreadyOnTrial = await isUserOnSignupTrial(resolved.id)
  const provisioned = await ensureMerchantForUser(resolved.id, {
    email: resolved.email,
    name: resolved.name ?? context?.name,
  })
  if (!provisioned) {
    throw new Error(
      "Could not set up your DressApp account. Check server logs and try again.",
    )
  }
  if (alreadyOnTrial) return
  await updateUserPreferences(resolved.id, {
    [SIGNUP_TRIAL_STARTED_AT_KEY]: new Date().toISOString(),
  })
}
