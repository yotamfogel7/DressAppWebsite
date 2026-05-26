import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { PlansPicker } from "@/components/plans/plans-picker"

export const metadata: Metadata = {
  title: "Choose a plan | DressApp",
  description: "Compare DressApp plans and pick the tier that fits your store.",
}

export default async function PlansPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/signup?callbackUrl=/plans")
  }
  if (!session.user.onboardingComplete) {
    redirect("/onboarding")
  }

  return <PlansPicker />
}
