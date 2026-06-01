import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlanFeaturesList } from "@/components/plans/plan-features-list"
import { PLAN_LABELS, type PlanSlug } from "@/lib/plan-slugs"
import { PRICING_PLANS } from "@/lib/pricing-plans"

type AccountPlansSectionProps = {
  planSlug: PlanSlug | null
  hasActivePlan: boolean
}

export function AccountPlansSection({ planSlug, hasActivePlan }: AccountPlansSectionProps) {
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
          </>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            You have not selected a plan yet. Choose one to unlock try-on, usage tracking, and
            integrations.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href={hasActivePlan ? "/plans" : "/onboarding"}>
              {hasActivePlan ? "Change plan" : "Choose a plan"}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/#contact-us">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
