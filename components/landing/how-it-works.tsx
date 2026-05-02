"use client"

import { motion } from "framer-motion"
import { Upload, Wand2, ShoppingBag, BarChart } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload your catalog",
    description: "Import your product images through our dashboard or API. We support all major e-commerce platforms with one-click integration.",
  },
  {
    icon: Wand2,
    step: "02", 
    title: "AI processes garments",
    description: "Our proprietary ML models analyze fabric, fit, and drape characteristics to create photorealistic virtual representations.",
  },
  {
    icon: ShoppingBag,
    step: "03",
    title: "Customers try on items",
    description: "Shoppers use their camera or upload a photo to see how items look on them, with accurate sizing recommendations.",
  },
  {
    icon: BarChart,
    step: "04",
    title: "Track your results",
    description: "Monitor engagement, conversion uplift, and return reduction through our comprehensive analytics dashboard.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-32">
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
            Get started in four
            <br />
            <span className="text-muted-foreground">simple steps</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-border" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step number circle */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-background border-2 border-accent flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                
                <div className="text-center lg:text-left">
                  <span className="text-accent text-sm font-mono">{step.step}</span>
                  <h3 className="text-xl font-semibold mt-2 mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
