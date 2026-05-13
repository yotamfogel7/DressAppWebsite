"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote: "DressApp transformed our online shopping experience. Our return rate dropped by 35% in the first quarter alone.",
    author: "Sarah Chen",
    role: "Head of E-Commerce",
    company: "ModernWear",
    avatar: "SC",
  },
  {
    quote: "The integration was seamless. Our dev team had it running in production within a day. The API documentation is excellent.",
    author: "Marcus Rodriguez",
    role: "CTO",
    company: "StyleHub",
    avatar: "MR",
  },
  {
    quote: "Customer engagement skyrocketed. People spend 4x longer on product pages now, and conversion is up 280%.",
    author: "Emma Thompson",
    role: "Digital Director",
    company: "Luxe Boutique",
    avatar: "ET",
  },
]

export function Testimonials() {
  return (
    <section id="customers" className="py-[calc(6rem-10px)] lg:py-[calc(8rem-10px)] bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">
            Customer Stories
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Loved by fashion leaders
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-8 rounded-2xl border border-border bg-background"
            >
              <Quote className="w-10 h-10 text-accent/30 mb-6" />
              
              <p className="text-foreground leading-relaxed mb-8">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-semibold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
