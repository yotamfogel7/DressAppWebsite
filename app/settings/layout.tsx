import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { resolveSessionUser } from "@/lib/session-user"
import { Header } from "@/components/landing/header"
import { SettingsLayoutShell } from "@/components/settings/settings-layout-shell"
import { userCanAccessProduct } from "@/lib/user-active-plan"

export const metadata: Metadata = {
  title: "DressApp Settings",
  description: "Manage your DressApp account, usage, integrations, and storefront widget.",
}

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings")
  }
  if (!session.user.onboardingComplete) {
    redirect("/onboarding?next=/settings")
  }

  const resolvedUser = await resolveSessionUser(session)
  if (!resolvedUser) {
    redirect("/login?callbackUrl=/settings")
  }

  if (!(await userCanAccessProduct(String(resolvedUser.id)))) {
    redirect("/onboarding?next=/settings")
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Header sticky />
      <SettingsLayoutShell>{children}</SettingsLayoutShell>
    </div>
  )
}
