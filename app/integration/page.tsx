import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { DressAppIntegrationGuide } from "@/components/dressapp/dressapp-integration-guide"

export const metadata: Metadata = {
  title: "Integration | DressApp",
  description:
    "Shopify partner integration: OAuth, environment variables, DressApp install API, and theme extension overview.",
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
            Shopify app path from the project{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">README.md</code>: prerequisites,
            env vars, local dev, and the DressApp endpoints your server calls.
          </p>
        </div>
        <DressAppIntegrationGuide />
      </div>
      <Footer />
    </main>
  )
}
