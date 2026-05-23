"use client"

import { motion } from "framer-motion"
import {
  Sparkles,
  Rotate3D,
  Ruler,
  MessageCircle,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react"
import type { SVGProps } from "react"

function GenderSupportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="9" cy="14" r="4" />
      <path d="M9 10V4M9 4H6M9 4h3" />
      <circle cx="17" cy="6" r="3" />
      <path d="M17 9v5M17 14h3M17 14h-3" />
    </svg>
  )
}

type Feature = {
  icon: LucideIcon | typeof GenderSupportIcon
  iconClassName: string
  iconBgClassName: string
  title: string
}

const features: Feature[] = [
  {
    icon: Sparkles,
    iconClassName: "text-blue-500",
    iconBgClassName: "bg-blue-500/10 group-hover:bg-blue-500/20",
    title: "Size and fit-accurate visualizations based on user measurements",
  },
  {
    icon: Rotate3D,
    iconClassName: "text-orange-500",
    iconBgClassName: "bg-orange-500/10 group-hover:bg-orange-500/20",
    title: "Front and back realistic virtual try-ons",
  },
  {
    icon: Ruler,
    iconClassName: "text-amber-500",
    iconBgClassName: "bg-amber-500/10 group-hover:bg-amber-500/20",
    title: "Size recommendation based on measurements and user preferences",
  },
  {
    icon: MessageCircle,
    iconClassName: "text-green-500",
    iconBgClassName: "bg-green-500/10 group-hover:bg-green-500/20",
    title: "Fit description – how will each size feel on the user",
  },
  {
    icon: LayoutDashboard,
    iconClassName: "text-purple-500",
    iconBgClassName: "bg-purple-500/10 group-hover:bg-purple-500/20",
    title: "Usage dashboard for monitoring metrics",
  },
  {
    icon: GenderSupportIcon,
    iconClassName: "text-sky-400",
    iconBgClassName: "bg-sky-400/10 group-hover:bg-sky-400/20",
    title: "Both gender support",
  },
]

export function Features() {
  return (
    <section id="features" className="pt-10 pb-10 lg:pt-12 lg:pb-12 bg-card">
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
            Built for accuracy and quality
            <br />
            <span className="text-muted-foreground">to keep your store's standard high</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Increase conversions and customer satisfaction while reducing returns.
            Have a unique selling point that will keep people coming back.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl border border-border bg-background hover:border-accent/50 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors mb-6 ${feature.iconBgClassName}`}
                >
                  <Icon className={`w-6 h-6 ${feature.iconClassName}`} />
                </div>

                <h3 className="text-lg font-semibold leading-snug">{feature.title}</h3>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
