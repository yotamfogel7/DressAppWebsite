"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { consumeFreshPlanPurchase } from "@/lib/payment-success"
import type { PlanSlug } from "@/lib/plan-slugs"
import { getPlanMonthlyTryOnAllowance } from "@/lib/plan-try-on-allowance"
import { cn } from "@/lib/utils"

const easeOut = [0.22, 1, 0.36, 1] as const

const PLAN_ACCENT_GLOW: Record<PlanSlug, string> = {
  starter: "oklch(0.72 0.14 290 / 0.35)",
  growth: "oklch(0.72 0.12 155 / 0.35)",
  pro: "oklch(0.68 0.14 250 / 0.35)",
  enterprise: "oklch(0.78 0.12 75 / 0.35)",
  "enterprise-plus": "oklch(0.72 0.14 55 / 0.35)",
}

type PaymentSuccessCelebrationProps = {
  plan: PlanSlug | null
  planLabel: string | null
  subscriptionId: string
  subscriptionSaveError?: string | null
}

function fadeUp(delay: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
  }
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: easeOut },
  }
}

function useFreshPlanPurchase() {
  const [fresh] = useState(() => {
    if (typeof window === "undefined") return false
    return consumeFreshPlanPurchase()
  })
  return fresh
}

export function PaymentSuccessCelebration({
  plan,
  planLabel,
  subscriptionId,
  subscriptionSaveError = null,
}: PaymentSuccessCelebrationProps) {
  const reducedMotion = useReducedMotion()
  const freshPurchase = useFreshPlanPurchase()
  const shouldAnimate = freshPurchase && !reducedMotion
  const tryOnAllowance = getPlanMonthlyTryOnAllowance(plan)
  const accentGlow = plan ? PLAN_ACCENT_GLOW[plan] : "oklch(0.72 0.08 264 / 0.25)"

  const headline = planLabel ? `Welcome to ${planLabel}` : "Subscription confirmed"

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.92_0.03_264),transparent)]"
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center px-6 pb-20 pt-28 text-center md:pt-32">
        <div className="relative flex size-20 items-center justify-center">
          {shouldAnimate ? (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border border-[oklch(0.82_0.06_145)]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: easeOut }}
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border border-[oklch(0.82_0.06_145)]"
            />
          )}
          <motion.span
            aria-hidden
            className="relative flex size-16 items-center justify-center rounded-full bg-[oklch(0.94_0.04_145)] text-[oklch(0.52_0.14_145)] dark:bg-[oklch(0.28_0.05_145)] dark:text-[oklch(0.78_0.12_145)]"
            initial={shouldAnimate ? { scale: 0.75, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              shouldAnimate
                ? { type: "spring", stiffness: 380, damping: 22, delay: 0.08 }
                : { duration: 0 }
            }
          >
            <Check className="size-8 stroke-[2.25]" />
          </motion.span>
        </div>

        <motion.p
          className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-primary/80"
          {...fadeUp(0.12, !shouldAnimate)}
        >
          Plan active
        </motion.p>

        <motion.h1
          className="mt-3 text-2xl font-bold tracking-tight text-balance md:text-3xl"
          {...fadeUp(0.2, !shouldAnimate)}
        >
          {headline}
        </motion.h1>

        <motion.div
          className="mt-5 w-full max-w-sm"
          {...fadeUp(0.28, !shouldAnimate)}
        >
          {planLabel ? (
            <div
              className="relative overflow-hidden rounded-xl border border-border/80 bg-card/80 px-4 py-3.5 shadow-sm"
              style={{
                boxShadow: `0 0 0 1px oklch(0.92 0.01 264 / 0.5), 0 12px 40px -20px ${accentGlow}`,
              }}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">{planLabel}</span> is live on your
                account.
                {tryOnAllowance != null ? (
                  <>
                    {" "}
                    You have{" "}
                    <span className="font-medium text-foreground">
                      {tryOnAllowance.toLocaleString()} try-ons
                    </span>{" "}
                    each month.
                  </>
                ) : null}
              </p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your subscription is active. Head to settings to connect your store.
            </p>
          )}

          {!planLabel ? (
            <p className="mt-3 text-sm text-muted-foreground">
              We couldn&apos;t match a plan from the link or your account. Check billing in
              settings if something looks off.
            </p>
          ) : null}
        </motion.div>

        <motion.div
          className="mt-10 flex w-full max-w-sm flex-col gap-3"
          {...fadeUp(0.36, !shouldAnimate)}
        >
          <Button asChild size="lg" className="h-11 w-full gap-2 text-base">
            <Link href="/settings/general?welcome=1">
              Explore your dashboard
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/account">Account settings</Link>
          </Button>
        </motion.div>

        <motion.details
          className={cn(
            "mt-10 w-full max-w-sm text-left text-xs text-muted-foreground",
            !subscriptionId && "mt-8",
          )}
          open={!subscriptionId}
          {...fadeUp(0.44, !shouldAnimate)}
        >
            <summary className="cursor-pointer font-medium text-foreground/70 hover:text-foreground">
              Receipt details
            </summary>
            <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              {subscriptionSaveError ? (
                <p className="text-sm text-amber-900 dark:text-amber-100" role="alert">
                  {subscriptionSaveError}
                </p>
              ) : null}
              {!subscriptionId ? (
                <p
                  className="text-sm text-amber-900 dark:text-amber-100"
                  role="alert"
                >
                  No subscription id came back in the URL. If you already approved payment in
                  PayPal, check your PayPal receipts or contact us with the purchase time.
                </p>
              ) : (
                <p>
                  <span className="font-medium uppercase tracking-wide">PayPal subscription id</span>
                  <span className="mt-1 block break-all font-mono text-[0.8125rem] text-foreground/80">
                    {subscriptionId}
                  </span>
                </p>
              )}
            </div>
          </motion.details>
      </div>
    </div>
  )
}
