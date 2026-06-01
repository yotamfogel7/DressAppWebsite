"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  isIntegrationsNavVisited,
  isSettingsWelcomeDismissed,
  markIntegrationsNavVisited,
  markSettingsWelcomeDismissed,
} from "@/lib/settings-welcome"

type SettingsWelcomeContextValue = {
  showWelcomeTour: boolean
  highlightIntegrations: boolean
  dismissWelcomeTour: () => void
  markIntegrationsClicked: () => void
}

const SettingsWelcomeContext = createContext<SettingsWelcomeContextValue | null>(null)

export function useSettingsWelcome() {
  const ctx = useContext(SettingsWelcomeContext)
  if (!ctx) {
    throw new Error("useSettingsWelcome must be used within SettingsWelcomeProvider")
  }
  return ctx
}

export function useSettingsWelcomeOptional() {
  return useContext(SettingsWelcomeContext)
}

function stripWelcomeParam(pathname: string, searchParams: URLSearchParams): string {
  const next = new URLSearchParams(searchParams.toString())
  next.delete("welcome")
  const query = next.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function SettingsWelcomeProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const welcomeParam = searchParams.get("welcome") === "1"

  const [showWelcomeTour, setShowWelcomeTour] = useState(false)
  const [highlightIntegrations, setHighlightIntegrations] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const dismissed = isSettingsWelcomeDismissed()
    const integrationsVisited = isIntegrationsNavVisited()

    setShowWelcomeTour(welcomeParam && !dismissed)
    setHighlightIntegrations(!integrationsVisited)
    setHydrated(true)
  }, [welcomeParam])

  useEffect(() => {
    if (!hydrated) return
    if (pathname === "/settings/integrations" || pathname.startsWith("/settings/integrations/")) {
      markIntegrationsNavVisited()
      setHighlightIntegrations(false)
    }
  }, [hydrated, pathname])

  const dismissWelcomeTour = useCallback(() => {
    markSettingsWelcomeDismissed()
    setShowWelcomeTour(false)
    if (welcomeParam) {
      router.replace(stripWelcomeParam(pathname, searchParams))
    }
  }, [pathname, router, searchParams, welcomeParam])

  const markIntegrationsClicked = useCallback(() => {
    markIntegrationsNavVisited()
    setHighlightIntegrations(false)
  }, [])

  const value = useMemo(
    () => ({
      showWelcomeTour,
      highlightIntegrations,
      dismissWelcomeTour,
      markIntegrationsClicked,
    }),
    [showWelcomeTour, highlightIntegrations, dismissWelcomeTour, markIntegrationsClicked],
  )

  return (
    <SettingsWelcomeContext.Provider value={value}>{children}</SettingsWelcomeContext.Provider>
  )
}
