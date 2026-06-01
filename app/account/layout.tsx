import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountNav } from "@/components/account/account-nav"
import { Header } from "@/components/landing/header"
import { getUserAccountDetails } from "@/lib/auth-db"

export const metadata: Metadata = {
  title: "Account | DressApp",
  description: "Manage your DressApp plan, billing, and account settings.",
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account")
  }

  const account = await getUserAccountDetails(session.user.id)
  const email =
    account?.email ?? session.user.email ?? session.user.name ?? "your account"

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Header sticky />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <AccountNav email={email} />
        <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
