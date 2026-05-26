import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { normalizePlanSlug, PLAN_LABELS, type PlanSlug } from "@/lib/plan-slugs"

export const metadata: Metadata = {
  title: "Account | DressApp",
  description: "Your DressApp account and selected plan.",
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account")
  }

  const params = await searchParams
  const fromQuery = normalizePlanSlug(params.plan)
  const fromDbRaw = await getUserSelectedPlan(session.user.id)
  const fromDb = fromDbRaw ? normalizePlanSlug(fromDbRaw) : null
  const plan: PlanSlug | null = fromQuery ?? fromDb

  const planLabel = plan ? PLAN_LABELS[plan] : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto max-w-lg px-6 pb-16 pt-28 md:pt-32">
        <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {session.user.email ?? session.user.name ?? "your account"}
          </span>
          .
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Plan selection
          </h2>
          {planLabel ? (
            <p className="mt-2 text-lg font-semibold text-foreground">{planLabel}</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              You have not locked in a plan yet. Choose one from your plans page
              to continue.
            </p>
          )}
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Billing runs monthly through PayPal. Choose or change your tier on the
            plans page and pay with card, Apple Pay, or PayPal at checkout. For
            Enterprise+ or custom terms, use contact us.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/plans">View plans</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/#contact-us">Contact us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
