"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

type SizeOption = {
  id: string
  label: string
  tryOnSrc: string
}

type DemoGarment = {
  id: number
  originalSrc: string
  sizes: SizeOption[]
}

const demoGarments: DemoGarment[] = [
  {
    id: 1,
    originalSrc: "/component/demo1_original.jpg",
    sizes: [
      { id: "xs", label: "XS", tryOnSrc: "/component/demo1_xs.png" },
      { id: "s", label: "S", tryOnSrc: "/component/demo1_s.png" },
      { id: "m", label: "M", tryOnSrc: "/component/demo1_m.png" },
      { id: "l", label: "L", tryOnSrc: "/component/demo1_l.png" },
      { id: "xl", label: "XL", tryOnSrc: "/component/demo1_xl.png" },
    ],
  },
  {
    id: 2,
    originalSrc: "/component/demo2_original.jpg",
    sizes: [
      { id: "s", label: "S", tryOnSrc: "/component/demo2_s.png" },
      { id: "m", label: "M", tryOnSrc: "/component/demo2_m.png" },
      { id: "l", label: "L", tryOnSrc: "/component/demo2_l.png" },
      { id: "xl", label: "XL", tryOnSrc: "/component/demo2_xl.png" },
      { id: "xxl", label: "XXL", tryOnSrc: "/component/demo2_xxl.png" },
    ],
  },
]

const easeOutStrong = [0.22, 1, 0.36, 1] as const

const PANEL =
  "flex flex-col min-w-0 w-full rounded-xl border border-border bg-background/40 overflow-hidden"

const PANEL_LABEL =
  "text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground px-2 sm:px-3 py-2 border-b border-border bg-muted/20"

const IMAGE_AREA = "relative w-full aspect-square bg-[oklch(0.1_0.01_280)]"

/** Try-on demo for the hero. Anchor id `product` for in-page nav. */
export function SeeItInActionDemo() {
  const [activeIndex, setActiveIndex] = useState(0)
  const garment = demoGarments[activeIndex]!
  const [sizeId, setSizeId] = useState(garment.sizes[0]!.id)

  useEffect(() => {
    const sizes = demoGarments[activeIndex]!.sizes
    setSizeId((prev) => {
      const ok = sizes.some((s) => s.id === prev)
      return ok ? prev : sizes[0]!.id
    })
  }, [activeIndex])

  const activeSize = garment.sizes.find((s) => s.id === sizeId) ?? garment.sizes[0]!

  const nextGarment = () => {
    setActiveIndex((prev) => (prev + 1) % demoGarments.length)
  }

  const prevGarment = () => {
    setActiveIndex((prev) => (prev - 1 + demoGarments.length) % demoGarments.length)
  }

  return (
    <div id="product" className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.05, ease: easeOutStrong }}
        className="relative"
      >
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-[0_20px_60px_-28px_oklch(0.05_0.03_280/0.45)]">
          <div className="bg-secondary/90 p-3 sm:p-4">
            <div className="flex flex-row items-stretch gap-3 sm:gap-4 min-w-0">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={PANEL}>
                  <span className={PANEL_LABEL}>Product</span>
                  <div className={IMAGE_AREA}>
                    <Image
                      src={garment.originalSrc}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 280px, 42vw"
                      className="object-cover object-center"
                      onError={(e) => {
                        console.error(
                          "[SeeItInActionDemo] failed to load original image",
                          garment.originalSrc,
                          e,
                        )
                      }}
                    />
                  </div>
                </div>

                <div className={PANEL}>
                  <span className={PANEL_LABEL}>Try-on</span>
                  <div className={IMAGE_AREA}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${garment.id}-${activeSize.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.32, ease: easeOutStrong }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={activeSize.tryOnSrc}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 280px, 42vw"
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
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div
                className="flex flex-row sm:flex-col gap-2 sm:gap-2 justify-center sm:justify-center shrink-0 w-full sm:w-[3.25rem] py-1 sm:py-0"
                role="radiogroup"
                aria-label="Sizes"
              >
                {garment.sizes.map((s) => {
                  const on = s.id === sizeId
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={`Size ${s.label}`}
                      onClick={() => setSizeId(s.id)}
                      className={[
                        "flex-1 sm:flex-none sm:w-full min-w-0 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold tabular-nums transition-colors duration-200 outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary",
                        on
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-background/80 text-foreground border border-border hover:bg-background",
                      ].join(" ")}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-5 border-t border-border/60 pt-3 pb-1">
              <button
                type="button"
                onClick={prevGarment}
                className="h-9 w-9 rounded-full border border-border bg-background/60 flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                aria-label="Previous look"
              >
                <ChevronLeft className="size-4" strokeWidth={2} />
              </button>
              <div className="flex items-center gap-2" role="tablist" aria-label="Demo look">
                {demoGarments.map((_, i) => {
                  const on = i === activeIndex
                  return (
                    <button
                      key={demoGarments[i]!.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-label={`Look ${i + 1}`}
                      onClick={() => setActiveIndex(i)}
                      className={[
                        "h-2 rounded-full transition-all duration-200",
                        on ? "w-7 bg-accent" : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/55",
                      ].join(" ")}
                    ></button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={nextGarment}
                className="h-9 w-9 rounded-full border border-border bg-background/60 flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                aria-label="Next look"
              >
                <ChevronRight className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
