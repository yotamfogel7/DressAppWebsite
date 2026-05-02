"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"

const stats = [
  { value: 40, suffix: "%", label: "Reduction in returns", prefix: "" },
  { value: 3, suffix: "x", label: "Higher conversion rate", prefix: "" },
  { value: 50, suffix: "M+", label: "Try-ons processed", prefix: "" },
  { value: 98, suffix: "%", label: "Customer satisfaction", prefix: "" },
]

function AnimatedNumber({ value, suffix, prefix }: { value: number; suffix: string; prefix: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="text-4xl md:text-5xl lg:text-6xl font-bold">
      {prefix}{displayValue}{suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-accent/5" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">
            Results that matter
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Proven impact for
            <br />
            <span className="text-muted-foreground">fashion retailers</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              <p className="mt-2 text-muted-foreground text-sm md:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
