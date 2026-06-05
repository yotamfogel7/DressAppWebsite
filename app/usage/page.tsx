import type { Metadata } from "next"
import { Header } from "@/components/landing/header"
import { DressAppUsageDashboard } from "@/components/dressapp/dressapp-usage-dashboard"

export const metadata: Metadata = {
  title: "Usage | DressApp",
  description:
    "Merchant usage: try-on allowance, try-on count, user model generations, and distinct users.",
}

export default function UsagePage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <Header sticky />
      <div className="min-h-0 flex-1 overflow-hidden">
        <DressAppUsageDashboard />
      </div>
    </div>
  )
}
