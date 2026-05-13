import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { DressAppIntegrationGuide } from "@/components/dressapp/dressapp-integration-guide"

export const metadata: Metadata = {
  title: "Integration | DressApp",
  description:
    "Connect DressApp to Shopify: prerequisites, production environment variables, and DressApp API endpoints your backend uses.",
}

export default function IntegrationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-3xl space-y-8 px-6 pb-24 pt-28 lg:px-8 lg:pt-32">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Integration</h1>
          <p className="mt-2 text-muted-foreground">
            Production-oriented checklist for the Shopify app: what gets connected, required
            configuration, and the DressApp endpoints your server calls after install.
          </p>
        </div>
        <DressAppIntegrationGuide />
      </div>
      <Footer />
    </main>
  )
}
