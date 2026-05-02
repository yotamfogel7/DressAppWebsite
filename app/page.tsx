import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { ProblemsSolutions } from "@/components/landing/problems-solutions"
import { DemoSection } from "@/components/landing/demo-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Features } from "@/components/landing/features"
import { Stats } from "@/components/landing/stats"
import { Pricing } from "@/components/landing/pricing"
import { Testimonials } from "@/components/landing/testimonials"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <ProblemsSolutions />
      <DemoSection />
      <HowItWorks />
      <Features />
      <Stats />
      <Testimonials />
      <Pricing />
      <CtaSection />
      <Footer />
    </main>
  )
}
