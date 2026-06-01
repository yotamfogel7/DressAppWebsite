import type { Metadata } from "next"
import { CredentialsSection } from "@/components/settings/credentials-section"

export const metadata: Metadata = {
  title: "Credentials | DressApp Settings",
}

export default function SettingsCredentialsPage() {
  return <CredentialsSection />
}
