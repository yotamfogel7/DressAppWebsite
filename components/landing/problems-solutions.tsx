"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { 
  PackageX, 
  TrendingDown, 
  ShoppingCart, 
  ArrowRight,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Users,
  Scan,
  Shirt,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const problems = [
  {
    icon: PackageX,
    stat: "25-30%",
    title: "Return Rate",
    description: "Fashion sites experience return rates nearly 3x the e-commerce average. $850B+ in US merchandise was returned in 2024-25 alone.",
    highlight: "Massive loss"
  },
  {
    icon: DollarSign,
    stat: "$10-30",
    title: "Cost Per Return",
    description: "Return shipping, inspection, processing and restocking cost 20-65% of the item's original price. Returns are margin killers.",
    highlight: "Direct profit loss"
  },
  {
    icon: ShoppingCart,
    stat: "43%",
    title: "Cart Abandonment",
    description: "Consumers say fit uncertainty is a deterrent to shopping fashion online, leading to abandoned carts and lost conversions.",
    highlight: "Lost revenue"
  }
]

const opportunities = [
  {
    stat: "85%",
    title: "Would Buy More",
    description: "of apparel shoppers say they would buy more if they could rely on fit"
  },
  {
    stat: "78%",
    title: "Ready for Tech",
    description: "of adults aged 18-44 would use a scanning app to find their size"
  },
  {
    stat: "40-50%",
    title: "Premium Willing",
    description: "of consumers would pay more for products they could try on digitally"
  },
  {
    stat: "20%",
    title: "Price Premium",
    description: "customers are willing to pay extra for personalization and AR try-ons"
  }
]

const solutionSteps = [
  {
    icon: Scan,
    title: "Create Your Model",
    description: "Users upload photos and insert their measurements to generate a personalized digital model."
  },
  {
    icon: Shirt,
    title: "Browse & Discover",
    description: "Scroll through the shop, find something they like, and get tailored fit recommendations for that item."
  },
  {
    icon: Eye,
    title: "Visualize & Buy",
    description: "See size-accurate and fit-accurate visualizations - FRONT and BACK views in different poses."
  }
]

const showcaseImages = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iqL8vOxnTbXeM9QF3EvCNCpzhcMWPu.png",
    alt: "Size visualization across XL, L, M, S, XS sizes",
    title: "Size Visualization",
    description: "See how any garment fits across all sizes instantly"
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-iKd6e8mgx4Qy9Aiwztc1q1PCAjJFX8.jpeg",
    alt: "AI model generation from selfie",
    title: "AI Model Generation",
    description: "Transform any photo into a professional model pose"
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-UUYQiphOTgOWtSNTBUd4ixKpwmxrAv.png",
    alt: "Female model generation example",
    title: "Universal Compatibility",
    description: "Works for all body types, genders, and styles"
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6rpO0PrhFM3Po9MMO8NYSZmH9Np43v.png",
    alt: "Product page integration with try-on",
    title: "Seamless Integration",
    description: "Embed directly into your existing product pages"
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-soGjfw7Gz68ipsb8JuDyNB7s16159f.jpeg",
    alt: "Pants size visualization",
    title: "Full Catalog Support",
    description: "Tops, bottoms, dresses - visualize your entire catalog"
  }
]

const supportedCategories = [
  "Tops", "Jeans", "Shorts", "Long-sleeved shirts", 
  "Jackets", "Suits", "Dresses", "And more..."
]

function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <span ref={ref} className="tabular-nums">
      {isInView ? value : "0"}
    </span>
  )
}

export function ProblemsSolutions() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
  const [activeShowcase, setActiveShowcase] = useState(0)

  return (
    <section id="problem" className="relative py-24 md:py-32 overflow-hidden" ref={sectionRef}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container relative mx-auto px-4 md:px-6">
        {/* Section Header - Problems */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-destructive/10 text-red-400 border border-destructive/20">
            The Industry Problem
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance mb-4">
            Fashion E-Commerce is{" "}
            <span className="text-red-400">Bleeding Money</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Returns, fit uncertainty, and cart abandonment are silently destroying profit margins across the industry.
          </p>
        </motion.div>

        {/* Problems Grid - 3 Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-red-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-red-500/10">
                    <problem.icon className="h-5 w-5 text-red-400" />
                  </div>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </div>
                
                <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">
                  <AnimatedCounter value={problem.stat} />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {problem.description}
                </p>
                
                <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {problem.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Punchline Stat - 53% */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative mb-32"
        >
          <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-r from-red-950/50 via-red-900/30 to-red-950/50 border border-red-500/30 text-center overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),transparent_70%)]" />
            
            <div className="relative">
              <p className="text-muted-foreground mb-2 text-sm uppercase tracking-wider">
                Out of these returns
              </p>
              <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
                <span className="text-5xl md:text-7xl font-bold text-red-400">
                  <AnimatedCounter value="53%" />
                </span>
                <span className="text-xl md:text-2xl text-foreground max-w-md text-left">
                  are caused by <span className="text-red-400 font-semibold">fit or size issues</span>
                </span>
              </div>
              <p className="text-muted-foreground mt-4 text-lg">
                This is the core problem we solve.
              </p>
            </div>
          </div>
        </motion.div>

        {/* THE SOLUTION Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-24"
        >
          {/* Solution Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
              The Solution
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance mb-6">
              AI-Powered Virtual Try-On Engine
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Let users visualize clothing items on themselves with{" "}
              <span className="text-foreground font-medium">size and fit accuracy</span> as a top priority.
            </p>
          </div>

          {/* How It Works - 3 Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {solutionSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="relative"
              >
                {/* Connection line */}
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

          {/* Categories Supported */}
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground mb-4">Supported categories:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {supportedCategories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1.5 text-sm rounded-full bg-secondary border border-border"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                See It In Action
              </h3>
              <p className="text-muted-foreground">
                Real examples of DressApp virtual try-on technology
              </p>
            </div>

            {/* Main Showcase Image */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card mb-6">
              <div className="aspect-[16/9] relative">
                <Image
                  src={showcaseImages[activeShowcase].src}
                  alt={showcaseImages[activeShowcase].alt}
                  fill
                  className="object-contain bg-black/50"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                
                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-xl font-semibold text-white mb-1">
                    {showcaseImages[activeShowcase].title}
                  </h4>
                  <p className="text-white/70">
                    {showcaseImages[activeShowcase].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-3 justify-center flex-wrap">
              {showcaseImages.map((image, index) => (
                <button
                  key={index}
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
                    {activeShowcase !== index && (
                      <div className="absolute inset-0 bg-black/40" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* YOUR CUSTOMERS ARE WAITING Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {/* Opportunity Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              The Opportunity
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance mb-4">
              Your Customers Are{" "}
              <span className="text-emerald-400">Waiting</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Consumer readiness for virtual try-on technology is already high among the most active shopping demographic.
            </p>
          </div>

          {/* Opportunity Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {opportunities.map((opp, index) => (
              <motion.div
                key={opp.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <Users className="h-4 w-4 text-emerald-400" />
                  </div>
                  
                  <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">
                    <AnimatedCounter value={opp.stat} />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{opp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opp.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="flex flex-col items-center"
          >
            <p className="text-lg text-muted-foreground mb-6 text-center max-w-xl">
              Join the retailers who are turning their biggest expense into their competitive advantage.
            </p>
            <Button size="lg" className="group" asChild>
              <a href="#contact">
                Start Reducing Returns
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
