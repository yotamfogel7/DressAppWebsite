import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { parsePendingPlanCheckoutPath } from "@/lib/onboarding-pending-checkout"
import { userHasActivePlan } from "@/lib/user-active-plan"

export const metadata: Metadata = {
  title: "Set up your store | DressApp",
  description: "Tell us about your business to personalize DressApp.",
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/signup?callbackUrl=/onboarding")
  }

  const sp = await searchParams
  const pendingCheckoutPath = parsePendingPlanCheckoutPath(sp.next)

  if (session.user.onboardingComplete && (await userHasActivePlan(session.user.id))) {
    if (pendingCheckoutPath) {
      redirect(pendingCheckoutPath)
    }
    redirect(sp.next?.startsWith("/settings") ? sp.next : "/settings")
  }

  return (
    <OnboardingFlow
      initialStep={session.user.onboardingComplete ? 3 : 1}
      pendingCheckoutPath={pendingCheckoutPath}
    />
  )
}
