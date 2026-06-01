import { getUserAccountDetails } from "@/lib/auth-db"
import { normalizePlanSlug, type PlanSlug } from "@/lib/plan-slugs"
import { userHasActivePlan } from "@/lib/user-active-plan"
import type { PrimaryCategory } from "@/lib/onboarding-categories"

export type AccountPageContext = {
  email: string
  name: string | null
  planSlug: PlanSlug | null
  businessName: string | null
  primaryCategories: PrimaryCategory[]
  hasPasswordAuth: boolean
  hasActivePlan: boolean
}

export async function loadAccountPageContext(
  userId: string,
  options?: { planFromQuery?: string | null; fallbackEmail?: string | null; fallbackName?: string | null },
): Promise<AccountPageContext> {
  const [account, hasActivePlan] = await Promise.all([
    getUserAccountDetails(userId),
    userHasActivePlan(userId),
  ])

  const fromQuery = normalizePlanSlug(options?.planFromQuery)
  const fromDb = account?.selectedPlan ? normalizePlanSlug(account.selectedPlan) : null

  return {
    email: account?.email ?? options?.fallbackEmail ?? "your account",
    name: account?.name ?? options?.fallbackName ?? null,
    planSlug: fromQuery ?? fromDb,
    businessName: account?.businessName ?? null,
    primaryCategories: account?.primaryCategories ?? [],
    hasPasswordAuth: account?.hasPasswordAuth ?? false,
    hasActivePlan,
  }
}
