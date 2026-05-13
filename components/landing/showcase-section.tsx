"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"

const showcaseImages = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iqL8vOxnTbXeM9QF3EvCNCpzhcMWPu.png",
    alt: "Size visualization across XL, L, M, S, XS sizes",
    title: "Size Visualization",
    description: "See how any garment fits across all sizes instantly",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-iKd6e8mgx4Qy9Aiwztc1q1PCAjJFX8.jpeg",
    alt: "AI model generation from selfie",
    title: "AI Model Generation",
    description: "Transform any photo into a professional model pose",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-UUYQiphOTgOWtSNTBUd4ixKpwmxrAv.png",
    alt: "Female model generation example",
    title: "Universal Compatibility",
    description: "Works for all body types, genders, and styles",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6rpO0PrhFM3Po9MMO8NYSZmH9Np43v.png",
    alt: "Product page integration with try-on",
    title: "Seamless Integration",
    description: "Embed directly into your existing product pages",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-soGjfw7Gz68ipsb8JuDyNB7s16159f.jpeg",
    alt: "Pants size visualization",
    title: "Full Catalog Support",
    description: "Tops, bottoms, dresses: visualize your entire catalog",
  },
]

export function ShowcaseSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const [activeShowcase, setActiveShowcase] = useState(0)

  return (
    <section
      id="showcase"
      className="relative py-[calc(6rem-10px)] md:py-[calc(8rem-10px)] overflow-hidden border-t border-border"
      ref={sectionRef}
    >
      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="text-center mb-8">
            <span className="text-accent text-sm font-semibold tracking-wide uppercase">
              See it in action
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold mb-2">Product gallery</h2>
            <p className="text-muted-foreground">
              Real examples of DressApp virtual try-on technology
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-border bg-card mb-6">
            <div className="aspect-[16/9] relative">
              <Image
                src={showcaseImages[activeShowcase].src}
                alt={showcaseImages[activeShowcase].alt}
                fill
                className="object-contain bg-black/50"
                sizes="(max-width: 768px) 100vw, 80vw"
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {showcaseImages[activeShowcase].title}
                </h3>
                <p className="text-white/70">{showcaseImages[activeShowcase].description}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            {showcaseImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveShowcase(index)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  activeShowcase === index
                    ? "border-accent ring-2 ring-accent/20"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <div className="w-24 h-16 md:w-32 md:h-20 relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                  {activeShowcase !== index && <div className="absolute inset-0 bg-black/40" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
