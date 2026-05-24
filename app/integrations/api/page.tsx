import type { Metadata } from "next"
import { Code2 } from "lucide-react"
import { IntegrationDetailShell } from "@/components/integrations/integration-detail-shell"
import { ApiGuide } from "@/components/integrations/api-guide"

export const metadata: Metadata = {
  title: "API Integration | DressApp",
  description:
    "Build a fully custom virtual try-on experience with direct access to DressApp REST endpoints.",
}

export default function ApiIntegrationPage() {
  return (
    <IntegrationDetailShell
      title="API"
      description="For teams building their own UI. You call the same REST endpoints the SDK uses under the hood."
      icon={Code2}
    >
      <ApiGuide />
    </IntegrationDetailShell>
  )
}
