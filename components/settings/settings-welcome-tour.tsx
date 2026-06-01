"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  CreditCard,
  KeyRound,
  LayoutGrid,
  Palette,
  Plug,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettingsWelcome } from "@/components/settings/settings-welcome-provider"
import { cn } from "@/lib/utils"

const easeOut = [0.22, 1, 0.36, 1] as const

type TourItem = {
  href: string
  label: string
  description: string
  icon: LucideIcon
  startHere?: boolean
}

const tourItems: TourItem[] = [
  {
    href: "/settings/general",
    label: "General",
    description: "Widget look and storefront URL",
    icon: Palette,
  },
  {
    href: "/settings/credentials",
    label: "Credentials",
    description: "API keys for your store",
    icon: KeyRound,
  },
  {
    href: "/settings/billing",
    label: "Billing",
    description: "Plan and add-on try-ons",
    icon: CreditCard,
  },
  {
    href: "/settings/usage",
    label: "Usage",
    description: "Monthly try-on activity",
    icon: LayoutGrid,
  },
  {
    href: "/settings/integrations",
    label: "Integrations",
    description: "Connect Shopify, SDK, or API",
    icon: Plug,
    startHere: true,
  },
]

export function SettingsWelcomeTour() {
  const { showWelcomeTour, dismissWelcomeTour, markIntegrationsClicked } = useSettingsWelcome()
  const reducedMotion = useReducedMotion()

  if (!showWelcomeTour) return null

  return (
    <motion.section
      aria-labelledby="settings-welcome-title"
      className="mb-8 overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <div className="border-b border-border/80 px-5 py-4 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
          Quick tour
        </p>
        <h2 id="settings-welcome-title" className="mt-1 text-lg font-semibold tracking-tight">
          Your DressApp dashboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each tab in the sidebar covers one part of your setup.
        </p>
      </div>

      <ul className="divide-y divide-border/80">
        {tourItems.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.li
              key={item.href}
              initial={reducedMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.35,
                delay: reducedMotion ? 0 : 0.06 + index * 0.05,
                ease: easeOut,
              }}
            >
              <Link
                href={item.href}
                onClick={() => {
                  if (item.startHere) markIntegrationsClicked()
                }}
                className={cn(
                  "group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 md:px-6",
                  item.startHere && "bg-primary/[0.04]",
                )}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{item.label}</span>
                    {item.startHere ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-primary">
                        Start here
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            </motion.li>
          )
        })}
      </ul>

      <div className="flex justify-end border-t border-border/80 px-5 py-4 md:px-6">
        <Button type="button" size="sm" onClick={dismissWelcomeTour}>
          Got it
        </Button>
      </div>
    </motion.section>
  )
}
