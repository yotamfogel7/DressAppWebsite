"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard, KeyRound, LayoutGrid, Palette, Plug } from "lucide-react"
import { useSettingsWelcomeOptional } from "@/components/settings/settings-welcome-provider"
import { cn } from "@/lib/utils"

const INTEGRATIONS_HREF = "/settings/integrations"

export const settingsNavItems = [
  {
    href: "/settings/general",
    label: "General Settings",
    icon: Palette,
  },
  {
    href: "/settings/credentials",
    label: "Credentials",
    icon: KeyRound,
  },
  {
    href: "/settings/billing",
    label: "Billing",
    icon: CreditCard,
  },
  {
    href: "/settings/usage",
    label: "Usage",
    icon: LayoutGrid,
  },
  {
    href: INTEGRATIONS_HREF,
    label: "Integrations",
    icon: Plug,
  },
] as const

export function SettingsNav() {
  const pathname = usePathname()
  const welcome = useSettingsWelcomeOptional()
  const highlightIntegrations = welcome?.highlightIntegrations ?? false

  return (
    <nav
      aria-label="DressApp Settings"
      className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-border bg-card/40 p-2 md:w-56 md:flex-col md:border-b-0 md:border-r md:p-3"
    >
      <p className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:block">
        DressApp Settings
      </p>
      {settingsNavItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        const isIntegrations = item.href === INTEGRATIONS_HREF
        const showHighlight = isIntegrations && highlightIntegrations && !active

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isIntegrations) welcome?.markIntegrationsClicked()
            }}
            className={cn(
              "relative inline-flex min-w-fit items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:w-full",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              showHighlight && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
            )}
          >
            {showHighlight ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg border border-primary/40"
                animate={{ opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
            <Icon className="relative size-4 shrink-0" aria-hidden />
            <span className="relative">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
