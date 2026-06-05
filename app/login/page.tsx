import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth } from "@/auth"
import { LoginClient } from "@/components/auth/login-client"
import {
  buildOnboardingRedirectPath,
  isFullyOnboarded,
} from "@/lib/onboarding-access"
import { resolveSessionUser } from "@/lib/session-user"

export const metadata: Metadata = {
  title: "Log in | DressApp",
  description: "Log in to your DressApp account.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; plan?: string }>
}) {
  const session = await auth()
  if (session?.user?.id && !isFullyOnboarded(session.user)) {
    const account = await resolveSessionUser(session)
    if (account) {
      const sp = await searchParams
      const next =
        sp.callbackUrl ??
        (sp.plan
          ? `/plans/select?plan=${encodeURIComponent(sp.plan)}`
          : undefined)
      redirect(buildOnboardingRedirectPath(next))
    }
  }

  const googleClientId = process.env.AUTH_GOOGLE_ID?.trim() ?? ""
  const googleEnabled = Boolean(googleClientId && process.env.AUTH_GOOGLE_SECRET?.trim())
  const githubEnabled = Boolean(
    process.env.AUTH_GITHUB_ID?.trim() && process.env.AUTH_GITHUB_SECRET?.trim(),
  )

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginClient
        googleClientId={googleClientId}
        googleEnabled={googleEnabled}
        githubEnabled={githubEnabled}
      />
    </Suspense>
  )
}
