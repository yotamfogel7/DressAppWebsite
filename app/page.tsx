import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { DemoSection } from "@/components/landing/demo-section"
import { SolutionSection } from "@/components/landing/solution-section"
import { ShowcaseSection } from "@/components/landing/showcase-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Features } from "@/components/landing/features"
import { Stats } from "@/components/landing/stats"
import { Pricing } from "@/components/landing/pricing"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <DemoSection />
      <SolutionSection />
      <ShowcaseSection />
      <HowItWorks />
      <Features />
      <Stats />
      <Pricing />
      <CtaSection />
      <Footer />
    </main>
  )
}
