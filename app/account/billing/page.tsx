import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountBillingSection } from "@/components/account/account-billing-section"
import { loadAccountPageContext } from "@/lib/account-page-data"

export const metadata: Metadata = {
  title: "Billing | DressApp Account",
}

export default async function AccountBillingPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/billing")
  }

  const ctx = await loadAccountPageContext(session.user.id, {
    fallbackEmail: session.user.email,
    fallbackName: session.user.name,
  })

  return (
    <AccountBillingSection planSlug={ctx.planSlug} hasActivePlan={ctx.hasActivePlan} />
  )
}
