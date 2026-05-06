"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Now available for enterprise partners
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
          >
            Virtual try-on
            <br />
            <span className="text-muted-foreground">for every store</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty"
          >
            Empower your customers to visualize apparel before purchasing. 
            Reduce returns by 40% and increase conversions with AI-powered 
            virtual fitting technology.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="group" asChild>
              <a
                href="https://dressapp-preview.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try it out
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="group">
              <Play className="mr-2 h-4 w-4" />
              Watch demo
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-6">
              Trusted by leading fashion brands worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["Nordstrom", "ASOS", "Zalando", "H&M", "Uniqlo", "Mango"].map((brand) => (
                <span
                  key={brand}
                  className="text-lg font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {brand}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
