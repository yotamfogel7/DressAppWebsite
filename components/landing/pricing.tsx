"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DRESSAPP_TRY_ON_USD,
  DRESSAPP_USER_MODEL_USD,
  formatUsd,
} from "@/lib/dressapp-usage-pricing"

const usageRates = [
  {
    label: "Virtual try-on",
    detail: "Each completed try-on session billed when rendering succeeds.",
    price: formatUsd(DRESSAPP_TRY_ON_USD),
    unit: "per try-on",
  },
  {
    label: "User model creation",
    detail: "First-time digital twin or model refresh from shopper inputs.",
    price: formatUsd(DRESSAPP_USER_MODEL_USD),
    unit: "per user model",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-[calc(6rem-10px)] lg:py-[calc(8rem-10px)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">
            Pricing
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Pay for what shoppers actually use
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple usage-based billing. No bundled seat tiers: you scale with traffic, not with
            guesswork.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl mx-auto rounded-2xl border border-border bg-card p-8 md:p-10"
        >
          <div className="space-y-8">
            {usageRates.map((row) => (
              <div
                key={row.label}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-8 border-b border-border last:border-0 last:pb-0"
              >
                <div className="space-y-2 max-w-xl text-left">
                  <h3 className="text-lg font-semibold">{row.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{row.detail}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-3xl font-bold tracking-tight">{row.price}</p>
                  <p className="text-sm text-muted-foreground">{row.unit}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a
                href="https://dressapp-preview.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try it out
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <a href="#contact">Talk to sales</a>
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Volume commitments and invoicing available for enterprise rollouts.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
