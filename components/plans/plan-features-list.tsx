import { Check } from "lucide-react"
import type { PricingPlan } from "@/lib/pricing-plans"

type PlanFeaturesListProps = {
  plan: PricingPlan
  features?: string[]
  className?: string
  itemClassName?: string
}

function isTryOnAllowanceFeature(feature: string) {
  return feature.includes("try-ons / month")
}

export function PlanFeaturesList({
  plan,
  features = plan.features,
  className,
  itemClassName,
}: PlanFeaturesListProps) {
  return (
    <ul className={className}>
      {features.map((feature) => {
        const monthlyUsersNote =
          isTryOnAllowanceFeature(feature) && plan.comfortableMonthlyUsers
            ? ` (~${plan.comfortableMonthlyUsers.toLocaleString()} monthly users)`
            : ""

        return (
          <li
            key={feature}
            className={itemClassName ?? "flex items-start gap-2.5 text-sm text-foreground"}
          >
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              {feature}
              {monthlyUsersNote ? (
                <span className="text-xs text-muted-foreground">{monthlyUsersNote}</span>
              ) : null}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
