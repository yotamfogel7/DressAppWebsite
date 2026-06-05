import { getUserSelectedPlan } from "@/lib/auth-db"
import { normalizePlanSlug } from "@/lib/plan-slugs"
import { isUserOnSignupTrial } from "@/lib/signup-trial"

export async function userHasActivePlan(userId: string): Promise<boolean> {
  const planRaw = await getUserSelectedPlan(userId)
  return normalizePlanSlug(planRaw) !== null
}

/** Paid plan or signup free-trial access (Settings, integrations, etc.). */
export async function userCanAccessProduct(userId: string): Promise<boolean> {
  if (await userHasActivePlan(userId)) return true
  return isUserOnSignupTrial(userId)
}
