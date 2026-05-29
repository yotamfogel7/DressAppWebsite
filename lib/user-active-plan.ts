import { getUserSelectedPlan } from "@/lib/auth-db"
import { normalizePlanSlug } from "@/lib/plan-slugs"

export async function userHasActivePlan(userId: string): Promise<boolean> {
  const planRaw = await getUserSelectedPlan(userId)
  return normalizePlanSlug(planRaw) !== null
}
