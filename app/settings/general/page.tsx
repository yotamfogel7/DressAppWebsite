import type { Metadata } from "next"
import { GeneralSettingsSection } from "@/components/settings/general-settings-section"

export const metadata: Metadata = {
  title: "General Settings | DressApp Settings",
}

export default function SettingsGeneralPage() {
  return <GeneralSettingsSection />
}
