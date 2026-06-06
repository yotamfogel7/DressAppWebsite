"use client"

import {
  PayPalButtons,
  PayPalScriptProvider,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard, ChevronDown, Plus } from "lucide-react"
import {
  ON_DEMAND_BUDGET_MAX_CENTS,
  ON_DEMAND_BUDGET_MIN_CENTS,
  ON_DEMAND_TRYON_COST_USD,
  estimateOnDemandTryOnCount,
  formatUsdFromCents,
  parseBudgetUsdInput,
  validateBudgetCents,
} from "@/lib/on-demand-tryons"
import { cn } from "@/lib/utils"

type SubscriptionSummary = {
  kind: "paid" | "trial" | "none"
  planSlug: string | null
  planLabel: string
  planPrice: string
  planPriceSuffix: string | null
  renewalDate: string | null
  renewalCancelled: boolean
  canCancelRenewal: boolean
  hasPayPalSubscription: boolean
  paypalStatusUnavailable: boolean
}

type SubscriptionPayload = {
  ok?: boolean
  error?: string
  subscription?: SubscriptionSummary | null
}

type OnDemandPayload = {
  ok?: boolean
  error?: string
  walletAvailable?: boolean
  canConfigure?: boolean
  capReached?: boolean
  plan?: {
    slug: string
    label: string | null
    monthlyAllowance: number | null
  } | null
  usage?: {
    usedThisMonth: number | null
    periodFrom?: string | null
    periodTo?: string | null
    usageError: string | null
  }
  wallet?: {
    enabled: boolean
    monthlyBudgetCents: number
    balanceCents: number
    spentThisPeriodCents: number
    remainingBudgetCents: number
    remainingBalanceCents: number
    unitCostCents: number | null
  }
  estimate?: { minTryOns: number; maxTryOns: number }
}

type OnDemandTryOnsSectionProps = {
  paypalClientId: string | null
  initialSubscription?: SubscriptionSummary | null
}

function formatRenewalDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function OnDemandTryOnsSection({
  paypalClientId,
  initialSubscription = null,
}: OnDemandTryOnsSectionProps) {
  const [loading, setLoading] = useState(true)
  const [subscriptionLoading, setSubscriptionLoading] = useState(!initialSubscription)
  const [cancelBusy, setCancelBusy] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(initialSubscription)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [renewalSavedOk, setRenewalSavedOk] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [topUpBusy, setTopUpBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)
  const [data, setData] = useState<OnDemandPayload | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [savedEnabled, setSavedEnabled] = useState(false)
  const [budgetInput, setBudgetInput] = useState("")
  const [savedBudgetCents, setSavedBudgetCents] = useState(0)
  const [topUpInput, setTopUpInput] = useState("")
  const [showTopUp, setShowTopUp] = useState(false)

  const loadSubscription = useCallback(async () => {
    setSubscriptionLoading(true)
    setSubscriptionError(null)
    try {
      const res = await fetch("/api/billing/subscription", { cache: "no-store" })
      const json = (await res.json().catch(() => ({}))) as SubscriptionPayload
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? `Could not load subscription (${res.status})`)
      }
      setSubscription(json.subscription ?? null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[OnDemandTryOns] subscription load failed", e)
      setSubscriptionError(msg)
      setSubscription(null)
    } finally {
      setSubscriptionLoading(false)
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/settings/on-demand-tryons", { cache: "no-store" })
      const json = (await res.json().catch(() => ({}))) as OnDemandPayload
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? `Could not load billing (${res.status})`)
      }
      setData(json)
      const w = json.wallet
      if (w) {
        setEnabled(w.enabled)
        setSavedEnabled(w.enabled)
        setSavedBudgetCents(w.monthlyBudgetCents)
        if (w.monthlyBudgetCents > 0) {
          setBudgetInput((w.monthlyBudgetCents / 100).toFixed(2))
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[OnDemandTryOns] load failed", e)
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSubscription()
    void load()
  }, [load, loadSubscription])

  async function cancelRenewal() {
    setCancelBusy(true)
    setCancelError(null)
    try {
      const res = await fetch("/api/billing/subscription/cancel-renewal", { method: "POST" })
      const json = (await res.json().catch(() => ({}))) as SubscriptionPayload
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? `Could not turn off renewal (${res.status})`)
      }
      setSubscription(json.subscription ?? null)
      setRenewalSavedOk(true)
      setCancelDialogOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[OnDemandTryOns] cancel renewal failed", e)
      setCancelError(msg)
    } finally {
      setCancelBusy(false)
    }
  }

  const canConfigure = Boolean(data?.canConfigure ?? data?.capReached)
  const allowance = data?.plan?.monthlyAllowance ?? null
  const used = data?.usage?.usedThisMonth ?? null

  const budgetCentsDraft = useMemo(() => parseBudgetUsdInput(budgetInput), [budgetInput])
  const topUpCentsDraft = useMemo(() => parseBudgetUsdInput(topUpInput), [topUpInput])

  const topUpEstimate = useMemo(() => {
    if (topUpCentsDraft == null || topUpCentsDraft <= 0) return null
    return estimateOnDemandTryOnCount(topUpCentsDraft)
  }, [topUpCentsDraft])

  async function saveSettings() {
    if (!canConfigure) return
    setSaving(true)
    setError(null)
    setSavedOk(false)
    try {
      const body: { enabled: boolean; monthlyBudgetCents?: number } = { enabled }
      if (budgetCentsDraft != null) {
        const err = validateBudgetCents(budgetCentsDraft)
        if (err) throw new Error(err)
        body.monthlyBudgetCents = budgetCentsDraft
      } else if (enabled) {
        throw new Error("Enter a monthly on-demand budget before enabling.")
      }

      const res = await fetch("/api/settings/on-demand-tryons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = (await res.json().catch(() => ({}))) as OnDemandPayload
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? `Could not save (${res.status})`)
      }
      setSavedOk(true)
      await load()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[OnDemandTryOns] save failed", e)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const createTopUpOrder: PayPalButtonsComponentProps["createOrder"] = useCallback(async () => {
    setTopUpBusy(true)
    setError(null)
    try {
      const cents = topUpCentsDraft
      if (cents == null) throw new Error("Enter a valid top-up amount.")
      const err = validateBudgetCents(cents)
      if (err) throw new Error(err)

      const res = await fetch("/api/billing/on-demand-tryons/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: cents }),
      })
      const json = (await res.json()) as { ok?: boolean; orderId?: string; error?: string }
      if (!res.ok || !json.ok || !json.orderId) {
        throw new Error(json.error ?? `Could not start PayPal checkout (${res.status})`)
      }
      return json.orderId
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      throw e
    } finally {
      setTopUpBusy(false)
    }
  }, [topUpCentsDraft])

  const onTopUpApprove = useCallback<NonNullable<PayPalButtonsComponentProps["onApprove"]>>(
    async (approveData) => {
      const orderId =
        typeof approveData.orderID === "string" ? approveData.orderID.trim() : ""
      if (!orderId) {
        setError("PayPal did not return an order id.")
        return
      }
      setTopUpBusy(true)
      setError(null)
      try {
        const res = await fetch("/api/billing/on-demand-tryons/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        })
        const json = (await res.json()) as { ok?: boolean; error?: string }
        if (!res.ok || !json.ok) {
          throw new Error(json.error ?? `Could not complete top-up (${res.status})`)
        }
        setSavedOk(true)
        setTopUpInput("")
        setShowTopUp(false)
        await load()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error("[OnDemandTryOns] capture failed", e)
        setError(msg)
      } finally {
        setTopUpBusy(false)
      }
    },
    [load],
  )

  const settingsDirty =
    enabled !== savedEnabled ||
    (budgetCentsDraft != null && budgetCentsDraft !== savedBudgetCents)

  const renewalDateLabel = formatRenewalDate(
    subscription?.renewalDate ?? data?.usage?.periodTo ?? null,
  )

  const renewalHeading =
    subscription?.kind === "trial"
      ? "Renewal"
      : subscription?.kind === "none"
        ? "Billing"
        : subscription?.paypalStatusUnavailable
          ? "Renewal status"
          : subscription?.hasPayPalSubscription
            ? subscription.renewalCancelled
              ? "Access until"
              : "Renews on"
            : "Billing period ends"

  const renewalValue =
    subscription?.kind === "trial"
      ? "No renewal"
      : subscription?.kind === "none"
        ? "Not billing yet"
        : subscription?.paypalStatusUnavailable
          ? "Unavailable"
          : renewalDateLabel ?? "Date unavailable"

  const changePlanHref =
    subscription?.kind === "none" ? "/onboarding" : "/account/plans"
  const changePlanLabel =
    subscription?.kind === "none" ? "Choose a plan" : "Change plan"

  if (loading && subscriptionLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading billing...
      </div>
    )
  }

  const wallet = data?.wallet
  const walletUnavailable = data?.walletAvailable === false

  const budgetCents = wallet?.monthlyBudgetCents ?? 0
  const spentCents = wallet?.spentThisPeriodCents ?? 0
  const progressPct = budgetCents > 0 ? Math.min(100, (spentCents / budgetCents) * 100) : 0
  const unitCostCents = wallet?.unitCostCents ?? Math.round(ON_DEMAND_TRYON_COST_USD * 100)
  const onDemandTryOnsThisPeriod =
    spentCents > 0 && unitCostCents > 0 ? Math.floor(spentCents / unitCostCents) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          On-demand try-ons activate only after your plan&apos;s included try-ons are fully
          consumed. When your plan renews, included try-ons take priority again.
        </p>
      </div>

      {/* Current plan card */}
      {subscriptionLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading plan details...
        </div>
      ) : subscription ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Current plan
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-tight">{subscription.planLabel}</p>
                  {subscription.planPrice ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {subscription.planPrice}
                      {subscription.planPriceSuffix ? ` ${subscription.planPriceSuffix}` : ""}
                    </p>
                  ) : subscription.kind === "trial" ? (
                    <p className="mt-1 text-sm text-muted-foreground">Included try-ons, no card required</p>
                  ) : null}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {renewalHeading}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{renewalValue}</p>
                  {subscription.kind === "paid" && subscription.paypalStatusUnavailable ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      We could not verify PayPal renewal status. Try again later or contact
                      support.
                    </p>
                  ) : subscription.kind === "paid" && subscription.renewalCancelled ? (
                    <p className="mt-1 text-xs text-muted-foreground">Renewal is turned off</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant={subscription.kind === "none" ? "default" : "outline"}>
              <Link href={changePlanHref}>{changePlanLabel}</Link>
            </Button>
            {subscription.canCancelRenewal ? (
              <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={cancelBusy}>
                    Turn off renewal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Turn off renewal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your plan stays active until{" "}
                      {renewalDateLabel ?? "the end of this billing period"}. After that, monthly
                      billing stops and included try-ons will no longer renew.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={cancelBusy}>Keep renewal</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={cancelBusy}
                      onClick={(event) => {
                        event.preventDefault()
                        void cancelRenewal()
                      }}
                    >
                      {cancelBusy ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Turning off...
                        </>
                      ) : (
                        "Turn off renewal"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
          {cancelError ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {cancelError}
            </p>
          ) : null}
        </div>
      ) : subscriptionError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load plan</AlertTitle>
          <AlertDescription>{subscriptionError}</AlertDescription>
        </Alert>
      ) : null}

      {/* Plan usage alert */}
      {!canConfigure ? (
        <Alert>
          <AlertTitle>Included try-ons still available</AlertTitle>
          <AlertDescription>
            {allowance != null && used != null ? (
              <>
                You have used{" "}
                <span className="font-medium text-foreground">{used.toLocaleString()}</span> of{" "}
                <span className="font-medium text-foreground">
                  {allowance.toLocaleString()}
                </span>{" "}
                included try-ons this month. On-demand billing unlocks when you reach your plan
                cap.
              </>
            ) : data?.usage?.usageError ? (
              <>Usage could not be loaded: {data.usage.usageError}</>
            ) : (
              <>On-demand billing unlocks after you use all included try-ons for this month.</>
            )}
          </AlertDescription>
        </Alert>
      ) : null}

      {walletUnavailable ? (
        <Alert variant="destructive">
          <AlertTitle>On-demand billing unavailable</AlertTitle>
          <AlertDescription>
            {data?.error ??
              "The DressApp API wallet endpoint is not available yet. Try again later or contact support."}
          </AlertDescription>
        </Alert>
      ) : null}

      {renewalSavedOk ? (
        <Alert>
          <AlertTitle>Renewal turned off</AlertTitle>
          <AlertDescription>
            Your plan stays active until {renewalDateLabel ?? "the end of this billing period"}.
            Monthly billing will not renew after that.
          </AlertDescription>
        </Alert>
      ) : null}

      {savedOk ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>Your on-demand billing settings were updated.</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* On-Demand Usage card */}
      <div
        className={cn(
          "rounded-xl border border-border bg-card shadow-sm",
          !canConfigure && "opacity-60",
        )}
      >
        <div className="px-6 pt-5 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            On-Demand Usage
          </p>
        </div>

        {/* On-Demand spend vs budget */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">On-Demand</span>
            <span className="font-mono text-sm tabular-nums">
              {formatUsdFromCents(spentCents)} / {formatUsdFromCents(budgetCents > 0 ? budgetCents : 0)}
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {onDemandTryOnsThisPeriod > 0 ? (
            <p className="mt-2 text-sm">
              <span className="font-medium">{onDemandTryOnsThisPeriod.toLocaleString()}</span>
              <span className="text-muted-foreground"> on-demand try-ons used this period</span>
            </p>
          ) : null}

          <p className="mt-2 text-sm text-muted-foreground">
            On-demand usage is consumed after your plan&apos;s try-on limit is reached, and is
            billed in arrears.
          </p>
        </div>

        {/* Monthly Limit */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold">Monthly Limit</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Set a fixed monthly on-demand budget.
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Min {formatUsdFromCents(ON_DEMAND_BUDGET_MIN_CENTS)} &ndash; max{" "}
                {formatUsdFromCents(ON_DEMAND_BUDGET_MAX_CENTS)}. Each try-on costs $
                {ON_DEMAND_TRYON_COST_USD.toFixed(2)}.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm text-muted-foreground">
                <span>Fixed</span>
                <ChevronDown className="size-3" aria-hidden />
              </div>
              <Label htmlFor="on-demand-budget" className="sr-only">
                Monthly budget (USD)
              </Label>
              <Input
                id="on-demand-budget"
                type="text"
                inputMode="decimal"
                placeholder="20.00"
                value={budgetInput}
                onChange={(e) => {
                  setBudgetInput(e.target.value)
                  setSavedOk(false)
                }}
                disabled={!canConfigure || saving || walletUnavailable}
                className="w-24"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void saveSettings()}
                disabled={
                  !canConfigure ||
                  saving ||
                  walletUnavailable ||
                  !settingsDirty ||
                  (enabled && budgetCentsDraft == null)
                }
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Top Up */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Top up balance</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {wallet
                  ? `Wallet balance: ${formatUsdFromCents(wallet.balanceCents)}`
                  : "Add prepaid funds via PayPal"}
              </p>
            </div>
            {!showTopUp && canConfigure && !walletUnavailable ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTopUp(true)}
                className="shrink-0"
              >
                <Plus className="mr-1.5 size-3.5" aria-hidden />
                Add funds
              </Button>
            ) : null}
          </div>

          {showTopUp || (!canConfigure && !walletUnavailable) ? (
            <div className="mt-4 space-y-3">
              {!paypalClientId ? (
                <Alert>
                  <AlertTitle>PayPal not configured</AlertTitle>
                  <AlertDescription>
                    Prepaid top-ups need PayPal credentials on the server.
                  </AlertDescription>
                </Alert>
              ) : canConfigure && !walletUnavailable ? (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="top-up-amount" className="sr-only">
                      Top-up amount (USD)
                    </Label>
                    <Input
                      id="top-up-amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="50.00"
                      value={topUpInput}
                      onChange={(e) => setTopUpInput(e.target.value)}
                      disabled={topUpBusy}
                      className="w-32"
                    />
                    {topUpEstimate ? (
                      <span className="text-xs text-muted-foreground">
                        ~{topUpEstimate.toLocaleString()} try-ons
                      </span>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowTopUp(false)}
                      disabled={topUpBusy}
                      className="ml-auto text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>

                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: "USD",
                      intent: "capture",
                      components: "buttons",
                    }}
                  >
                    <div
                      className={cn(
                        "max-w-md",
                        (topUpBusy || topUpCentsDraft == null) && "pointer-events-none opacity-60",
                      )}
                    >
                      <PayPalButtons
                        style={{ layout: "vertical", shape: "rect", label: "pay", height: 44 }}
                        disabled={topUpBusy || topUpCentsDraft == null}
                        createOrder={createTopUpOrder}
                        onApprove={onTopUpApprove}
                        onError={(err) => {
                          console.error("[OnDemandTryOns] PayPal error", err)
                          setError("PayPal checkout failed. Try again.")
                          setTopUpBusy(false)
                        }}
                        onCancel={() => setTopUpBusy(false)}
                      />
                    </div>
                  </PayPalScriptProvider>
                </>
              ) : null}
            </div>
          ) : null}

          {wallet && wallet.balanceCents <= 0 && wallet.enabled ? (
            <p className="mt-3 text-xs text-destructive">
              Wallet balance is empty. Top up to keep on-demand try-ons running.
            </p>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Need usage details? See{" "}
        <Link href="/settings/usage" className="font-medium text-primary underline-offset-4 hover:underline">
          Usage
        </Link>
        .
      </p>
    </div>
  )
}
