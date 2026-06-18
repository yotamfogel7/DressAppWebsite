"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarCheck } from "lucide-react"
import { getScheduleDemoHref } from "@/lib/site-contact"

export function BookDemoSection() {
  const bookDemoHref = getScheduleDemoHref()
  const isCalendly = bookDemoHref.startsWith("http")

  return (
    <section id="book-a-demo" className="pt-10 pb-10 lg:pt-12 lg:pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border-2 border-primary/30 bg-card px-8 py-12 shadow-[0_8px_40px_-12px_color-mix(in_oklch,var(--primary)_18%,transparent)] lg:px-12 lg:py-14">
          <motion.div
            initial={{ y: 24 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-accent text-sm font-semibold tracking-wide uppercase">
              Book a demo
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              See DressApp live
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Book a short demo for a live walkthrough, see if DressApp matches your store, and ask
              questions about the app and its pricing.
            </p>

            <div className="mt-10 flex justify-center">
              <Button size="lg" className="group" asChild>
                <a
                  href={bookDemoHref}
                  {...(isCalendly
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <CalendarCheck className="mr-2 h-5 w-5" />
                  Book a demo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
