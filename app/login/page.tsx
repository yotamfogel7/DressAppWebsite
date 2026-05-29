import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginClient } from "@/components/auth/login-client"

export const metadata: Metadata = {
  title: "Log in | DressApp",
  description: "Log in to your DressApp account.",
}

export default function LoginPage() {
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
