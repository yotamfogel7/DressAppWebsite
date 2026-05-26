"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PRICING_PLANS } from "@/lib/pricing-plans"

function PricingCard({
  plan,
  index,
}: {
  plan: (typeof PRICING_PLANS)[number]
  index: number
}) {
  const ctaHref = `/plans/select?plan=${encodeURIComponent(plan.slug)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        "relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm",
        plan.popular && "ring-2 ring-amber-400/80",
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3 right-4 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-semibold text-amber-950">
          Popular
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
          {plan.priceSuffix && (
            <span className="text-sm text-muted-foreground">
              {plan.priceSuffix}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {plan.description}
        </p>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button size="lg" className={cn("w-full", plan.buttonClassName)} asChild>
        <Link href={ctaHref}>{plan.cta}</Link>
      </Button>
    </motion.div>
  )
}

export function Pricing() {
  const topPlans = PRICING_PLANS.slice(0, 3)
  const bottomPlans = PRICING_PLANS.slice(3)

  return (
    <section id="pricing" className="pt-10 pb-10 lg:pt-12 lg:pb-12">
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
            Plans that scale with your store
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Monthly try-on bundles with support and dashboard included. Pick a
            tier or talk to us for custom volume.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topPlans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {bottomPlans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index + 3} />
          ))}
        </div>
      </div>
    </section>
  )
}
