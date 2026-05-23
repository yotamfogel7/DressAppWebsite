"use client"

import { motion } from "framer-motion"
import { Code2, ShoppingBag, BarChart3 } from "lucide-react"

const steps = [
  {
    icon: Code2,
    step: "01",
    title: "Integrate DressApp into your website",
    description:
      "Use our SDK, API or our Shopify app to embed DressApp in your store.",
  },
  {
    icon: ShoppingBag,
    step: "02",
    title: "Customers try on items",
    description:
      "Shoppers create their own user model, then scroll your store and visualize how your items look on them, with sizing guidance they can trust.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Track your results",
    description:
      "Monitor engagement, conversion uplift, and return reduction through our analytics dashboard.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">
            How it works
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Get started in three
            <br />
            <span className="text-muted-foreground">simple steps</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-border" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
