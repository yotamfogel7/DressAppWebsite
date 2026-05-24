import type { Metadata } from "next"
import { Package } from "lucide-react"
import { IntegrationDetailShell } from "@/components/integrations/integration-detail-shell"
import { SdkGuide } from "@/components/integrations/sdk-guide"

export const metadata: Metadata = {
  title: "SDK Integration | DressApp",
  description:
    "Embed DressApp on any storefront with the JavaScript SDK: one backend route and a lightweight script.",
}

export default function SdkIntegrationPage() {
  return (
    <IntegrationDetailShell
      title="SDK"
      description="For any website you control. DressApp ships a browser SDK that wraps sessions, model studio, and try-on calls."
      icon={Package}
    >
      <SdkGuide />
    </IntegrationDetailShell>
  )
}
