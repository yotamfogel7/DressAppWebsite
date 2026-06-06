"use client"

import { motion } from "framer-motion"
import { UserPlus, Code2, BarChart3 } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create an account",
    description:
      "Sign up in minutes, pick a plan, and get your DressApp credentials ready.",
  },
  {
    icon: Code2,
    step: "02",
    title: "Integrate DressApp into your storefront",
    description:
      "Use our SDK, API, or Shopify app to embed virtual try-on in your store.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Customers try on items and you track the results",
    description:
      "Shoppers visualize fit on their own model while you monitor engagement, conversions, and return reduction.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ y: 24 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">
            Get Started
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Get started in three
            <br />
            <span className="text-muted-foreground">simple steps</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            From signup to live try-ons on your storefront - three straightforward steps to get
            DressApp running.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-border" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="relative z-10 w-12 h-12 rounded-full bg-background border-2 border-accent flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>

                <div className="text-center lg:text-left">
                  <span className="text-accent text-sm font-mono">{step.step}</span>
                  <h3 className="text-xl font-semibold mt-2 mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
