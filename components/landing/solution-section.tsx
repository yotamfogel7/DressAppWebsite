"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Scan, Shirt, Eye } from "lucide-react"

const solutionSteps = [
  {
    icon: Scan,
    title: "Create Your Model",
    description:
      "Users upload photos and insert their measurements to generate a personalized digital model.",
  },
  {
    icon: Shirt,
    title: "Browse & Discover",
    description:
      "Scroll through the shop, find something they like, and get tailored fit recommendations for that item.",
  },
  {
    icon: Eye,
    title: "Visualize & Buy",
    description:
      "See size-accurate and fit-accurate visualizations: front and back views in different poses.",
  },
]

const supportedCategories = [
  "Tops",
  "Jeans",
  "Shorts",
  "Long-sleeved shirts",
  "Jackets",
  "Suits",
  "Dresses",
  "And more...",
]

export function SolutionSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section
      id="solution"
      className="relative py-[calc(6rem-10px)] md:py-[calc(8rem-10px)] overflow-hidden"
      ref={sectionRef}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
              The Solution
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance mb-6">
              AI-Powered Virtual Try-On Engine
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Let users visualize clothing on themselves with{" "}
              <span className="text-foreground font-medium">size and fit accuracy</span> as a top
              priority.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {solutionSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="relative"
              >
                {index < solutionSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent/50 to-transparent" />
                )}

                <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-accent">Step {index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground mb-4">Supported categories:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {supportedCategories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1.5 text-sm rounded-full bg-secondary border border-border"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
