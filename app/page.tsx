import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { SolutionSection } from "@/components/landing/solution-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Features } from "@/components/landing/features"
import { Pricing } from "@/components/landing/pricing"
import { ContactSection } from "@/components/landing/contact-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <SolutionSection />
      <HowItWorks />
      <Features />
      <Pricing />
      <ContactSection />
      <Footer />
    </main>
  )
}
