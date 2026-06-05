import type { Metadata } from "next"
import { Suspense } from "react"
import { ForgotPasswordClient } from "@/components/auth/forgot-password-client"

export const metadata: Metadata = {
  title: "Reset password | DressApp",
  description: "Reset your DressApp account password.",
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ForgotPasswordClient />
    </Suspense>
  )
}
