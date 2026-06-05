import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountPlansSection } from "@/components/account/account-plans-section"
import { loadAccountPageContext } from "@/lib/account-page-data"
import { userCanAccessProduct } from "@/lib/user-active-plan"

export const metadata: Metadata = {
  title: "Plans | DressApp Account",
}

export default async function AccountPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/plans")
  }

  if (!(await userCanAccessProduct(session.user.id))) {
    redirect("/onboarding?next=/account/plans")
  }

  const params = await searchParams
  const ctx = await loadAccountPageContext(session.user.id, {
    planFromQuery: params.plan,
    fallbackEmail: session.user.email,
    fallbackName: session.user.name,
  })

  return (
    <AccountPlansSection
      planSlug={ctx.planSlug}
      hasActivePlan={ctx.hasActivePlan}
      onSignupTrial={ctx.onSignupTrial}
      hasProductAccess={ctx.hasProductAccess}
    />
  )
}
