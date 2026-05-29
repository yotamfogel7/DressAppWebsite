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
      {features.map((feature) => (
        <li key={feature} className={itemClassName ?? "flex items-start gap-2.5 text-sm"}>
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
          <span>
            {feature}
            {isTryOnAllowanceFeature(feature) && plan.comfortableMonthlyUsers ? (
              <span className="ml-1 text-xs text-muted-foreground">
                (~{plan.comfortableMonthlyUsers.toLocaleString()} monthly users)
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
