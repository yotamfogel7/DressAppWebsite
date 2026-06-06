"use client"

import { motion } from "framer-motion"
import { Instagram, Mail } from "lucide-react"

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "dressappsupport@gmail.com",
    href: "mailto:dressappsupport@gmail.com",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "dressapp.ai",
    href: "https://instagram.com/dressapp.ai",
  },
]

export function ContactSection() {
  return (
    <section id="contact-us" className="pt-10 pb-10 lg:pt-12 lg:pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border-2 border-primary/30 bg-card px-8 py-12 shadow-[0_8px_40px_-12px_color-mix(in_oklch,var(--primary)_18%,transparent)] lg:px-12 lg:py-14">
          <motion.div
            initial={{ y: 24 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <span className="text-accent text-sm font-semibold tracking-wide uppercase">
              Contact us
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              Get in touch
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Questions about DressApp, pricing, or integration? Reach out and we&apos;ll get back to
              you.
            </p>
          </motion.div>

          <div className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
            {contactLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ y: 16 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-1 items-center gap-4 rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <link.icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">{link.label}</p>
                  <p className="text-base font-semibold text-foreground">{link.value}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
