import Link from "next/link"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

type IntegrationDetailShellProps = {
  title: string
  description: string
  icon?: LucideIcon
  imageSrc?: string
  imageAlt?: string
  backHref?: string
  backLabel?: string
  titleAction?: React.ReactNode
  children: React.ReactNode
}

export function IntegrationDetailShell({
  title,
  description,
  icon: Icon,
  imageSrc,
  imageAlt,
  backHref = "/integrations",
  backLabel = "All integrations",
  titleAction,
  children,
}: IntegrationDetailShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-32">
        <Link
          href={backHref}
          className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {backLabel}
        </Link>

        <header className="mt-8 border-b border-border pb-10">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt ?? title}
                width={48}
                height={48}
                className="h-8 w-8 object-contain"
              />
            ) : Icon ? (
              <Icon className="h-7 w-7" aria-hidden />
            ) : null}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            {titleAction}
          </div>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground text-pretty">
            {description}
          </p>
        </header>

        <div className="mt-10 space-y-14">{children}</div>
      </div>
      <Footer />
    </main>
  )
}
