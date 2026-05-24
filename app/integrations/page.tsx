import type { Metadata } from "next"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { IntegrationsHub } from "@/components/integrations/integrations-hub"

export const metadata: Metadata = {
  title: "Integrations | DressApp",
  description:
    "Connect DressApp to your store via the Shopify App, JavaScript SDK, or full API integration.",
}

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <IntegrationsHub />
      <Footer />
    </main>
  )
}
