"use client"

import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { Scan, Shirt, Eye } from "lucide-react"
import { UserModelDemo } from "@/components/landing/user-model-demo"

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
  { label: "Shirts", icon: "/icons/shirt.png" },
  { label: "Pants", icon: "/icons/pants.png" },
  { label: "Shorts", icon: "/icons/shorts.png" },
  { label: "Sweatshirts", icon: "/icons/sweatshirt.png" },
  { label: "Jackets", icon: "/icons/jacket.png" },
  { label: "Suits", icon: "/icons/suit.png" },
  { label: "Dresses", icon: "/icons/dress.png" },
  { label: "Skirts", icon: "/icons/skirt.png" },
  { label: "Hats", icon: "/icons/hat.png" },
  { label: "Sunglasses", icon: "/icons/sunglasses.png" },
  { label: "Bags", icon: "/icons/bag.png" },
  { label: "Jewelry", icon: "/icons/jewlery.png" },
  { label: "Watches", icon: "/icons/wristwatch.png" },
] as const

// Drop try-on images in /public/try-ons/ (1.png, 2.png, …).
const tryOnRouletteImages = Array.from({ length: 31 }, (_, i) => ({
  src: `/try-ons/${i + 1}.png`,
  alt: `Virtual try-on example ${i + 1}`,
}))

function shuffleImages<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function TryOnRoulette() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [rouletteImages, setRouletteImages] = useState(tryOnRouletteImages)

  useEffect(() => {
    setRouletteImages(shuffleImages(tryOnRouletteImages))
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const loop = useMemo(
    () =>
      rouletteImages.length && !reducedMotion
        ? [...rouletteImages, ...rouletteImages]
        : [...rouletteImages],
    [reducedMotion, rouletteImages],
  )

  if (!rouletteImages.length) return null

  return (
    <div
      className="relative mt-12 w-full"
      aria-label="Virtual try-on examples"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-20"
      />

      <div
        className={`relative h-44 sm:h-52 md:h-60 ${reducedMotion ? "overflow-x-auto" : "overflow-hidden"}`}
      >
        <div
          className={`flex h-full items-center gap-4 px-4 ${loop.length && !reducedMotion ? "usage-gallery-marquee w-max" : "w-max min-w-full"}`}
          style={!reducedMotion ? { animationDuration: "50s" } : undefined}
        >
          {loop.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="relative h-full aspect-[9/16] shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 99px, (max-width: 768px) 117px, 135px"
                onError={() => {
                  console.error("[TryOnRoulette] Failed to load image:", image.src)
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SolutionSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section
      id="solution"
      className="relative -mt-10 overflow-hidden pt-10 pb-10 md:-mt-14 md:pt-14 md:pb-12"
      ref={sectionRef}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-0"
        >
          <div className="text-center mb-6">
            <h2 className="mt-10 text-3xl md:text-5xl font-bold tracking-tight text-balance mb-6">
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
            <p className="text-base font-semibold text-foreground mb-4">Supported try-on categories:</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-4">
              {supportedCategories.map(({ label, icon }) => (
                <div key={label} className="group flex flex-col items-center gap-1.5">
                  <span className="text-xs text-muted-foreground/70">{label}</span>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary border border-border transition-colors group-hover:border-accent/30">
                    <Image
                      src={icon}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TryOnRoulette />

          <UserModelDemo />
        </motion.div>
      </div>
    </section>
  )
}
