"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, LayoutGrid, Lock, Store } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/account/plans",
    label: "Plans",
    icon: LayoutGrid,
  },
  {
    href: "/account/billing",
    label: "Billing",
    icon: CreditCard,
  },
  {
    href: "/account/business",
    label: "Business details",
    icon: Store,
  },
  {
    href: "/account/security",
    label: "Security",
    icon: Lock,
  },
] as const

export function AccountNav({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Account settings"
      className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-border bg-card/40 p-2 md:w-56 md:flex-col md:border-b-0 md:border-r md:p-3"
    >
      <div className="hidden px-3 pb-2 md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Your account
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
      </div>
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-w-fit items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:w-full",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
