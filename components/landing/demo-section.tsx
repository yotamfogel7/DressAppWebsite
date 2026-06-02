"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import {
  DEMO_CARD,
  DEMO_COLUMN,
  TRYON_DEMO_GRID,
  TRYON_IMAGE_FRAME,
} from "@/components/landing/demo-layout"
import { ClickZoomImage } from "@/components/landing/click-zoom-image"

type SizeOption = {
  id: string
  label: string
  tryOnSrc: string
  fitStatus: string
  fitTone: "good" | "warn" | "bad"
}

type DemoGarment = {
  id: number
  originalSrc: string
  userPhotoSrc: string
  recommendedSize: string
  sizes: SizeOption[]
}

const demoGarments: DemoGarment[] = [
  {
    id: 1,
    originalSrc: "/component/demo1_original.webp",
    userPhotoSrc: "/component/usermodel_original.webp",
    recommendedSize: "L",
    sizes: [
      {
        id: "xs",
        label: "XS",
        tryOnSrc: "/component/demo1_xs.webp",
        fitStatus: "VERY SMALL - EXTREMELY TIGHT",
        fitTone: "bad",
      },
      {
        id: "s",
        label: "S",
        tryOnSrc: "/component/demo1_s.webp",
        fitStatus: "SMALL - TIGHT",
        fitTone: "warn",
      },
      {
        id: "m",
        label: "M",
        tryOnSrc: "/component/demo1_m.webp",
        fitStatus: "GOOD FIT - JUST YOUR SIZE",
        fitTone: "good",
      },
      {
        id: "l",
        label: "L",
        tryOnSrc: "/component/demo1_l.webp",
        fitStatus: "GOOD FIT - A BIT OVERSIZED",
        fitTone: "good",
      },
      {
        id: "xl",
        label: "XL",
        tryOnSrc: "/component/demo1_xl.webp",
        fitStatus: "VERY BIG - EXTREMELY OVERSIZED",
        fitTone: "bad",
      },
    ],
  },
]

const easeOutStrong = [0.22, 1, 0.36, 1] as const

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0.4,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0.4,
  }),
}

const FIT_TONE_STYLES = {
  good: "border-emerald-500/35 bg-emerald-50 text-emerald-700",
  warn: "border-amber-500/35 bg-amber-50 text-amber-800",
  bad: "border-red-500/35 bg-red-50 text-red-700",
} as const

const AUTO_SCROLL_MIN_MS = 2000
const AUTO_SCROLL_MAX_MS = 5000
const AUTO_SCROLL_PAUSE_AFTER_USER_MS = 6000

function randomAutoScrollDelayMs() {
  return (
    AUTO_SCROLL_MIN_MS +
    Math.random() * (AUTO_SCROLL_MAX_MS - AUTO_SCROLL_MIN_MS)
  )
}

/** Try-on demo for the hero. Anchor id `product` for in-page nav. */
function SketchArrowToPhoto({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 20"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M2 10 C10 6 22 4 38 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
      <path
        d="M32 6 L40 10 L32 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.92"
      />
    </svg>
  )
}

export function SeeItInActionDemo() {
  const garment = demoGarments[0]!
  const [sizeId, setSizeId] = useState("m")
  const [slideDirection, setSlideDirection] = useState(0)
  const [showUserPhoto, setShowUserPhoto] = useState(false)
  const [autoScrollPaused, setAutoScrollPaused] = useState(false)
  const autoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const activeSize = garment.sizes.find((s) => s.id === sizeId) ?? garment.sizes[2]!

  const advanceToNextSize = useCallback(() => {
    setSizeId((current) => {
      const currentIndex = garment.sizes.findIndex((s) => s.id === current)
      const nextIndex = (currentIndex + 1) % garment.sizes.length
      setSlideDirection(nextIndex > currentIndex ? 1 : -1)
      return garment.sizes[nextIndex]!.id
    })
    setShowUserPhoto(false)
  }, [garment.sizes])

  const handleSizeChange = (nextId: string) => {
    if (nextId === sizeId) return
    const currentIndex = garment.sizes.findIndex((s) => s.id === sizeId)
    const nextIndex = garment.sizes.findIndex((s) => s.id === nextId)
    setSlideDirection(nextIndex > currentIndex ? 1 : -1)
    setSizeId(nextId)
    setShowUserPhoto(false)
    setAutoScrollPaused(true)
  }

  const handleUserPhotoClick = () => {
    setShowUserPhoto((prev) => !prev)
  }

  useEffect(() => {
    const preload = (src: string) => {
      const img = new window.Image()
      img.src = src
    }

    preload(garment.originalSrc)
    preload(activeSize.tryOnSrc)
    preload(garment.userPhotoSrc)
  }, [garment.originalSrc, garment.userPhotoSrc, activeSize.tryOnSrc])

  useEffect(() => {
    if (!autoScrollPaused) return
    const resumeTimer = window.setTimeout(() => {
      setAutoScrollPaused(false)
    }, AUTO_SCROLL_PAUSE_AFTER_USER_MS)
    return () => window.clearTimeout(resumeTimer)
  }, [autoScrollPaused, sizeId])

  useEffect(() => {
    if (showUserPhoto || autoScrollPaused) return

    const scheduleNext = () => {
      autoScrollTimeoutRef.current = window.setTimeout(() => {
        advanceToNextSize()
        scheduleNext()
      }, randomAutoScrollDelayMs())
    }

    scheduleNext()
    return () => {
      if (autoScrollTimeoutRef.current !== null) {
        window.clearTimeout(autoScrollTimeoutRef.current)
        autoScrollTimeoutRef.current = null
      }
    }
  }, [showUserPhoto, autoScrollPaused, advanceToNextSize])

  return (
    <div id="product" className="relative mt-0 w-full min-w-0 lg:-mt-[54px]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.05, ease: easeOutStrong }}
        className="relative w-full overflow-visible"
      >
        <div className={DEMO_CARD}>
          <div className={TRYON_DEMO_GRID}>
            {/* Product column */}
            <div className={DEMO_COLUMN}>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
                Product
              </span>

              <div className={TRYON_IMAGE_FRAME}>
                <ClickZoomImage
                  src={garment.originalSrc}
                  alt="Product photo"
                  sizes="(min-width: 768px) 340px, 92vw"
                  imageClassName="object-cover object-center"
                  onError={(e) => {
                    console.error(
                      "[SeeItInActionDemo] failed to load original image",
                      garment.originalSrc,
                      e,
                    )
                  }}
                />
              </div>

              <div className="rounded-full border border-accent/30 bg-secondary px-3 py-1.5 text-center sm:px-4 sm:py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground sm:text-[11px]">
                  Recommended size: {garment.recommendedSize}
                </p>
                <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                  Based on your measurements
                </p>
              </div>
            </div>

            {/* Try-on column */}
            <div className={DEMO_COLUMN}>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
                Try-on · {activeSize.label}
              </span>

              <div className={TRYON_IMAGE_FRAME}>
                <AnimatePresence initial={false} custom={slideDirection}>
                  {!showUserPhoto && (
                    <motion.div
                      key={activeSize.id}
                      custom={slideDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.38, ease: easeOutStrong }}
                      className="absolute inset-0"
                    >
                      <ClickZoomImage
                        src={activeSize.tryOnSrc}
                        alt={`Try-on size ${activeSize.label}`}
                        sizes="(min-width: 768px) 340px, 92vw"
                        resetKey={activeSize.id}
                        imageClassName="h-full w-full object-contain object-center"
                        onError={(e) => {
                          console.error(
                            "[SeeItInActionDemo] failed to load try-on image",
                            activeSize.tryOnSrc,
                            e,
                          )
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {showUserPhoto && (
                    <motion.div
                      key="user-photo"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.32, ease: easeOutStrong }}
                      className="absolute inset-0 z-[1]"
                    >
                      <ClickZoomImage
                        src={garment.userPhotoSrc}
                        alt="Original user photo"
                        sizes="(min-width: 768px) 340px, 92vw"
                        resetKey={`user-photo-${sizeId}`}
                        imageClassName="h-full w-full object-contain object-center"
                        onError={(e) => {
                          console.error(
                            "[SeeItInActionDemo] failed to load user photo",
                            garment.userPhotoSrc,
                            e,
                          )
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-2.5 sm:p-3">
                  <span className="pointer-events-none flex h-14 w-14 items-center justify-center rounded-md border border-primary/20 bg-primary text-lg font-semibold text-primary-foreground shadow-sm sm:h-[60px] sm:w-[60px] sm:text-xl">
                    {activeSize.label}
                  </span>

                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    <div
                      className="pointer-events-none flex min-w-0 items-center gap-1 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9),0_0_6px_rgba(0,0,0,0.65)] sm:gap-1.5"
                      aria-hidden
                    >
                      <span className="max-w-[4.5rem] text-[9px] font-medium leading-tight tracking-[0.04em] [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.55)] sm:max-w-none sm:text-[10px]">
                        original user photo
                      </span>
                      <SketchArrowToPhoto className="h-2.5 w-7 shrink-0 sm:h-3 sm:w-8" />
                    </div>

                    <button
                      type="button"
                      aria-label="Show original user photo"
                      aria-pressed={showUserPhoto}
                      onClick={handleUserPhotoClick}
                      className={[
                        "relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md border transition-colors duration-200 outline-none sm:h-11 sm:w-11",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        showUserPhoto
                          ? "border-accent ring-1 ring-accent/40"
                          : "border-border hover:border-accent/50",
                      ].join(" ")}
                    >
                      <Image
                        src={garment.userPhotoSrc}
                        alt=""
                        fill
                        sizes="40px"
                        className="h-full w-full object-cover object-top"
                        onError={(e) => {
                          console.error(
                            "[SeeItInActionDemo] failed to load user photo",
                            garment.userPhotoSrc,
                            e,
                          )
                        }}
                      />
                    </button>
                  </div>
                </div>

                <div
                  className="pointer-events-auto absolute right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-1 sm:right-2.5 sm:gap-1.5"
                  role="radiogroup"
                  aria-label="Sizes"
                >
                  {garment.sizes.map((s) => {
                    const selected = s.id === sizeId
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={`Size ${s.label}`}
                        onClick={() => handleSizeChange(s.id)}
                        className={[
                          "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xs font-semibold tabular-nums shadow-sm transition-all duration-200 outline-none sm:h-10 sm:w-10 sm:text-sm",
                          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          "hover:scale-105 active:scale-95",
                          selected
                            ? "scale-105 border-2 border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
                            : "border-2 border-border bg-background/95 text-muted-foreground backdrop-blur-[2px] hover:border-accent/50 hover:bg-background hover:text-foreground hover:shadow",
                        ].join(" ")}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div
                className={`rounded-full border px-3 py-2.5 text-center sm:px-4 sm:py-3 ${FIT_TONE_STYLES[activeSize.fitTone]}`}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.06em] sm:text-[10px]">
                  {activeSize.fitStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
