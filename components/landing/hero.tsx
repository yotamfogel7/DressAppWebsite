"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { SeeItInActionDemo } from "@/components/landing/demo-section"

const easeOutStrong = [0.22, 1, 0.36, 1] as const

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-x-clip pt-20">
      <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-[calc(6rem-10px)] lg:py-[calc(8rem-10px)]">
        <div className="grid w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)] gap-10 lg:gap-12 xl:gap-16 items-start">
          <div className="w-full min-w-0 pl-[40px] text-left">
           

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
            >
              Premium Virtual Try-Ons
              <br />
              <span className="text-muted-foreground">for your store</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 text-xl sm:text-2xl md:text-3xl font-medium text-foreground text-pretty"
            >
              Give your customers the confidence to check out!
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-lg md:text-xl text-muted-foreground text-pretty"
            >
              Reduce returns, increase conversions and customer satisfaction with AI-powered virtual fitting technology.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <Button size="lg" className="group w-fit" asChild>
                <a
                  href="https://dressapp-preview.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Try it out
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOutStrong }}
            className="relative w-full min-w-0 lg:col-start-2 lg:justify-self-stretch"
          >
            <SeeItInActionDemo />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
