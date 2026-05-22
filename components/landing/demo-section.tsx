"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

type SizeOption = {
  id: string
  label: string
  tryOnSrc: string
  fitDescription: string
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
    originalSrc: "/component/demo1_original.jpg",
    userPhotoSrc: "/component/usermodel_original.jpg",
    recommendedSize: "L",
    sizes: [
      {
        id: "xs",
        label: "XS",
        tryOnSrc: "/component/demo1_xs.png",
        fitDescription:
          "Runs noticeably small through the chest and shoulders. Length sits above the hip line.",
        fitStatus: "SMALL BY 9CM",
        fitTone: "bad",
      },
      {
        id: "s",
        label: "S",
        tryOnSrc: "/component/demo1_s.png",
        fitDescription:
          "Snug across the chest with shorter sleeve length. Waist and hips feel slightly constrained.",
        fitStatus: "SMALL BY 4.7CM",
        fitTone: "warn",
      },
      {
        id: "m",
        label: "M",
        tryOnSrc: "/component/demo1_m.png",
        fitDescription:
          "Feels like it was made for you. Sits well on chest, waist, and hips without feeling tight or baggy. Shoulders, sleeves, and length should look and feel right.",
        fitStatus: "GOOD FIT - SMALL BY 1.1CM",
        fitTone: "good",
      },
      {
        id: "l",
        label: "L",
        tryOnSrc: "/component/demo1_l.png",
        fitDescription:
          "Balanced through chest and waist with comfortable room to move. Sleeve and hem length align with your proportions.",
        fitStatus: "GOOD FIT - BIG BY 3.6CM",
        fitTone: "good",
      },
      {
        id: "xl",
        label: "XL",
        tryOnSrc: "/component/demo1_xl.png",
        fitDescription:
          "Extra room in the torso and sleeves. Shoulders sit slightly wide with a relaxed drape through the body.",
        fitStatus: "BIG BY 4.2CM",
        fitTone: "warn",
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
  good: "border-[oklch(0.62_0.17_145)] text-[oklch(0.72_0.17_145)]",
  warn: "border-[oklch(0.72_0.14_85)] text-[oklch(0.78_0.14_85)]",
  bad: "border-[oklch(0.62_0.2_25)] text-[oklch(0.72_0.2_25)]",
} as const

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

  const activeSize = garment.sizes.find((s) => s.id === sizeId) ?? garment.sizes[2]!

  const handleSizeChange = (nextId: string) => {
    if (nextId === sizeId) return
    const currentIndex = garment.sizes.findIndex((s) => s.id === sizeId)
    const nextIndex = garment.sizes.findIndex((s) => s.id === nextId)
    setSlideDirection(nextIndex > currentIndex ? 1 : -1)
    setSizeId(nextId)
    setShowUserPhoto(false)
  }

  const handleUserPhotoClick = () => {
    setShowUserPhoto((prev) => !prev)
  }

  useEffect(() => {
    garment.sizes.forEach((size) => {
      const img = new window.Image()
      img.src = size.tryOnSrc
    })
    const userPhoto = new window.Image()
    userPhoto.src = garment.userPhotoSrc
  }, [garment.sizes, garment.userPhotoSrc])

  return (
    <div id="product" className="w-full min-w-0 max-w-2xl lg:max-w-none">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.05, ease: easeOutStrong }}
        className="relative"
      >
        <div className="rounded-[1.25rem] border border-[oklch(0.24_0.01_280)] bg-[oklch(0.11_0.008_280)] p-3 sm:p-4 shadow-[0_24px_64px_-32px_oklch(0.05_0.03_280/0.55)]">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Product column */}
            <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[oklch(0.58_0.01_280)] sm:text-[11px]">
                Product
              </span>

              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[oklch(0.1_0.01_280)]">
                <Image
                  src={garment.originalSrc}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 240px, 42vw"
                  className="object-cover object-center"
                  priority
                  onError={(e) => {
                    console.error(
                      "[SeeItInActionDemo] failed to load original image",
                      garment.originalSrc,
                      e,
                    )
                  }}
                />
              </div>

              <div className="rounded-full border border-[oklch(0.62_0.18_295)] bg-[oklch(0.13_0.02_280)] px-3 py-2 text-center sm:px-4 sm:py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[oklch(0.96_0.005_280)] sm:text-[11px]">
                  Recommended size: {garment.recommendedSize}
                </p>
                <p className="mt-0.5 text-[9px] text-[oklch(0.58_0.01_280)] sm:text-[10px]">
                  Based on your measurements
                </p>
              </div>
            </div>

            {/* Try-on column */}
            <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[oklch(0.58_0.01_280)] sm:text-[11px]">
                Try-on · {activeSize.label}
              </span>

              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[oklch(0.1_0.01_280)]">
                <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                  {showUserPhoto ? (
                    <motion.div
                      key="user-photo"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.32, ease: easeOutStrong }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={garment.userPhotoSrc}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 240px, 42vw"
                        className="object-cover object-center"
                        onError={(e) => {
                          console.error(
                            "[SeeItInActionDemo] failed to load user photo",
                            garment.userPhotoSrc,
                            e,
                          )
                        }}
                      />
                    </motion.div>
                  ) : (
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
                      <Image
                        src={activeSize.tryOnSrc}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 240px, 42vw"
                        className="object-cover object-center"
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

                <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-2 sm:p-2.5">
                  <span className="pointer-events-none flex h-7 w-7 items-center justify-center rounded-md bg-[oklch(0.08_0.01_280/0.82)] text-[11px] font-semibold text-[oklch(0.96_0.005_280)] backdrop-blur-[2px] sm:h-8 sm:w-8 sm:text-xs">
                    {activeSize.label}
                  </span>

                  <div className="flex items-end gap-1.5 sm:gap-2">
                    <div className="pointer-events-none mb-1 flex flex-col items-end gap-0.5 text-[oklch(0.96_0.005_280/0.9)]">
                      <span className="text-[7px] font-medium tracking-[0.04em] sm:text-[8px]">
                        original user photo
                      </span>
                      <SketchArrowToPhoto className="h-3 w-10 sm:h-3.5 sm:w-11" />
                    </div>
                    <button
                      type="button"
                      aria-label="Show original user photo"
                      aria-pressed={showUserPhoto}
                      onClick={handleUserPhotoClick}
                      className={[
                        "relative h-9 w-9 shrink-0 overflow-hidden rounded-md border transition-colors duration-200 outline-none sm:h-10 sm:w-10",
                        "focus-visible:ring-2 focus-visible:ring-[oklch(0.7_0.15_280)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.1_0.01_280)]",
                        showUserPhoto
                          ? "border-[oklch(0.78_0.08_280)] ring-1 ring-[oklch(0.78_0.08_280/0.45)]"
                          : "border-[oklch(0.32_0.01_280)] hover:border-[oklch(0.48_0.01_280)]",
                      ].join(" ")}
                    >
                      <Image
                        src={garment.userPhotoSrc}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover object-center"
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
              </div>

              <div className="rounded-xl border border-[oklch(0.28_0.01_280)] bg-[oklch(0.13_0.008_280)] px-3 py-2.5 sm:px-3.5 sm:py-3">
                <p className="text-[10px] leading-relaxed text-[oklch(0.82_0.005_280)] sm:text-[11px]">
                  {activeSize.fitDescription}
                </p>
              </div>

              <div
                className={`rounded-full border bg-[oklch(0.13_0.008_280)] px-3 py-2 text-center sm:px-4 sm:py-2.5 ${FIT_TONE_STYLES[activeSize.fitTone]}`}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.06em] sm:text-[10px]">
                  {activeSize.fitStatus}
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-4 flex items-center justify-center gap-2 sm:mt-5 sm:gap-2.5"
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
                    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-colors duration-200 outline-none sm:h-10 sm:w-10 sm:text-xs",
                    "focus-visible:ring-2 focus-visible:ring-[oklch(0.7_0.15_280)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.11_0.008_280)]",
                    selected
                      ? "bg-[oklch(0.78_0.08_280)] text-[oklch(0.14_0.02_280)]"
                      : "bg-[oklch(0.18_0.01_280)] text-[oklch(0.62_0.01_280)] hover:bg-[oklch(0.22_0.01_280)] hover:text-[oklch(0.78_0.005_280)]",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
