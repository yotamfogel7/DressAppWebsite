"use client"

import { motion } from "framer-motion"
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Layers, 
  Globe, 
  Code2,
  ArrowUpRight
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-500ms rendering powered by our proprietary AI engine. No waiting, just seamless visualization.",
    stat: "< 500ms",
    statLabel: "avg response time"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "All processing happens on-device. Customer photos never leave their browser.",
    stat: "100%",
    statLabel: "client-side processing"
  },
  {
    icon: BarChart3,
    title: "Conversion Boost",
    description: "Customers who use virtual try-on are 3x more likely to complete their purchase.",
    stat: "3x",
    statLabel: "higher conversion"
  },
  {
    icon: Layers,
    title: "Easy Integration",
    description: "Drop-in SDK for any e-commerce platform. Works with Shopify, Magento, WooCommerce, and custom builds.",
    stat: "2 hrs",
    statLabel: "average setup time"
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Edge deployment in 200+ locations ensures fast loading for customers worldwide.",
    stat: "200+",
    statLabel: "edge locations"
  },
  {
    icon: Code2,
    title: "Developer Friendly",
    description: "Comprehensive API, webhooks, and detailed documentation. Build custom experiences with ease.",
    stat: "99.9%",
    statLabel: "uptime SLA"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-card">
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
            Enterprise-grade infrastructure
            <br />
            <span className="text-muted-foreground">for fashion innovation</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to deliver exceptional virtual try-on experiences 
            at scale, backed by robust technology and dedicated support.
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
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {feature.description}
              </p>
              
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
