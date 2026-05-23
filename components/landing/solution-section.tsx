"use client"

import { motion, useInView } from "framer-motion"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState, type ReactNode, type SVGProps } from "react"
import { Scan, Shirt, Eye } from "lucide-react"
import { UserModelDemo } from "@/components/landing/user-model-demo"

type CategoryIconProps = SVGProps<SVGSVGElement>

function CategoryIconBase({ children, ...props }: CategoryIconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

function TShirtIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M9 4 7 6v2l-2 1.5V20h14V9.5L17 8V6l-2-2" />
      <path d="M9 4h6" />
      <path d="M12 4v3.5" />
    </CategoryIconBase>
  )
}

function PantsIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M8 4h8l1 4-1.5 16h-5L9 8 8 4Z" />
      <path d="M12 8v12" />
    </CategoryIconBase>
  )
}

function ShortsIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M8 4h8l1 4-1 8h-4l-.5-4-.5 4H8L7 8l1-4Z" />
      <path d="M12 8v4" />
    </CategoryIconBase>
  )
}

function LongSleeveIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M8 5 6.5 7v3L5 11.5V20h14v-8.5L17.5 10V7L16 5" />
      <path d="M8 5h8" />
      <path d="M12 5v4" />
      <path d="M6.5 7 8 8.5M17.5 7 16 8.5" />
    </CategoryIconBase>
  )
}

function SweatshirtIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M8 6 6.5 8v2.5L5 12v8h14v-8l-1.5-1.5V8L16 6" />
      <path d="M8 6h8" />
      <path d="M7 18h10" />
      <path d="M12 6v3" />
    </CategoryIconBase>
  )
}

function JacketIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M9 4 7.5 6.5V20h9V6.5L15 4" />
      <path d="M9 4h6" />
      <path d="M12 4v16" />
      <path d="M7.5 6.5 9 8M16.5 6.5 15 8" />
      <path d="M9 11h6" />
    </CategoryIconBase>
  )
}

function CoatIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M9 3 7 6v14h10V6l-2-3" />
      <path d="M9 3h6" />
      <path d="M12 3v17" />
      <path d="M7 10h10" />
      <path d="M8.5 6 10 8M15.5 6 14 8" />
    </CategoryIconBase>
  )
}

function SuitIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M9 4 7.5 6v3l-1.5 1V20h12v-10l-1.5-1V6L15 4" />
      <path d="M9 4h6" />
      <path d="M12 4v16" />
      <path d="M10 10h4" />
      <path d="M11.5 13h1" />
    </CategoryIconBase>
  )
}

function DressIcon(props: CategoryIconProps) {
  return (
    <CategoryIconBase {...props}>
      <path d="M10 4h4l2 4-1 12H9L8 8l2-4Z" />
      <path d="M12 4v4" />
      <path d="M10.5 11h3" />
    </CategoryIconBase>
  )
}

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
  { label: "T-shirts", Icon: TShirtIcon },
  { label: "Pants", Icon: PantsIcon },
  { label: "Shorts", Icon: ShortsIcon },
  { label: "Long-sleeved shirts", Icon: LongSleeveIcon },
  { label: "Sweatshirts", Icon: SweatshirtIcon },
  { label: "Jackets", Icon: JacketIcon },
  { label: "Coats", Icon: CoatIcon },
  { label: "Suits", Icon: SuitIcon },
  { label: "Dresses", Icon: DressIcon },
] as const

// Drop try-on images in /public/try-ons/ (1.png, 2.png, …).
const tryOnRouletteImages = Array.from({ length: 16 }, (_, i) => ({
  src: `/try-ons/${i + 1}.png`,
  alt: `Virtual try-on example ${i + 1}`,
}))

function TryOnRoulette() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const loop = useMemo(
    () =>
      tryOnRouletteImages.length && !reducedMotion
        ? [...tryOnRouletteImages, ...tryOnRouletteImages]
        : [...tryOnRouletteImages],
    [reducedMotion],
  )

  if (!tryOnRouletteImages.length) return null

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
            <p className="text-sm text-muted-foreground mb-4">Supported try-on categories:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {supportedCategories.map(({ label, Icon }) => (
                <div
                  key={label}
                  role="img"
                  aria-label={label}
                  title={label}
                  className="group flex flex-col items-center"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary border border-border text-muted-foreground transition-colors group-hover:border-accent/30 group-hover:text-accent">
                    <Icon className="h-5 w-5" />
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
