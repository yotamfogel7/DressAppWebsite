"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { PlanSlug } from "@/lib/plan-slugs"

type MyKeysPayload = {
  ok?: boolean
  error?: string
  plan?: {
    slug: PlanSlug
    label: string | null
    monthlyAllowance: number | null
  } | null
  signupTrial?: {
    allowance: number
    used: number | null
    remaining: number | null
    usageError?: string | null
  } | null
  quota?: {
    usedThisMonth: number | null
    remaining: number | null
    periodFrom: string
    periodTo: string
    usageError: string | null
  } | null
}

function formatRenewalWindow(periodFrom: string, periodTo: string): string | null {
  const from = new Date(periodFrom)
  const to = new Date(periodTo)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null
  const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })
  return `${fmt.format(from)} – ${fmt.format(to)}`
}

export function AccountPlanUsageSummary() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<MyKeysPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dressapp/usage/my-keys", { credentials: "same-origin" })
      const json = (await res.json()) as MyKeysPayload
      if (!res.ok) {
        const msg = typeof json.error === "string" ? json.error : `HTTP ${res.status}`
        console.error("[AccountPlanUsageSummary] load failed", res.status, json)
        setError(msg)
        setData(null)
        return
      }
      setData(json)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[AccountPlanUsageSummary] fetch error", e)
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !data) {
    return (
      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading try-on usage…
      </div>
    )
  }

  if (error) {
    return (
      <p className="mt-5 text-sm text-destructive">
        Could not load try-on usage: {error}
      </p>
    )
  }

  const plan = data?.plan
  const signupTrial = data?.signupTrial
  const quota = data?.quota
  const allowance = plan?.monthlyAllowance ?? signupTrial?.allowance ?? null
  const used = quota?.usedThisMonth ?? signupTrial?.used ?? null
  const remaining = quota?.remaining ?? signupTrial?.remaining ?? null
  const usageError = quota?.usageError ?? signupTrial?.usageError ?? null
  const renewalWindow =
    quota?.periodFrom && quota?.periodTo
      ? formatRenewalWindow(quota.periodFrom, quota.periodTo)
      : null

  if (!plan && !signupTrial) return null

  const usagePct =
    allowance != null && allowance > 0 && used != null
      ? Math.min(100, Math.round((used / allowance) * 100))
      : null

  const periodLabel = signupTrial
    ? "All-time try-ons"
    : renewalWindow
      ? `Try-ons until renewal (${renewalWindow})`
      : "Try-ons this billing period"

  return (
    <div className="mt-5 space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Try-on usage
        </p>
        {allowance != null ? (
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-background/80 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Included in plan</p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                  {allowance.toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background/80 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Used</p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                  {used != null ? used.toLocaleString() : "-"}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background/80 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                  {remaining != null ? remaining.toLocaleString() : "-"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{periodLabel}</span>
                <span className="font-mono tabular-nums text-foreground">
                  {used != null ? used.toLocaleString() : "-"} / {allowance.toLocaleString()}
                </span>
              </div>
              {usagePct != null ? <Progress value={usagePct} className="h-2" /> : null}
            </div>

            {usageError ? (
              <p className="text-xs text-destructive">Usage unavailable: {usageError}</p>
            ) : remaining === 0 ? (
              <p className="text-xs text-muted-foreground">
                {signupTrial
                  ? "Trial used up. Upgrade to a paid plan to keep try-ons running."
                  : "Plan cap reached for this billing period."}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Custom allowance - contact sales for your monthly limit.
          </p>
        )}
      </div>

      <Button asChild variant="outline" size="sm">
        <Link href="/settings/usage">Open usage dashboard</Link>
      </Button>
    </div>
  )
}
