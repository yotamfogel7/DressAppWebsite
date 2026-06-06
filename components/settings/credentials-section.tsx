"use client"

import { useCallback, useEffect, useState } from "react"
import { Copy, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type CredentialsPayload = {
  ok?: boolean
  hasKeys?: boolean
  error?: string
  message?: string
  provisioningFailed?: boolean
  keys?: {
    publishableKey: string
    secretKey: string
  } | null
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
      console.error("[Credentials] copy failed", e)
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

export function CredentialsSection() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CredentialsPayload | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/settings/credentials", { cache: "no-store" })
      const payload = (await res.json().catch(() => ({}))) as CredentialsPayload
      if (!res.ok) {
        throw new Error(payload.error ?? `Could not load credentials (${res.status})`)
      }
      setData(payload)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[Credentials] load failed", e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading credentials…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your DressApp merchant keys for SDK and API integrations.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" aria-hidden />
          <h2 className="text-base font-semibold">Merchant keys</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Created automatically when your account was set up. Keep the secret key server-side only.
        </p>

        {!data?.hasKeys || !data.keys ? (
          <Alert className="mt-4" variant={data?.provisioningFailed ? "destructive" : "default"}>
            <AlertTitle>
              {data?.provisioningFailed ? "Could not create keys" : "Keys not ready yet"}
            </AlertTitle>
            <AlertDescription className="space-y-3">
              <p>
                {data?.message ??
                  "Your merchant keys are still being generated. Refresh in a moment, or contact support if this persists."}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="mt-4 space-y-4">
            <KeyRow label="Publishable key (pk)" value={data.keys.publishableKey} />
            <KeyRow label="Secret key (sk)" value={data.keys.secretKey} maskedDefault />
          </div>
        )}
      </div>
    </div>
  )
}
