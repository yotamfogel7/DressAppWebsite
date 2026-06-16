"use client"

import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthFormError } from "@/components/auth/auth-form-error"
import { PlanFeaturesList } from "@/components/plans/plan-features-list"
import { parseApiErrorResponse } from "@/lib/auth-user-messages"
import { isFreeTrialPlanSlug } from "@/lib/plan-slugs"
import { PRICING_PLANS } from "@/lib/pricing-plans"
import { SIGNUP_TRIAL_TRYON_ALLOWANCE } from "@/lib/signup-trial-constants"
import { cn } from "@/lib/utils"

type OnboardingPlansStepProps = {
  onBack: () => void
  isPendingSignup?: boolean
}

export function OnboardingPlansStep({
  onBack,
  isPendingSignup = false,
}: OnboardingPlansStepProps) {
  const { update } = useSession()
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [skippingTrial, setSkippingTrial] = useState(false)
  const [skipError, setSkipError] = useState<string | null>(null)

  async function choosePlan(plan: (typeof PRICING_PLANS)[number]) {
    if (isFreeTrialPlanSlug(plan.slug)) {
      await skipToFreeTrial()
      return
    }
    if (plan.ctaHref) {
      window.location.assign(plan.ctaHref)
      return
    }
    setBusySlug(plan.slug)
    setSkipError(null)
    try {
      if (isPendingSignup) {
        const res = await fetch("/api/auth/onboarding/prepare-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan.slug }),
        })
        const data: unknown = await res.json().catch(() => ({}))
        if (!res.ok) {
          const errMsg = parseApiErrorResponse(
            data,
            "Could not continue to checkout. Please try again.",
          )
          console.error("[onboarding] prepare-plan:", errMsg, data)
          setSkipError(errMsg)
          return
        }
        const redirect =
          typeof data === "object" &&
          data !== null &&
          "redirect" in data &&
          typeof (data as { redirect?: unknown }).redirect === "string"
            ? (data as { redirect: string }).redirect
            : `/plans/select?plan=${encodeURIComponent(plan.slug)}`
        await update()
        window.location.assign(redirect)
        return
      }
      window.location.assign(
        `/plans/select?plan=${encodeURIComponent(plan.slug)}`,
      )
    } finally {
      setBusySlug(null)
    }
  }

  async function skipToFreeTrial() {
    setSkipError(null)
    setSkippingTrial(true)
    try {
      const res = await fetch("/api/auth/onboarding/skip-plan", {
        method: "POST",
        credentials: "same-origin",
      })
      const data: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMsg = parseApiErrorResponse(
          data,
          "Could not start your free trial. Please try again.",
        )
        console.error("[onboarding] skip-plan:", errMsg, data)
        setSkipError(errMsg)
        return
      }
      const accountCreated =
        typeof data === "object" &&
        data !== null &&
        "accountCreated" in data &&
        (data as { accountCreated?: boolean }).accountCreated === true

      if (accountCreated) {
        await update()
        window.location.assign("/settings/usage")
        return
      }

      await update()
      window.location.assign("/continue?next=/settings/usage")
    } finally {
      setSkippingTrial(false)
    }
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
            onChoose={() => void choosePlan(plan)}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {bottomPlans.map((plan, index) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            index={index + 3}
            busy={busySlug === plan.slug}
            onChoose={() => void choosePlan(plan)}
          />
        ))}
      </div>

      {skipError ? (
        <div className="mt-6">
          <AuthFormError message={skipError} />
        </div>
      ) : null}

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={skippingTrial || busySlug !== null}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="link"
          className="h-auto px-0 text-sm font-medium text-primary"
          disabled={skippingTrial || busySlug !== null}
          onClick={() => void skipToFreeTrial()}
        >
          {skippingTrial
            ? "Starting your free trial…"
            : `Skip for now, use my ${SIGNUP_TRIAL_TRYON_ALLOWANCE} free trial try-ons`}
        </Button>
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
