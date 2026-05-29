"use client"

import { OnboardingPlansStep } from "@/components/onboarding/onboarding-plans-step"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"

export function PlansPicker() {
  return (
    <OnboardingShell
      step={3}
      totalSteps={3}
      wide
      eyebrow="Choose a plan"
      title="Pick the tier that fits your store"
      description="Every plan includes support and a usage dashboard. Billing setup comes after you choose."
    >
      <OnboardingPlansStep onBack={() => window.history.back()} />
    </OnboardingShell>
  )
}
