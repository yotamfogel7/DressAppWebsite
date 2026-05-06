"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    description: "Perfect for growing brands ready to innovate",
    price: "$499",
    period: "/month",
    features: [
      "Up to 10,000 try-ons/month",
      "Basic SDK integration",
      "Email support",
      "Standard analytics",
      "2 team members",
    ],
    cta: "Try it out",
    ctaHref: "https://dressapp-preview.com",
    highlighted: false,
  },
  {
    name: "Business",
    description: "For established retailers with high volume",
    price: "$1,499",
    period: "/month",
    features: [
      "Up to 100,000 try-ons/month",
      "Advanced SDK + API access",
      "Priority support",
      "Advanced analytics + A/B testing",
      "10 team members",
      "Custom branding",
      "Webhook integrations",
    ],
    cta: "Try it out",
    ctaHref: "https://dressapp-preview.com",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large-scale operations",
    price: "Custom",
    period: "",
    features: [
      "Unlimited try-ons",
      "Full API access + white-label",
      "Dedicated account manager",
      "Custom ML model training",
      "Unlimited team members",
      "SLA guarantees",
      "On-premise deployment option",
    ],
    cta: "Contact sales",
    ctaHref: null,
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32">
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
            Simple, transparent pricing
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. 
            Scale as you grow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-accent text-accent-foreground border-2 border-accent"
                  : "bg-card border border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-foreground text-background text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className={`text-sm mt-1 ${plan.highlighted ? "text-accent-foreground/80" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`${plan.highlighted ? "text-accent-foreground/80" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-accent-foreground" : "text-accent"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-accent-foreground/90" : "text-muted-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.ctaHref ? (
                <Button
                  asChild
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <a
                    href={plan.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {plan.cta}
                  </a>
                </Button>
              ) : (
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
