"use client"

import { Suspense, type ReactNode } from "react"
import { SettingsNav } from "@/components/settings/settings-nav"
import { SettingsWelcomeProvider } from "@/components/settings/settings-welcome-provider"
import { SettingsWelcomeTour } from "@/components/settings/settings-welcome-tour"

export function SettingsLayoutShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SettingsLayoutFallback>{children}</SettingsLayoutFallback>}>
      <SettingsWelcomeProvider>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <SettingsNav />
          <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
            <SettingsWelcomeTour />
            {children}
          </main>
        </div>
      </SettingsWelcomeProvider>
    </Suspense>
  )
}

function SettingsLayoutFallback({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <SettingsNav />
      <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  )
}
