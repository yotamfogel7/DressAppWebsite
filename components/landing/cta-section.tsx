"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section id="contact" className="py-[calc(6rem-10px)] lg:py-[calc(8rem-10px)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Ready to transform your
            <br />
            e-commerce experience?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Join hundreds of fashion brands already using DressApp to reduce returns, 
            boost conversions, and delight customers. Start your free trial today.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="group" asChild>
              <a
                href="https://dressapp-demo.myshopify.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try it out
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline">
              Schedule a demo
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            14-day free trial · No credit card required · Setup in minutes
          </p>
        </motion.div>
      </div>
    </section>
  )
}
