import type { Metadata } from "next"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { DressAppDemoLive } from "@/components/dressapp/dressapp-demo-live"

export const metadata: Metadata = {
  title: "Integration demo | DressApp",
  description:
    "Partner API session, model studio, and try-on demo for your storefront.",
}

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <DressAppDemoLive />
      <Footer />
    </main>
  )
}
