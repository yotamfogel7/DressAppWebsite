import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { normalizePlanSlug, PLAN_LABELS } from "@/lib/plan-slugs"

export const metadata: Metadata = {
  title: "Checkout canceled | DressApp",
  description: "You canceled PayPal checkout.",
}

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/payment/cancel")
  }

  const params = await searchParams
  const plan = normalizePlanSlug(params.plan)
  const label = plan ? PLAN_LABELS[plan] : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto max-w-lg px-6 pb-16 pt-28 md:pt-32">
        <h1 className="text-2xl font-bold tracking-tight">Checkout canceled</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You left checkout before finishing. No charge was completed.
          {label ? ` You had selected ${label}.` : null}
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/plans">Choose a plan again</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account">Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
