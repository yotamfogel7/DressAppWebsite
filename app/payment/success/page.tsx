import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, CircleCheck, LayoutDashboard, UserRound } from "lucide-react"
import { auth } from "@/auth"
import { Header } from "@/components/landing/header"
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
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto flex max-w-md flex-col items-center px-6 pb-20 pt-28 text-center md:pt-32">
        <div
          className="flex size-16 items-center justify-center rounded-full bg-[oklch(0.94_0.04_145)] text-[oklch(0.52_0.14_145)] dark:bg-[oklch(0.28_0.05_145)] dark:text-[oklch(0.78_0.12_145)]"
          aria-hidden
        >
          <CircleCheck className="size-9 stroke-[1.75]" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">
          You&apos;re all set
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
          {planLabel ? (
            <>
              Your <span className="font-medium text-foreground">{planLabel}</span> plan is
              active. Billing runs through PayPal.
            </>
          ) : (
            <>Your subscription is active. Billing runs through PayPal.</>
          )}
        </p>

        {!planLabel ? (
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            We couldn&apos;t match a plan from the link or your account. Check account settings if
            something looks off.
          </p>
        ) : null}

        {!subscriptionId ? (
          <p
            className="mt-6 max-w-sm rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
            role="alert"
          >
            No subscription id came back in the URL. If you already approved payment in PayPal,
            check your PayPal receipts or contact us with the purchase time.
          </p>
        ) : null}

        <div className="mt-10 w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Next steps
          </p>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href="/account"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 shadow-sm transition-colors hover:border-primary/20 hover:bg-secondary/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <UserRound className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Go to account</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    Manage your profile and plan details.
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </li>
            <li>
              <Link
                href="/usage"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 shadow-sm transition-colors hover:border-primary/20 hover:bg-secondary/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <LayoutDashboard className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Open usage dashboard</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    Track try-ons and monthly limits.
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </li>
          </ul>
        </div>

        {subscriptionId ? (
          <p className="mt-10 w-full text-left text-xs text-muted-foreground">
            <span className="font-medium uppercase tracking-wide">PayPal subscription id</span>
            <span className="mt-1 block break-all font-mono text-[0.8125rem] text-foreground/80">
              {subscriptionId}
            </span>
          </p>
        ) : null}

        {(token || baToken) && (
          <details className="mt-6 w-full text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium">Debug tokens</summary>
            <dl className="mt-2 space-y-1 font-mono">
              {token ? (
                <>
                  <dt className="text-muted-foreground">token</dt>
                  <dd className="break-all">{token}</dd>
                </>
              ) : null}
              {baToken ? (
                <>
                  <dt className="text-muted-foreground">ba_token</dt>
                  <dd className="break-all">{baToken}</dd>
                </>
              ) : null}
            </dl>
          </details>
        )}
      </div>
    </div>
  )
}
