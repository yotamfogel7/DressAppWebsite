"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Scan } from "lucide-react"
import {
  DEMO_CARD,
  DEMO_COLUMN,
  DEMO_PANEL_WIDTH,
  MOBILE_STACK_DEMO_GRID,
  MOBILE_TALL_DEMO_IMAGE_FRAME,
} from "@/components/landing/demo-layout"
import { ClickZoomImage } from "@/components/landing/click-zoom-image"

type DemoUserPhoto = {
  id: string
  photoSrc: string
  modelFrontSrc: string
  modelBackSrc: string
  label: string
}

const demoUserPhotos: DemoUserPhoto[] = [
  {
    id: "black-man",
    photoSrc: "/user_models/black_man.webp",
    modelFrontSrc: "/user_models/black_man-model.webp",
    modelBackSrc: "/user_models/black_man-model.webp",
    label: "Black man",
  },
  {
    id: "tattooed-white-man",
    photoSrc: "/tattooed_white_man.webp",
    modelFrontSrc: "/user_models/tattooed_white_man-demo.webp",
    modelBackSrc: "/user_models/tattooed_white_man-demo.webp",
    label: "Tattooed white man",
  },
  {
    id: "white-guy",
    photoSrc: "/white_guy.webp",
    modelFrontSrc: "/user_models/white_guy-model.webp",
    modelBackSrc: "/user_models/white_guy-model.webp",
    label: "White guy",
  },
  {
    id: "white-female",
    photoSrc: "/white_female.webp",
    modelFrontSrc: "/user_models/white_female-model.webp",
    modelBackSrc: "/user_models/white_female-model.webp",
    label: "White female",
  },
  {
    id: "obese-white-male",
    photoSrc: "/obese_white_male.webp",
    modelFrontSrc: "/user_models/obese_white_male-model.webp",
    modelBackSrc: "/user_models/obese_white_male-model.webp",
    label: "Obese white male",
  },
  {
    id: "tattooed-white-female",
    photoSrc: "/tattooed%20white_female.webp",
    modelFrontSrc: "/user_models/tattooed%20white_female-demo.webp",
    modelBackSrc: "/user_models/tattooed%20white_female-demo.webp",
    label: "Tattooed white female",
  },
]

const easeOutStrong = [0.22, 1, 0.36, 1] as const
const GENERATION_MS = 2000

type GenerationPhase = "idle" | "generating" | "complete"

export function UserModelDemo() {
  const [selectedId, setSelectedId] = useState(demoUserPhotos[0]?.id ?? "")
  const [phase, setPhase] = useState<GenerationPhase>("idle")
  const [modelView, setModelView] = useState<"front" | "back">("front")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedPhoto =
    demoUserPhotos.find((photo) => photo.id === selectedId) ?? demoUserPhotos[0]

  const clearGenerationTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const resetGeneration = () => {
    clearGenerationTimeout()
    setPhase("idle")
    setModelView("front")
  }

  const handlePhotoSelect = (id: string) => {
    if (id === selectedId) return
    setSelectedId(id)
    resetGeneration()
  }

  const handleGenerate = () => {
    if (!selectedPhoto || phase === "generating") return

    resetGeneration()
    setPhase("generating")

    timeoutRef.current = setTimeout(() => {
      setPhase("complete")
      timeoutRef.current = null
    }, GENERATION_MS)
  }

  useEffect(() => {
    if (!selectedPhoto) return

    const preload = (src: string) => {
      const img = new window.Image()
      img.src = src
    }

    preload(selectedPhoto.photoSrc)
    preload(selectedPhoto.modelFrontSrc)
    preload(selectedPhoto.modelBackSrc)
  }, [selectedPhoto])

  useEffect(() => {
    return () => clearGenerationTimeout()
  }, [])

  if (!selectedPhoto) {
    console.error("[UserModelDemo] No demo user photos configured.")
    return null
  }

  const modelSrc =
    modelView === "front" ? selectedPhoto.modelFrontSrc : selectedPhoto.modelBackSrc

  return (
    <div className="relative mx-auto mt-[80px] w-full">
      <div className="mb-6 text-center">
        <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-balance mb-6">
          Accurate, realistic user models
        </h3>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
          Turn user photos into a size-accurate digital twin for every try-on.
        </p>
      </div>

      <div className={`mx-auto ${DEMO_PANEL_WIDTH}`}>
        <div className={DEMO_CARD}>
        <div className={MOBILE_STACK_DEMO_GRID}>
          <div className={DEMO_COLUMN}>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
              User photo
            </span>

            <div className={MOBILE_TALL_DEMO_IMAGE_FRAME}>
              <ClickZoomImage
                src={selectedPhoto.photoSrc}
                alt={selectedPhoto.label}
                sizes="(min-width: 768px) 340px, 92vw"
                resetKey={selectedPhoto.id}
                onError={(e) => {
                  console.error(
                    "[UserModelDemo] failed to load user photo",
                    selectedPhoto.photoSrc,
                    e,
                  )
                }}
              />

              {demoUserPhotos.length > 1 && (
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap gap-1.5 p-2 sm:p-2.5">
                  {demoUserPhotos.map((photo) => {
                    const active = photo.id === selectedId
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        aria-label={`Select ${photo.label}`}
                        aria-pressed={active}
                        onClick={() => handlePhotoSelect(photo.id)}
                        className={[
                          "relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-md border transition-colors duration-200 outline-none sm:h-10 sm:w-10",
                          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          active
                            ? "border-accent ring-1 ring-accent/40"
                            : "border-border bg-background/90 hover:border-accent/50",
                        ].join(" ")}
                      >
                        <Image
                          src={photo.photoSrc}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover object-top"
                          onError={(e) => {
                            console.error(
                              "[UserModelDemo] failed to load thumbnail",
                              photo.photoSrc,
                              e,
                            )
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-full border border-border bg-secondary px-3 py-1.5 text-center sm:px-4 sm:py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground sm:text-[11px]">
                Original user photo
              </p>
              <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                Used to build the model
              </p>
            </div>
          </div>

          <div className={DEMO_COLUMN}>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
              Digital model
            </span>

            <div className={MOBILE_TALL_DEMO_IMAGE_FRAME}>
              <AnimatePresence mode="wait">
                {phase === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: easeOutStrong }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/40 px-3 text-center"
                  >
                    <Scan className="h-6 w-6 text-muted-foreground/70" aria-hidden />
                    <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                      Generate a model
                    </p>
                  </motion.div>
                )}

                {phase === "generating" && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: easeOutStrong }}
                    className="absolute inset-0 overflow-hidden bg-secondary/30"
                  >
                    <Image
                      src={selectedPhoto.photoSrc}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 340px, 92vw"
                      className="object-contain object-center opacity-35 blur-[1px]"
                      aria-hidden
                    />

                    <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/30" />

                    <motion.div
                      className="absolute inset-x-0 top-0 h-px bg-accent/70 shadow-[0_0_16px_2px_color-mix(in_oklch,var(--accent)_35%,transparent)]"
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{
                        duration: GENERATION_MS / 1000,
                        ease: easeOutStrong,
                        repeat: Infinity,
                      }}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                      <Loader2
                        className="h-5 w-5 animate-spin text-accent"
                        aria-hidden
                      />
                      <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-foreground sm:text-[10px]">
                        Building model…
                      </p>
                    </div>
                  </motion.div>
                )}

                {phase === "complete" && (
                  <motion.div
                    key={`model-${selectedPhoto.id}-${modelView}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: easeOutStrong }}
                    className="absolute inset-0"
                  >
                    <ClickZoomImage
                      src={modelSrc}
                      alt={`Generated ${modelView} view for ${selectedPhoto.label}`}
                      sizes="(min-width: 768px) 340px, 92vw"
                      resetKey={`${selectedPhoto.id}-${modelView}-${phase}`}
                      imageClassName="h-full w-full object-contain object-center"
                      onError={(e) => {
                        console.error(
                          "[UserModelDemo] failed to load model image",
                          modelSrc,
                          e,
                        )
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {phase === "complete" &&
                selectedPhoto.modelFrontSrc !== selectedPhoto.modelBackSrc && (
                <div
                  className="absolute right-2 top-2 z-10 flex rounded-full border border-border bg-background/95 p-0.5 shadow-sm backdrop-blur-[2px]"
                  role="tablist"
                  aria-label="Model view"
                >
                  {(["front", "back"] as const).map((view) => {
                    const active = modelView === view
                    return (
                      <button
                        key={view}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setModelView(view)}
                        className={[
                          "cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors outline-none sm:px-3 sm:text-[11px]",
                          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        {view}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={phase === "generating"}
              onClick={handleGenerate}
              className={[
                "group w-full cursor-pointer rounded-full border px-3 py-2 text-center transition-all duration-200 outline-none sm:px-4 sm:py-2.5",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                phase === "generating"
                  ? "border-accent/30 bg-accent/10 text-foreground"
                  : [
                      "border-accent/30 bg-secondary",
                      "hover:border-accent hover:bg-accent/15 hover:shadow-[0_4px_20px_-4px_color-mix(in_oklch,var(--accent)_30%,transparent)] hover:-translate-y-0.5",
                      "active:translate-y-0 active:scale-[0.99]",
                    ].join(" "),
                phase === "generating" ? "pointer-events-none opacity-80" : "",
              ].join(" ")}
            >
              <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors duration-200 group-hover:text-accent sm:text-[11px]">
                {phase === "generating" && (
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                )}
                {phase === "generating"
                  ? "Generating…"
                  : phase === "complete"
                    ? "Regenerate model"
                    : "Generate user model"}
              </p>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
