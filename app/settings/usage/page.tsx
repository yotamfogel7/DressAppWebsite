import type { Metadata } from "next"
import { DressAppUsageDashboard } from "@/components/dressapp/dressapp-usage-dashboard"

export const metadata: Metadata = {
  title: "Usage | DressApp Settings",
}

export default function SettingsUsagePage() {
  return (
    <div className="flex h-[min(72dvh,calc(100dvh-8rem))] min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border">
      <DressAppUsageDashboard />
    </div>
  )
}
