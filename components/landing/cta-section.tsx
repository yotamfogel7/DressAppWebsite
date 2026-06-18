"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { getScheduleDemoHref } from "@/lib/site-contact"

export function CtaSection() {
  const scheduleDemoHref = getScheduleDemoHref()
  const isCalendly = scheduleDemoHref.startsWith("http")

  return (
    <section id="book-a-demo" className="py-[calc(6rem-10px)] lg:py-[calc(8rem-10px)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <motion.div
          initial={{ y: 24 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Ready to transform your
            <br />
            e-commerce experience?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Now onboarding design partners. Founding merchants get locked-in launch pricing and
            white-glove onboarding.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="group" asChild>
              <a
                href="https://dressapp-demo.myshopify.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try DressApp in our demo store
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href={scheduleDemoHref}
                {...(isCalendly
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                Schedule a demo
              </a>
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
