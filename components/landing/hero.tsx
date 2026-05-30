"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { SeeItInActionDemo } from "@/components/landing/demo-section"

const easeOutStrong = [0.22, 1, 0.36, 1] as const

export function Hero() {
  return (
    <section className="relative flex items-start overflow-x-clip pt-20 pb-6 lg:pb-8">
      <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-[calc(5rem-10px)] pb-4 lg:pt-[calc(5rem-10px)] lg:pb-6">
        <div className="grid w-full grid-cols-1 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)] lg:gap-x-12 xl:gap-x-16 lg:gap-y-0 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-full min-w-0 pl-[40px] pt-[70px] text-left lg:col-start-1 lg:row-start-1 lg:-mt-[54px]"
          >
            <Image
              src="/DressApp%20logo%20without%20sub.webp"
              alt="DressApp"
              width={1540}
              height={1453}
              className="relative -top-[40px] mb-3 h-[116px] w-auto sm:h-[124px] md:h-[140px]"
            />
            <h1 className="relative -top-[40px] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              Premium Virtual Try-ons
              <br />
              <span className="text-muted-foreground">for your store</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative -top-[40px] w-full min-w-0 pl-[40px] text-left lg:col-start-1 lg:row-start-2 mt-4 text-xl sm:text-2xl md:text-3xl font-medium text-foreground text-pretty"
          >
            Give your customers the confidence to check out!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative -top-[40px] w-full min-w-0 pl-[40px] text-left lg:col-start-1 lg:row-start-3 mt-4 text-lg md:text-xl text-muted-foreground text-pretty"
          >
            Reduce returns, increase conversions and customer satisfaction with AI-powered virtual fitting technology.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative -top-[40px] w-full min-w-0 pl-[40px] text-left lg:col-start-1 lg:row-start-4 mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
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

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeOutStrong }}
            className="relative w-full min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-4 lg:justify-self-stretch"
          >
            <SeeItInActionDemo />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
