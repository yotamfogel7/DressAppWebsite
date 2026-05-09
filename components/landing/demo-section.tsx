"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const demoItems = [
  {
    id: 1,
    title: "Casual Blazer",
    original: "/demo/blazer-original.jpg",
    tryon: "/demo/blazer-tryon.jpg",
    color: "Navy Blue",
  },
  {
    id: 2,
    title: "Summer Dress",
    original: "/demo/dress-original.jpg",
    tryon: "/demo/dress-tryon.jpg",
    color: "Floral Print",
  },
  {
    id: 3,
    title: "Denim Jacket",
    original: "/demo/jacket-original.jpg",
    tryon: "/demo/jacket-tryon.jpg",
    color: "Light Wash",
  },
]

export function DemoSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVirtualView, setIsVirtualView] = useState(true)

  const nextItem = () => {
    setActiveIndex((prev) => (prev + 1) % demoItems.length)
  }

  const prevItem = () => {
    setActiveIndex((prev) => (prev - 1 + demoItems.length) % demoItems.length)
  }

  return (
    <section id="product" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">
            See it in action
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Experience the magic of
            <br />
            <span className="text-muted-foreground">virtual fitting</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          {/* Main demo area */}
          <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Before/After comparison */}
              <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[600px] bg-secondary">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full max-w-md mx-auto p-8">
                    {/* Placeholder for demo images */}
                    <div className="relative w-full h-full rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                      <motion.div
                        key={`${activeIndex}-${isVirtualView}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {/* Silhouette visualization */}
                        <div className="relative">
                          <svg
                            width="200"
                            height="400"
                            viewBox="0 0 200 400"
                            className="text-muted-foreground/30"
                          >
                            {/* Body silhouette */}
                            <ellipse cx="100" cy="40" rx="35" ry="40" fill="currentColor" />
                            <rect x="70" y="75" width="60" height="100" rx="10" fill="currentColor" />
                            <rect x="30" y="80" width="40" height="80" rx="8" fill="currentColor" />
                            <rect x="130" y="80" width="40" height="80" rx="8" fill="currentColor" />
                            <rect x="75" y="170" width="25" height="120" rx="8" fill="currentColor" />
                            <rect x="100" y="170" width="25" height="120" rx="8" fill="currentColor" />
                          </svg>
                          {/* Clothing overlay */}
                          {isVirtualView && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute top-[75px] left-1/2 -translate-x-1/2"
                            >
                              <div className="w-[80px] h-[100px] rounded-lg bg-accent/80 border-2 border-accent flex items-center justify-center">
                                <Sparkles className="text-accent-foreground" size={24} />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* View toggle */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full p-1">
                        <button
                          onClick={() => setIsVirtualView(false)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            !isVirtualView ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                          }`}
                        >
                          Original
                        </button>
                        <button
                          onClick={() => setIsVirtualView(true)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            isVirtualView ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                          }`}
                        >
                          Try-On
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls and info */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-8">
                  <span className="text-muted-foreground text-sm">
                    Item {activeIndex + 1} of {demoItems.length}
                  </span>
                  <h3 className="text-2xl font-bold mt-2">{demoItems[activeIndex].title}</h3>
                  <p className="text-muted-foreground mt-1">{demoItems[activeIndex].color}</p>
                </div>

                {/* Feature highlights */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Real-time rendering</p>
                      <p className="text-sm text-muted-foreground">
                        See garments on any body type in under 500ms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Accurate fit prediction</p>
                      <p className="text-sm text-muted-foreground">
                        AI-powered sizing recommendations with 95% accuracy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Multi-angle views</p>
                      <p className="text-sm text-muted-foreground">
                        360° visualization for complete confidence
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevItem}
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    aria-label="Previous item"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextItem}
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    aria-label="Next item"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="flex-1" />
                  <Button asChild>
                    <Link href="/integration">Integration guide</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
