import type { Metadata } from "next"
import { Suspense } from "react"
import { SignupClient } from "@/components/auth/signup-client"

export const metadata: Metadata = {
  title: "Sign up | DressApp",
  description: "Create a DressApp account to continue with your plan.",
}

export default function SignupPage() {
  const googleClientId = process.env.AUTH_GOOGLE_ID?.trim() ?? ""
  const googleEnabled = Boolean(googleClientId && process.env.AUTH_GOOGLE_SECRET?.trim())
  const githubEnabled = Boolean(
    process.env.AUTH_GITHUB_ID?.trim() && process.env.AUTH_GITHUB_SECRET?.trim(),
  )

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignupClient
        googleClientId={googleClientId}
        googleEnabled={googleEnabled}
        githubEnabled={githubEnabled}
      />
    </Suspense>
  )
}
