import type { Metadata } from "next"
import { Suspense } from "react"
import { OnboardingSyncClient } from "@/components/onboarding/onboarding-sync-client"

export const metadata: Metadata = {
  title: "Finishing setup | DressApp",
  robots: { index: false, follow: false },
}

export default function OnboardingSyncPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Finishing setup…
        </div>
      }
    >
      <OnboardingSyncClient />
    </Suspense>
  )
}
