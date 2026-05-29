import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Header } from "@/components/landing/header"
import { PaymentSuccessCelebration } from "@/components/payment/payment-success-celebration"
import { getUserSelectedPlan } from "@/lib/auth-db"
import { normalizePlanSlug, PLAN_LABELS, type PlanSlug } from "@/lib/plan-slugs"

export const metadata: Metadata = {
  title: "Subscription confirmed | DressApp",
  description: "Your DressApp subscription is active.",
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string
    subscription_id?: string
    token?: string
    ba_token?: string
  }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/payment/success")
  }

  const params = await searchParams
  const subscriptionId =
    typeof params.subscription_id === "string" ? params.subscription_id.trim() : ""
  const token = typeof params.token === "string" ? params.token.trim() : ""
  const baToken = typeof params.ba_token === "string" ? params.ba_token.trim() : ""

  const fromQuery = normalizePlanSlug(params.plan)
  const fromDbRaw = await getUserSelectedPlan(session.user.id)
  const fromDb = fromDbRaw ? normalizePlanSlug(fromDbRaw) : null
  const plan: PlanSlug | null = fromQuery ?? fromDb
  const planLabel = plan ? PLAN_LABELS[plan] : null

  return (
    <>
      <Header sticky />
      <PaymentSuccessCelebration
        plan={plan}
        planLabel={planLabel}
        subscriptionId={subscriptionId}
        token={token}
        baToken={baToken}
      />
    </>
  )
}
