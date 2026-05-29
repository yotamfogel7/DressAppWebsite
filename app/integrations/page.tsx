import type { Metadata } from "next"
import { auth } from "@/auth"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { IntegrationsHub } from "@/components/integrations/integrations-hub"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { normalizePlanSlug } from "@/lib/plan-slugs"
import { planApiAccessAllowed } from "@/lib/plan-api-access"

export const metadata: Metadata = {
  title: "Integrations | DressApp",
  description:
    "Connect DressApp to your store via the Shopify App, JavaScript SDK, or full API integration.",
}

export default async function IntegrationsPage() {
  const session = await auth()
  let apiAccessAllowed = true
  if (session?.user?.id) {
    const planRaw = await getUserSelectedPlan(session.user.id)
    apiAccessAllowed = planApiAccessAllowed(normalizePlanSlug(planRaw))
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <IntegrationsHub apiAccessAllowed={apiAccessAllowed} />
      <Footer />
    </main>
  )
}
