import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountSecuritySection } from "@/components/account/account-security-section"
import { loadAccountPageContext } from "@/lib/account-page-data"

export const metadata: Metadata = {
  title: "Security | DressApp Account",
}

export default async function AccountSecurityPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/security")
  }

  const ctx = await loadAccountPageContext(session.user.id, {
    fallbackEmail: session.user.email,
    fallbackName: session.user.name,
  })

  return (
    <AccountSecuritySection email={ctx.email} hasPasswordAuth={ctx.hasPasswordAuth} />
  )
}
