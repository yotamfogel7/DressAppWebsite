"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlanFeaturesList } from "@/components/plans/plan-features-list"
import { PRICING_PLANS } from "@/lib/pricing-plans"
import { cn } from "@/lib/utils"

type OnboardingPlansStepProps = {
  onBack: () => void
}

export function OnboardingPlansStep({ onBack }: OnboardingPlansStepProps) {
  const [busySlug, setBusySlug] = useState<string | null>(null)

  function choosePlan(plan: (typeof PRICING_PLANS)[number]) {
    if (plan.ctaHref) {
      window.location.assign(plan.ctaHref)
      return
    }
    setBusySlug(plan.slug)
    window.location.assign(
      `/plans/select?plan=${encodeURIComponent(plan.slug)}`,
    )
  }

  const topPlans = PRICING_PLANS.slice(0, 3)
  const bottomPlans = PRICING_PLANS.slice(3)

  return (
    <motion.div
      key="step-plans"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {topPlans.map((plan, index) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            index={index}
            busy={busySlug === plan.slug}
            onChoose={() => choosePlan(plan)}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:max-w-4xl">
        {bottomPlans.map((plan, index) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            index={index + 3}
            busy={busySlug === plan.slug}
            onChoose={() => choosePlan(plan)}
          />
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <p className="text-right text-sm text-muted-foreground">
          A plan is required to use DressApp on your storefront.
        </p>
      </div>
    </motion.div>
  )
}

type PlanCardProps = {
  plan: (typeof PRICING_PLANS)[number]
  index: number
  busy: boolean
  onChoose: () => void
}

function PlanCard({ plan, index, busy, onChoose }: PlanCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm",
        plan.popular && "ring-2 ring-amber-400/70",
      )}
    >
      {plan.popular ? (
        <span className="absolute -top-3 right-4 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-semibold text-amber-950">
          Popular
        </span>
      ) : null}

      <div className="mb-5">
        <h2 className="text-xl font-bold">{plan.name}</h2>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
          {plan.priceSuffix ? (
            <span className="text-sm text-muted-foreground">
              {plan.priceSuffix}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {plan.description}
        </p>
      </div>

      <PlanFeaturesList
        plan={plan}
        className="mb-6 flex-1 space-y-2.5"
        itemClassName="flex items-start gap-2.5 text-sm"
      />

      <Button
        size="lg"
        className={cn("w-full", plan.buttonClassName)}
        disabled={busy}
        onClick={onChoose}
      >
        {busy ? "Saving..." : plan.cta}
      </Button>
    </motion.article>
  )
}
