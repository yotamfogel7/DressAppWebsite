import Link from "next/link"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PLAN_LABELS, type PlanSlug } from "@/lib/plan-slugs"

type AccountBillingSectionProps = {
  planSlug: PlanSlug | null
  hasActivePlan: boolean
}

export function AccountBillingSection({ planSlug, hasActivePlan }: AccountBillingSectionProps) {
  const planLabel = planSlug ? PLAN_LABELS[planSlug] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Subscriptions are billed monthly through PayPal. Pay with card, Apple Pay, or PayPal at
          checkout.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            {hasActivePlan && planLabel ? (
              <>
                <p className="font-medium">{planLabel} · billed monthly via PayPal</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Manage on-demand try-on top-ups, wallet balance, and monthly limits from billing
                  settings once your subscription is active.
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Billing starts when you choose a plan. Enterprise+ and custom terms are handled
                through sales.
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {hasActivePlan ? (
            <Button asChild variant="outline">
              <Link href="/settings/billing">Open billing settings</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/onboarding">Select a plan to start billing</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
