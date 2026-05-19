import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content"

export const metadata: Metadata = {
  title: "Privacy Policy | DressApp",
  description:
    "How DressApp collects, uses, and protects information for Shopify merchants and storefront shoppers using virtual try-on.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8 lg:pt-32">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
        <header className="mt-8 border-b border-border pb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">DressApp</span>
            {" · "}
            Last updated May 19, 2026
          </p>
        </header>
        <div className="mt-10">
          <PrivacyPolicyContent />
        </div>
      </div>
      <Footer />
    </main>
  )
}
