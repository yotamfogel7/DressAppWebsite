"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
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

// Drop try-on images in /public/try-ons/ (1.webp, 2.webp, …).
const tryOnRouletteImages = Array.from({ length: 31 }, (_, i) => ({
  src: `/try-ons/${i + 1}.webp`,
  alt: `Virtual try-on example ${i + 1}`,
}))

function LazyMarqueeImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shouldLoad) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: "320px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <div
      ref={ref}
      className="relative h-full aspect-[9/16] shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      {shouldLoad ? (
        <Image
          src={src}
          alt={alt}
          fill
          draggable={false}
          loading="lazy"
          className="pointer-events-none object-cover object-center"
          sizes="(max-width: 640px) 99px, (max-width: 768px) 117px, 135px"
          onError={() => {
            console.error("[TryOnRoulette] Failed to load image:", src)
          }}
        />
      ) : (
        <div aria-hidden className="h-full w-full bg-secondary/50" />
      )}
    </div>
  )
}

function shuffleImages<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const MARQUEE_LOOP_MS = 50_000

function TryOnRoulette() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const halfWidthRef = useRef(0)
  const pausedRef = useRef(false)
  const momentumRef = useRef(0)
  const tickFrameRef = useRef(0)
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startOffset: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  })
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [rouletteImages, setRouletteImages] = useState(tryOnRouletteImages)

  const loop = useMemo(
    () =>
      rouletteImages.length && !reducedMotion
        ? [...rouletteImages, ...rouletteImages]
        : [...rouletteImages],
    [reducedMotion, rouletteImages],
  )

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

  const applyOffset = (offset: number, wrap = true) => {
    const half = halfWidthRef.current
    let next = offset

    if (wrap && half > 0) {
      while (next <= -half) next += half
      while (next > 0) next -= half
    }

    offsetRef.current = next
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${next}px, 0, 0)`
    }
  }

  const measureTrack = () => {
    if (!trackRef.current) return
    halfWidthRef.current = trackRef.current.scrollWidth / 2
  }

  useEffect(() => {
    if (reducedMotion) return

    measureTrack()
    const observer = trackRef.current ? new ResizeObserver(measureTrack) : null
    if (trackRef.current && observer) {
      observer.observe(trackRef.current)
    }

    let lastTime = performance.now()

    const tick = (now: number) => {
      const dt = now - lastTime
      lastTime = now

      if (Math.abs(momentumRef.current) >= 0.4) {
        applyOffset(offsetRef.current + momentumRef.current * (dt / 16))
        momentumRef.current *= 0.92 ** (dt / 16)
      } else if (!pausedRef.current && halfWidthRef.current > 0) {
        momentumRef.current = 0
        const pxPerMs = halfWidthRef.current / MARQUEE_LOOP_MS
        applyOffset(offsetRef.current - pxPerMs * dt)
      } else {
        momentumRef.current = 0
        if (!dragRef.current.active) {
          pausedRef.current = false
        }
      }

      tickFrameRef.current = requestAnimationFrame(tick)
    }

    tickFrameRef.current = requestAnimationFrame(tick)

    return () => {
      observer?.disconnect()
      cancelAnimationFrame(tickFrameRef.current)
    }
  }, [reducedMotion, loop])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.button !== 0) return

    const el = containerRef.current
    if (!el) return

    pausedRef.current = true
    momentumRef.current = 0
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: offsetRef.current,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
    }
    setIsDragging(true)
    el.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !dragRef.current.active || event.pointerId !== dragRef.current.pointerId) {
      return
    }

    const deltaX = event.clientX - dragRef.current.startX
    applyOffset(dragRef.current.startOffset + deltaX, false)

    const now = performance.now()
    const elapsed = now - dragRef.current.lastTime
    if (elapsed > 0) {
      dragRef.current.velocity = ((event.clientX - dragRef.current.lastX) / elapsed) * 16
    }
    dragRef.current.lastX = event.clientX
    dragRef.current.lastTime = now
  }

  const finishDrag = () => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setIsDragging(false)
    applyOffset(offsetRef.current)
    momentumRef.current = dragRef.current.velocity * 1.35
    pausedRef.current = Math.abs(momentumRef.current) >= 0.4
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || event.pointerId !== dragRef.current.pointerId) return
    containerRef.current?.releasePointerCapture(event.pointerId)
    finishDrag()
  }

  if (!rouletteImages.length) return null

  const imageStrip = loop.map((image, index) => (
    <LazyMarqueeImage key={`${image.src}-${index}`} src={image.src} alt={image.alt} />
  ))

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

      {reducedMotion ? (
        <div
          ref={scrollRef}
          className="relative h-44 overflow-x-auto sm:h-52 md:h-60 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex h-full w-max min-w-full items-center gap-4 px-4">{imageStrip}</div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`relative h-44 overflow-hidden sm:h-52 md:h-60 touch-pan-y ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={finishDrag}
        >
          <div
            ref={trackRef}
            className="flex h-full w-max items-center gap-4 px-4 will-change-transform"
          >
            {imageStrip}
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Real generated try-ons on user models
      </p>
    </div>
  )
}

export function SolutionSection() {
  return (
    <section
      id="solution"
      className="relative -mt-10 overflow-hidden pt-10 pb-10 md:-mt-14 md:pt-14 md:pb-12"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
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
                initial={{ y: 16 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
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
                  <p className="text-sm text-foreground/75 leading-relaxed">{step.description}</p>
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
