"use client"

import { motion } from "framer-motion"
import {
  Shirt,
  Ruler,
  FileText,
  Puzzle,
  Settings2,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react"

const features = [
  {
    icon: Shirt,
    title: "Accurate and realistic try-ons",
    description:
      "Photoreal draping and silhouette so shoppers see how garments actually read on a body, not a generic mannequin.",
    stat: "Fit-first",
    statLabel: "visual fidelity",
  },
  {
    icon: Ruler,
    title: "Recommended size suggestion",
    description:
      "Clear size guidance per item so customers add the right SKU to cart the first time.",
    stat: "Guided",
    statLabel: "sizing per garment",
  },
  {
    icon: FileText,
    title: "Garment size and fit description",
    description:
      "Structured fit notes and measurements surfaced next to try-on so copy and visuals stay aligned.",
    stat: "Clear",
    statLabel: "fit language",
  },
  {
    icon: Puzzle,
    title: "Easy integration",
    description:
      "SDKs and patterns that slot into your PDP, cart, and analytics without replatforming your stack.",
    stat: "Low lift",
    statLabel: "implementation",
  },
  {
    icon: Settings2,
    title: "Customizability",
    description:
      "Tune UI, flows, and guardrails to your brand so the experience feels native to your store.",
    stat: "Your brand",
    statLabel: "your rules",
  },
  {
    icon: LayoutDashboard,
    title: "Usage dashboard",
    description:
      "See try-on volume, model creation, and engagement in one place for finance and product teams.",
    stat: "Live",
    statLabel: "usage visibility",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function Features() {
  return (
    <section id="features" className="py-[calc(6rem-10px)] lg:py-[calc(8rem-10px)] bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">
            Features
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Built for merchandising and growth
            <br />
            <span className="text-muted-foreground">without the fluff</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to ship trustworthy try-on, keep teams aligned, and read usage like
            any other metered product surface.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-8 rounded-2xl border border-border bg-background hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{feature.description}</p>

              <div className="pt-4 border-t border-border">
                <span className="text-2xl font-bold text-accent">{feature.stat}</span>
                <p className="text-xs text-muted-foreground mt-1">{feature.statLabel}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
