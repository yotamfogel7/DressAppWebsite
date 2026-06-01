"use client"

import {
  PayPalButtons,
  PayPalScriptProvider,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Wallet } from "lucide-react"
import {
  ON_DEMAND_BUDGET_MAX_CENTS,
  ON_DEMAND_BUDGET_MIN_CENTS,
  ON_DEMAND_TRYON_COST_MAX_USD,
  ON_DEMAND_TRYON_COST_MIN_USD,
  formatUsdFromCents,
  parseBudgetUsdInput,
  validateBudgetCents,
} from "@/lib/on-demand-tryons"
import { cn } from "@/lib/utils"

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
}

export function OnDemandTryOnsSection({ paypalClientId }: OnDemandTryOnsSectionProps) {
  const [loading, setLoading] = useState(true)
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
    void load()
  }, [load])

  const canConfigure = Boolean(data?.canConfigure ?? data?.capReached)
  const allowance = data?.plan?.monthlyAllowance ?? null
  const used = data?.usage?.usedThisMonth ?? null

  const budgetCentsDraft = useMemo(() => parseBudgetUsdInput(budgetInput), [budgetInput])
  const topUpCentsDraft = useMemo(() => parseBudgetUsdInput(topUpInput), [topUpInput])

  const budgetEstimate = useMemo(() => {
    if (budgetCentsDraft == null || budgetCentsDraft <= 0) return null
    const budgetUsd = budgetCentsDraft / 100
    return {
      min: Math.floor(budgetUsd / ON_DEMAND_TRYON_COST_MAX_USD),
      max: Math.floor(budgetUsd / ON_DEMAND_TRYON_COST_MIN_USD),
    }
  }, [budgetCentsDraft])

  const topUpEstimate = useMemo(() => {
    if (topUpCentsDraft == null || topUpCentsDraft <= 0) return null
    const budgetUsd = topUpCentsDraft / 100
    return {
      min: Math.floor(budgetUsd / ON_DEMAND_TRYON_COST_MAX_USD),
      max: Math.floor(budgetUsd / ON_DEMAND_TRYON_COST_MIN_USD),
    }
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading billing…
      </div>
    )
  }

  const wallet = data?.wallet
  const walletUnavailable = data?.walletAvailable === false

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          On-demand try-ons stay off until you use your plan&apos;s included try-ons. Then add a
          prepaid budget and keep try-ons running until that budget is used up.
        </p>
      </div>

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

      {wallet ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" aria-hidden />
            <h2 className="text-base font-semibold">Prepaid on-demand wallet</h2>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Wallet balance</dt>
              <dd className="font-mono text-lg font-semibold tabular-nums">
                {formatUsdFromCents(wallet.balanceCents)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Spent this period (on-demand)</dt>
              <dd className="font-mono tabular-nums">
                {formatUsdFromCents(wallet.spentThisPeriodCents)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">On-demand budget cap</dt>
              <dd className="font-mono tabular-nums">
                {formatUsdFromCents(wallet.monthlyBudgetCents)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Remaining budget</dt>
              <dd className="font-mono tabular-nums">
                {formatUsdFromCents(wallet.remainingBudgetCents)}
              </dd>
            </div>
          </dl>
          {wallet.balanceCents <= 0 && wallet.enabled ? (
            <p className="mt-3 text-xs text-destructive">
              Wallet balance is empty. Try-ons stop when included usage and prepaid funds are
              exhausted.
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-xl border border-border bg-card p-6 shadow-sm",
          !canConfigure && "opacity-60",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="on-demand-enabled" className="text-base font-semibold">
              On-demand try-ons
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Disabled by default. Turn on after your plan cap is reached.
            </p>
          </div>
          <Switch
            id="on-demand-enabled"
            checked={enabled}
            onCheckedChange={(v) => {
              setEnabled(v)
              setSavedOk(false)
            }}
            disabled={!canConfigure || saving || walletUnavailable}
          />
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="on-demand-budget">Monthly on-demand budget (USD)</Label>
          <Input
            id="on-demand-budget"
            type="text"
            inputMode="decimal"
            placeholder="25.00"
            value={budgetInput}
            onChange={(e) => {
              setBudgetInput(e.target.value)
              setSavedOk(false)
            }}
            disabled={!canConfigure || saving || walletUnavailable}
          />
          <p className="text-xs text-muted-foreground">
            Between {formatUsdFromCents(ON_DEMAND_BUDGET_MIN_CENTS)} and{" "}
            {formatUsdFromCents(ON_DEMAND_BUDGET_MAX_CENTS)}. Approx.{" "}
            {ON_DEMAND_TRYON_COST_MIN_USD.toFixed(2)}-
            {ON_DEMAND_TRYON_COST_MAX_USD.toFixed(2)} per try-on.
          </p>
          {budgetEstimate ? (
            <p className="text-xs text-foreground">
              Estimated extra try-ons at this budget:{" "}
              <span className="font-medium">
                {budgetEstimate.min.toLocaleString()}–{budgetEstimate.max.toLocaleString()}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <Button
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
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save on-demand settings"
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border border-border bg-card p-6 shadow-sm",
          !canConfigure && "opacity-60",
        )}
      >
        <h2 className="text-base font-semibold">Add prepaid funds</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Top up your wallet with PayPal. Funds are used for on-demand try-ons after your plan cap.
        </p>

        <div className="mt-4 space-y-2">
          <Label htmlFor="top-up-amount">Top-up amount (USD)</Label>
          <Input
            id="top-up-amount"
            type="text"
            inputMode="decimal"
            placeholder="50.00"
            value={topUpInput}
            onChange={(e) => setTopUpInput(e.target.value)}
            disabled={!canConfigure || topUpBusy || walletUnavailable}
          />
          {topUpEstimate ? (
            <p className="text-xs text-foreground">
              Estimated try-ons from this top-up:{" "}
              <span className="font-medium">
                {topUpEstimate.min.toLocaleString()}–{topUpEstimate.max.toLocaleString()}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          {!paypalClientId ? (
            <Alert>
              <AlertTitle>PayPal not configured</AlertTitle>
              <AlertDescription>
                Prepaid top-ups need PayPal credentials on the server. Your subscription checkout
                may still work if configured separately.
              </AlertDescription>
            </Alert>
          ) : canConfigure && !walletUnavailable ? (
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
                  style={{ layout: "vertical", shape: "rect", label: "pay", height: 48 }}
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
