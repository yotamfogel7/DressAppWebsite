import { auth } from "@/auth"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { normalizePlanSlug } from "@/lib/plan-slugs"
import { planApiAccessAllowed } from "@/lib/plan-api-access"
import type { Metadata } from "next"
import { Package } from "lucide-react"
import { ApiAccessGate } from "@/components/integrations/api-access-gate"
import { IntegrationDetailShell } from "@/components/integrations/integration-detail-shell"
import { SdkGuide } from "@/components/integrations/sdk-guide"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "SDK Integration | DressApp",
  description:
    "Embed DressApp on any storefront with the JavaScript SDK: one backend route and a lightweight script.",
}

export default async function SdkIntegrationPage() {
  const session = await auth()
  let showUpgradeGate = false

  if (session?.user?.id) {
    const planRaw = await getUserSelectedPlan(session.user.id)
    const planSlug = normalizePlanSlug(planRaw)
    showUpgradeGate = !planApiAccessAllowed(planSlug)
  }

  return (
    <IntegrationDetailShell
      title="SDK"
      description="For any website you control. DressApp ships a browser SDK that wraps sessions, model studio, and try-on calls."
      icon={Package}
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
          <SdkGuide />
        </>
      )}
    </IntegrationDetailShell>
  )
}
