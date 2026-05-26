"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

type OnboardingShellProps = {
  step: number
  totalSteps: number
  eyebrow: string
  title: string
  description?: string
  wide?: boolean
  children: React.ReactNode
}

export function OnboardingShell({
  step,
  totalSteps,
  eyebrow,
  title,
  description,
  wide = false,
  children,
}: OnboardingShellProps) {
  const progress = (step / totalSteps) * 100
  const containerClass = wide ? "max-w-7xl" : "max-w-3xl"

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.92_0.03_264),transparent)]"
      />

      <header
        className={cn(
          "relative z-10 mx-auto flex items-center justify-between px-6 pt-8",
          containerClass,
        )}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground/80 transition-colors hover:text-foreground"
        >
          DressApp
        </Link>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Step {step} of {totalSteps}
        </p>
      </header>

      <div
        className={cn(
          "relative z-10 mx-auto w-full px-6 pb-16 pt-6",
          containerClass,
        )}
      >
        <div className="mb-10 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <motion.div
          key={`${step}-${title}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary/80">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : null}
        </motion.div>

        <div className={cn("mt-10")}>{children}</div>
      </div>
    </div>
  )
}
