import type { Metadata } from "next"
import { DressAppUsageDashboard } from "@/components/dressapp/dressapp-usage-dashboard"

export const metadata: Metadata = {
  title: "Usage | DressApp Settings",
}

export default function SettingsUsagePage() {
  return (
    <div className="-m-6 flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden md:-m-8">
      <DressAppUsageDashboard />
    </div>
  )
}
