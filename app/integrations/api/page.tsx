import { auth } from "@/auth"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { normalizePlanSlug } from "@/lib/plan-slugs"
import { planApiAccessAllowed } from "@/lib/plan-api-access"
import type { Metadata } from "next"
import { Code2 } from "lucide-react"
import { ApiAccessGate } from "@/components/integrations/api-access-gate"
import { IntegrationDetailShell } from "@/components/integrations/integration-detail-shell"
import { ApiGuide } from "@/components/integrations/api-guide"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "API Integration | DressApp",
  description:
    "Build a fully custom virtual try-on experience with direct access to DressApp REST endpoints.",
}

export default async function ApiIntegrationPage() {
  const session = await auth()
  let showUpgradeGate = false

  if (session?.user?.id) {
    const planRaw = await getUserSelectedPlan(session.user.id)
    const planSlug = normalizePlanSlug(planRaw)
    showUpgradeGate = !planApiAccessAllowed(planSlug)
  }

  return (
    <IntegrationDetailShell
      title="API"
      description="For teams building their own UI. You call the same REST endpoints the SDK uses under the hood."
      icon={Code2}
    >
      {showUpgradeGate ? (
        <ApiAccessGate />
      ) : (
        <>
          {!session?.user?.id ? (
            <Alert>
              <AlertTitle>Pro plan and above</AlertTitle>
              <AlertDescription>
                SDK and API access are included with Pro, Scale, and Enterprise+ plans.
              </AlertDescription>
            </Alert>
          ) : null}
          <ApiGuide />
        </>
      )}
    </IntegrationDetailShell>
  )
}
