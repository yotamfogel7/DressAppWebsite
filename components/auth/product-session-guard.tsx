"use client"

import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useEffect } from "react"
import {
  allowsIncompleteOnboardingSession,
  allowsProfileCompleteSession,
  isFullyOnboarded,
} from "@/lib/onboarding-access"

/** Signs out on public pages when the user has not finished onboarding. */
export function ProductSessionGuard() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return
    }
    if (isFullyOnboarded(session.user)) {
      return
    }
    if (allowsIncompleteOnboardingSession(pathname)) {
      return
    }
    if (
      session.user.onboardingComplete === true &&
      allowsProfileCompleteSession(pathname)
    ) {
      return
    }
    void signOut({ redirect: false })
  }, [pathname, session?.user, status])

  return null
}
