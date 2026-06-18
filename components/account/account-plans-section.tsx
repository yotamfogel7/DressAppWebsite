import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AccountPlanUsageSummary } from "@/components/account/account-plan-usage-summary"
import { PlanFeaturesList } from "@/components/plans/plan-features-list"
import { PLAN_LABELS, type PlanSlug } from "@/lib/plan-slugs"
import { SIGNUP_TRIAL_TRYON_ALLOWANCE } from "@/lib/signup-trial"
import { PRICING_PLANS } from "@/lib/pricing-plans"

type AccountPlansSectionProps = {
  planSlug: PlanSlug | null
  hasActivePlan: boolean
  onSignupTrial: boolean
  hasProductAccess: boolean
}

export function AccountPlansSection({
  planSlug,
  hasActivePlan,
  onSignupTrial,
  hasProductAccess,
}: AccountPlansSectionProps) {
  const plan = planSlug ? PRICING_PLANS.find((p) => p.slug === planSlug) : null
  const planLabel = planSlug ? PLAN_LABELS[planSlug] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A plan is required to use DressApp try-on on your storefront.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {planLabel && plan ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-bold tracking-tight">{planLabel}</p>
                <p className="mt-1 text-base text-muted-foreground">
                  {plan.price}
                  {plan.priceSuffix ? ` ${plan.priceSuffix}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            </div>
            <PlanFeaturesList
              plan={plan}
              features={plan.features.slice(0, 4)}
              className="mt-5 space-y-2"
              itemClassName="flex items-start gap-2.5 text-sm"
            />
            <AccountPlanUsageSummary />
          </>
        ) : onSignupTrial ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-bold tracking-tight">Free trial</p>
                <p className="mt-1 text-base text-muted-foreground">$0 · no renewal</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            </div>
            <ul className="mt-5 space-y-2">
              <li className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 text-primary">✓</span>
                <span>
                  {SIGNUP_TRIAL_TRYON_ALLOWANCE} try-ons included (all time, per account)
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 text-primary">✓</span>
                <span>Usage dashboard</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 text-primary">✓</span>
                <span>SDK integration</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 text-primary">✓</span>
                <span>24/7 support</span>
              </li>
            </ul>
            <AccountPlanUsageSummary />
          </>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            You have not selected a plan yet. Choose one to unlock try-on, usage tracking, and
            integrations.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href={hasProductAccess ? "/plans" : "/onboarding"}>
              {hasProductAccess ? "Change plan" : "Choose a plan"}
            </Link>
          </Button>
          {hasProductAccess ? (
            <Button variant="outline" asChild>
              <Link href="/settings/usage">View usage</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/#book-a-demo">Book a demo</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
