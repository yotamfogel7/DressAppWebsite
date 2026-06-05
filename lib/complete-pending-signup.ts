import {
  createCredentialUser,
  updateUserOnboardingProfile,
  updateUserSelectedPlan,
} from "@/lib/auth-db"
import { ensureMerchantForUser } from "@/lib/ensure-merchant-for-user"
import type { PrimaryCategory } from "@/lib/onboarding-categories"
import {
  deletePendingSignup,
  getVerifiedPendingSignup,
  isPendingSignupProfileComplete,
  pendingSignupProfile,
} from "@/lib/pending-signup-db"
import { startSignupTrial } from "@/lib/signup-trial"
import { normalizePlanSlug } from "@/lib/plan-slugs"

export type CompletePendingSignupOptions = {
  startTrial?: boolean
  planSlug?: string | null
}

export type CompletedPendingSignup = {
  id: number
  email: string
  name: string | null
}

export async function completePendingSignup(
  email: string,
  options: CompletePendingSignupOptions = {},
): Promise<CompletedPendingSignup> {
  const row = await getVerifiedPendingSignup(email)
  if (!row) {
    throw new Error(
      "Your signup session expired. Start again from the sign-up page.",
    )
  }
  if (!isPendingSignupProfileComplete(row)) {
    throw new Error("Complete your business profile before continuing.")
  }

  const profile = pendingSignupProfile(row)
  const businessName = profile.business_name!
  const primaryCategories = profile.primary_categories as PrimaryCategory[]
  const planSlug = options.planSlug
    ? normalizePlanSlug(options.planSlug)
    : null

  if (!options.startTrial && !planSlug) {
    throw new Error("Choose a plan or start your free trial to finish signup.")
  }

  const { id } = await createCredentialUser({
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    emailVerified: new Date(),
  })

  try {
    await updateUserOnboardingProfile(id, {
      businessName,
      primaryCategories,
    })

    if (planSlug) {
      await updateUserSelectedPlan(id, planSlug)
      await ensureMerchantForUser(id, {
        email: row.email,
        name: row.name,
      })
    } else {
      await startSignupTrial(id, {
        email: row.email,
        name: row.name,
      })
    }

    await deletePendingSignup(row.email)
    return { id, email: row.email, name: row.name }
  } catch (e) {
    console.error("[completePendingSignup] failed after user insert", e)
    throw e
  }
}
