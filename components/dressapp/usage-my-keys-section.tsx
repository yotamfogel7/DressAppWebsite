"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import type { PlanSlug } from "@/lib/plan-slugs"

type MyKeysPayload = {
  ok?: boolean
  authenticated?: boolean
  hasKeys?: boolean
  error?: string
  message?: string
  plan?: {
    slug: PlanSlug
    label: string | null
    monthlyAllowance: number | null
  } | null
  keys?: {
    secretKey: string
    publishableKey: string
    googleApiKey: string | null
    merchantSlug: string | null
  } | null
  quota?: {
    usedThisMonth: number | null
    remaining: number | null
    periodFrom: string
    periodTo: string
    usageError: string | null
  } | null
}

type UsageMyKeysSectionProps = {
  onSecretKeyLoaded?: (secretKey: string) => void
  onKeysFetchComplete?: () => void
}

function KeyRow({
  label,
  value,
  maskedDefault = false,
}: {
  label: string
  value: string
  maskedDefault?: boolean
}) {
  const [revealed, setRevealed] = useState(!maskedDefault)
  const [copied, setCopied] = useState(false)

  const display = revealed ? value : "•".repeat(Math.min(value.length, 32))

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error("[My Keys] copy failed", e)
    }
  }, [value])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="flex gap-1">
          {maskedDefault ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? "Hide key" : "Show key"}
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => void copy()}
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="break-all rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed text-foreground">
        {display}
      </p>
      {copied ? <p className="text-xs text-muted-foreground">Copied</p> : null}
    </div>
  )
}

export function UsageMyKeysSection({
  onSecretKeyLoaded,
  onKeysFetchComplete,
}: UsageMyKeysSectionProps) {
  const { status } = useSession()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MyKeysPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (status !== "authenticated") return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dressapp/usage/my-keys", { credentials: "same-origin" })
      const json = (await res.json()) as MyKeysPayload
      if (!res.ok) {
        const msg = typeof json.error === "string" ? json.error : `HTTP ${res.status}`
        console.error("[My Keys] load failed", res.status, json)
        setError(msg)
        setData(null)
        return
      }
      setData(json)
      if (json.keys?.secretKey) {
        onSecretKeyLoaded?.(json.keys.secretKey)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[My Keys] fetch error", e)
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
      onKeysFetchComplete?.()
    }
  }, [status, onSecretKeyLoaded, onKeysFetchComplete])

  useEffect(() => {
    if (status === "authenticated") {
      void load()
    }
  }, [status, load])

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Checking session…
      </div>
    )
  }

  if (status !== "authenticated") {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium">My Keys</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Sign in to see your merchant keys and plan allowance.
            </p>
            <Button asChild variant="link" className="mt-2 h-auto p-0 text-xs">
              <Link href="/login?callbackUrl=/usage">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const plan = data?.plan
  const quota = data?.quota
  const allowance = plan?.monthlyAllowance ?? null
  const used = quota?.usedThisMonth ?? null
  const remaining = quota?.remaining ?? null
  const usagePct =
    allowance != null && allowance > 0 && used != null
      ? Math.min(100, Math.round((used / allowance) * 100))
      : null

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card/40 p-4" aria-labelledby="my-keys-heading">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 id="my-keys-heading" className="text-sm font-semibold">
              My Keys
            </h2>
            <p className="text-xs text-muted-foreground">Your merchant credentials and plan quota</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 text-xs"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load keys</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      ) : null}

      {plan ? (
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active plan</p>
          <p className="mt-1 text-base font-semibold">{plan.label ?? plan.slug}</p>
          {allowance != null ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Try-ons this month</span>
                <span className="font-mono tabular-nums text-foreground">
                  {used != null ? used.toLocaleString() : "—"} / {allowance.toLocaleString()}
                </span>
              </div>
              {usagePct != null ? <Progress value={usagePct} className="h-2" /> : null}
              {remaining != null && remaining === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Plan cap reached.{" "}
                  <Link
                    href="/settings/billing"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Set up on-demand billing
                  </Link>
                </p>
              ) : remaining != null ? (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{remaining.toLocaleString()}</span> try-ons
                  remaining this month
                </p>
              ) : quota?.usageError ? (
                <p className="text-xs text-destructive">Usage unavailable: {quota.usageError}</p>
              ) : loading ? (
                <p className="text-xs text-muted-foreground">Loading usage…</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Custom allowance — contact sales for your monthly limit.
            </p>
          )}
        </div>
      ) : !loading ? (
        <p className="text-xs text-muted-foreground">
          No plan selected yet.{" "}
          <Link href="/plans" className="font-medium text-primary underline-offset-4 hover:underline">
            Choose a plan
          </Link>
        </p>
      ) : null}

      {loading && !data ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Loading your keys…
        </div>
      ) : null}

      {data?.hasKeys && data.keys ? (
        <div className="space-y-4">
          <KeyRow label="Secret key (SK)" value={data.keys.secretKey} maskedDefault />
          <KeyRow label="Publishable key (PK)" value={data.keys.publishableKey} />
          {data.keys.googleApiKey ? (
            <KeyRow label="Google API key" value={data.keys.googleApiKey} maskedDefault />
          ) : null}
        </div>
      ) : !loading && data && !data.hasKeys ? (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {data.message ??
            "Merchant keys are not linked to your account yet. Create a merchant from Integrations or contact support."}
        </p>
      ) : null}
    </section>
  )
}
