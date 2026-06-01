import type { Metadata } from "next"
import { SettingsIntegrationsSection } from "@/components/settings/settings-integrations-section"

export const metadata: Metadata = {
  title: "Integrations | DressApp Settings",
}

export default function SettingsIntegrationsPage() {
  return <SettingsIntegrationsSection />
}
