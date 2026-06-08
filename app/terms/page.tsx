import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { TermsAndConditionsContent } from "@/components/legal/terms-and-conditions-content"

export const metadata: Metadata = {
  title: "Terms & Conditions | DressApp",
  description:
    "Terms governing use of DressApp virtual try-on for Shopify merchants, SDK/API partners, and storefront shoppers.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-32">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
        <header className="mt-8 border-b border-border pb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms & Conditions</h1>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">DressApp</span>
            {" · "}
            Last updated <time dateTime="2026-06-08">June 8, 2026</time>
          </p>
        </header>
        <div className="mt-10">
          <TermsAndConditionsContent />
        </div>
      </div>
      <Footer />
    </main>
  )
}
