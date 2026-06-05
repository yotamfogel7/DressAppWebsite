"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { isSafeInternalPath } from "@/lib/onboarding-access"

export function OnboardingSyncClient() {
  const { update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const startedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const rawNext = searchParams.get("next")
    const next = isSafeInternalPath(rawNext) ? rawNext : "/settings/usage"

    void (async () => {
      try {
        await update()
        router.replace(next)
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        console.error("[onboarding/sync] session update failed", e)
        setError(message)
      }
    })()
  }, [searchParams, update, router])

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-destructive">
          Could not refresh your session: {error}
        </p>
        <button
          type="button"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => {
            window.location.assign("/login?callbackUrl=/settings/usage")
          }}
        >
          Sign in again
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      Finishing setup…
    </div>
  )
}
