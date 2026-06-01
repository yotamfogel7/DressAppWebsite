import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountBusinessSection } from "@/components/account/account-business-section"
import { loadAccountPageContext } from "@/lib/account-page-data"

export const metadata: Metadata = {
  title: "Business details | DressApp Account",
}

export default async function AccountBusinessPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/business")
  }

  const ctx = await loadAccountPageContext(session.user.id, {
    fallbackEmail: session.user.email,
    fallbackName: session.user.name,
  })

  return (
    <AccountBusinessSection
      businessName={ctx.businessName}
      primaryCategories={ctx.primaryCategories}
      name={ctx.name}
    />
  )
}
