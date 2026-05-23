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
    <section id="contact-us" className="pt-10 pb-10 lg:pt-12 lg:pb-12 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-1 items-center gap-4 rounded-2xl border border-border bg-background p-6 transition-colors hover:border-accent/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
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
    </section>
  )
}
