import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import {
  buildOnboardingRedirectPath,
  isFullyOnboarded,
} from "@/lib/onboarding-access"
import { parsePendingPlanCheckoutPath } from "@/lib/onboarding-pending-checkout"
import { resolveOnboardingActor } from "@/lib/onboarding-actor"
import { userCanAccessProduct } from "@/lib/user-active-plan"

export const metadata: Metadata = {
  title: "Set up your store | DressApp",
  description: "Tell us about your business to personalize DressApp.",
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const sp = await searchParams
  const session = await auth()
  const actor = await resolveOnboardingActor()
  if (!actor) {
    if (session?.user?.id) {
      console.error(
        "[onboarding] authenticated session could not resolve onboarding actor",
        session.user.id,
      )
      const loginCallback = encodeURIComponent(
        buildOnboardingRedirectPath(sp.next),
      )
      redirect(
        `/api/auth/signout?callbackUrl=${encodeURIComponent(`/login?callbackUrl=${loginCallback}`)}`,
      )
    }
    redirect(
      `/login?callbackUrl=${encodeURIComponent(buildOnboardingRedirectPath(sp.next))}`,
    )
  }
  const pendingCheckoutPath = parsePendingPlanCheckoutPath(sp.next)

  if (actor.kind === "user") {
    if (
      actor.profileComplete &&
      (await userCanAccessProduct(String(actor.id)))
    ) {
      if (pendingCheckoutPath) {
        redirect(pendingCheckoutPath)
      }
      const destination = sp.next?.startsWith("/settings")
        ? sp.next
        : "/settings/usage"
      if (!isFullyOnboarded(session?.user)) {
        redirect(
          `/onboarding/sync?next=${encodeURIComponent(destination)}`,
        )
      }
      redirect(destination)
    }
  }

  return (
    <OnboardingFlow
      initialStep={actor.profileComplete ? 3 : 1}
      pendingCheckoutPath={pendingCheckoutPath}
      isPendingSignup={actor.kind === "pending"}
    />
  )
}
