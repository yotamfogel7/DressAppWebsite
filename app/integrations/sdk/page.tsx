import type { Metadata } from "next"
import { Package } from "lucide-react"
import { DownloadAgentInstructionsButton } from "@/components/integrations/download-agent-instructions-button"
import { IntegrationDetailShell } from "@/components/integrations/integration-detail-shell"
import { SdkGuide } from "@/components/integrations/sdk-guide"
import {
  SDK_AGENT_INSTRUCTIONS,
  SDK_AGENT_INSTRUCTIONS_FILENAME,
} from "@/lib/integration-agent-instructions/sdk-integration"

export const metadata: Metadata = {
  title: "SDK Integration | DressApp",
  description:
    "Embed DressApp on any storefront with the JavaScript SDK: one backend route and a lightweight script.",
}

export default function SdkIntegrationPage() {
  return (
    <IntegrationDetailShell
      title="SDK"
      description="For any website you control. DressApp ships a browser SDK that puts an inline Try it on button on your product pages - model creation, try-on, and add-to-cart all run on the page."
      icon={Package}
      titleAction={
        <DownloadAgentInstructionsButton
          filename={SDK_AGENT_INSTRUCTIONS_FILENAME}
          content={SDK_AGENT_INSTRUCTIONS}
        />
      }
    >
      <SdkGuide />
    </IntegrationDetailShell>
  )
}
