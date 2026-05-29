"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Code2, Lock, Package, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const easeOutStrong = [0.22, 1, 0.36, 1] as const

const API_INTEGRATION_HREF = "/integrations/api"
const SDK_INTEGRATION_HREF = "/integrations/sdk"

type IntegrationOption = {
  href: string
  title: string
  description: string
  icon?: LucideIcon
  imageSrc?: string
  imageAlt?: string
  proOnly?: boolean
}

const integrationOptions: IntegrationOption[] = [
  {
    href: "/integrations/shopify",
    title: "Shopify App",
    description: "Install the app from the Shopify App Store and enable the try-on widget on your theme in minutes.",
    imageSrc: "/icons/shopify logo.png",
    imageAlt: "Shopify",
  },
  {
    href: SDK_INTEGRATION_HREF,
    title: "SDK",
    description: "One backend route plus a JS snippet. DressApp handles most of the UI and logic for the try-on experience.",
    icon: Package,
    proOnly: true,
  },
  {
    href: API_INTEGRATION_HREF,
    title: "API",
    description: "Call REST endpoints yourself and own every screen in the experience.",
    icon: Code2,
    proOnly: true,
  },
]

function IntegrationIcon({ option }: { option: IntegrationOption }) {
  if (option.imageSrc) {
    return (
      <Image
        src={option.imageSrc}
        alt={option.imageAlt ?? option.title}
        width={48}
        height={48}
        className="h-8 w-8 object-contain"
      />
    )
  }

  const Icon = option.icon
  if (!Icon) return null

  return <Icon className="h-7 w-7" aria-hidden />
}

type IntegrationsHubProps = {
  /** When nested inside DressApp Settings, skip landing-page header offset. */
  embedded?: boolean
  /** When false, SDK and API integration guides are locked behind Pro+. */
  apiAccessAllowed?: boolean
}

function IntegrationCard({
  option,
  index,
  apiLocked,
}: {
  option: IntegrationOption
  index: number
  apiLocked: boolean
}) {
  const content = (
    <>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/8 transition-colors group-hover:bg-primary/12">
        <IntegrationIcon option={option} />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{option.title}</h2>
          {apiLocked ? (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <ArrowRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden
            />
          )}
        </div>
        <p className="mt-2 flex-1 text-sm text-muted-foreground text-pretty">{option.description}</p>
        {option.proOnly ? (
          <span className="mt-4 inline-flex w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Only available to Pro plans and above
          </span>
        ) : null}
        {apiLocked ? (
          <Button asChild size="sm" variant="outline" className="mt-3 w-fit">
            <Link href="/account/plans">Upgrade to Pro</Link>
          </Button>
        ) : null}
      </div>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: easeOutStrong }}
    >
      {apiLocked ? (
        <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm opacity-95">
          {content}
        </div>
      ) : (
        <Link
          href={option.href}
          className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {content}
        </Link>
      )}
    </motion.div>
  )
}

export function IntegrationsHub({ embedded = false, apiAccessAllowed = true }: IntegrationsHubProps) {
  return (
    <div
      className={
        embedded
          ? "pb-8"
          : "px-6 pb-24 pt-28 lg:px-8 lg:pt-32"
      }
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutStrong }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Try-on integration guide
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Three ways to add DressApp virtual try-on to a store. All three use the same try-on
            engine; the difference is how much DressApp handles for you.
          </p>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {integrationOptions.map((option, index) => (
            <IntegrationCard
              key={option.href}
              option={option}
              index={index}
              apiLocked={
                (option.href === API_INTEGRATION_HREF || option.href === SDK_INTEGRATION_HREF) &&
                !apiAccessAllowed
              }
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOutStrong }}
          className="rounded-2xl border border-border bg-muted/30 px-6 py-8 sm:px-8"
        >
          <h2 className="text-xl font-semibold tracking-tight">Which path should I pick?</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">On Shopify and don&apos;t want to code?</strong>{" "}
              → <Link href="/integrations/shopify" className="text-foreground underline underline-offset-2 hover:text-primary">Shopify App</Link>.
            </li>
            <li>
              <strong className="font-medium text-foreground">Custom website and you want the fastest integration?</strong>{" "}
              {apiAccessAllowed ? (
                <>
                  →{" "}
                  <Link
                    href={SDK_INTEGRATION_HREF}
                    className="text-foreground underline underline-offset-2 hover:text-primary"
                  >
                    SDK
                  </Link>{" "}
                  (Pro plan and above).
                </>
              ) : (
                <>
                  → SDK (Pro plan and above).{" "}
                  <Link href="/account/plans" className="text-foreground underline underline-offset-2 hover:text-primary">
                    Upgrade your plan
                  </Link>
                  .
                </>
              )}
            </li>
            <li>
              <strong className="font-medium text-foreground">Mobile app, or you need full control over every screen?</strong>{" "}
              {apiAccessAllowed ? (
                <>
                  →{" "}
                  <Link
                    href={API_INTEGRATION_HREF}
                    className="text-foreground underline underline-offset-2 hover:text-primary"
                  >
                    API
                  </Link>{" "}
                  (Pro plan and above).
                </>
              ) : (
                <>
                  → API (Pro plan and above).{" "}
                  <Link href="/account/plans" className="text-foreground underline underline-offset-2 hover:text-primary">
                    Upgrade your plan
                  </Link>
                  .
                </>
              )}
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
