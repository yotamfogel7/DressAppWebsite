"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { formatPartnerApiErrorPayload } from "@/lib/dressapp-partner-api-errors"

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  if (!text.trim()) {
    throw new Error(`Empty response (HTTP ${res.status}). Check the server logs.`)
  }
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.slice(0, 400)}`)
  }
}

export function DressAppIntegrationMerchantKeyButton() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    publishableKey: string
    secretKey?: string
    saved: boolean
  } | null>(null)

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error("[integration merchant key] clipboard", e)
    }
  }, [])

  const handleClick = useCallback(async () => {
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/dressapp/integration/merchant-publishable-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      })
      const data = await parseJsonResponse(res)
      if (!res.ok) {
        const friendly = formatPartnerApiErrorPayload(data as Record<string, unknown>, res.status)
        const hint = typeof data.hint === "string" ? `\n\n${data.hint}` : ""
        setError(friendly + hint)
        console.error("[integration merchant key]", data)
        return
      }
      const pk =
        (typeof data.publishable_key === "string" && data.publishable_key) ||
        (typeof data.publishableKey === "string" && data.publishableKey) ||
        ""
      if (!pk) {
        setError("Response did not include a publishable key.")
        console.error("[integration merchant key] missing pk", data)
        return
      }
      const sk =
        (typeof data.secret_key === "string" && data.secret_key) ||
        (typeof data.secretKey === "string" && data.secretKey) ||
        ""
      setSuccess({
        publishableKey: pk,
        secretKey: sk || undefined,
        saved: data.saved_to_database === true,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      console.error("[integration merchant key]", e)
    } finally {
      setBusy(false)
    }
  }, [name, email])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Calls partner admin to create a merchant (a unique <strong>slug</strong> is assigned
        automatically), then writes the{" "}
        <code className="rounded bg-muted px-1 text-xs">publishable_key</code> to Postgres.
        Requires <code className="rounded bg-muted px-1 text-xs">DRESSAPP_MERCHANT_KEYS_DATABASE_URL</code>{" "}
        plus the same DressApp env vars as merchant registration.
      </p>
      <div className="grid gap-3 sm:max-w-md">
        <div className="space-y-2">
          <Label htmlFor="int-merchant-name">Merchant name</Label>
          <Input
            id="int-merchant-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            autoComplete="organization"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="int-merchant-email">Merchant email</Label>
          <Input
            id="int-merchant-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            required
          />
        </div>
      </div>
      <Button
        type="button"
        disabled={busy || !name.trim() || !email.trim()}
        onClick={() => void handleClick()}
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating…
          </>
        ) : (
          "Create merchant & save publishable key"
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn’t create merchant</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap text-sm">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 shadow-md dark:bg-primary/10">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Save these credentials
          </p>
          {success.saved ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Row upserted in{" "}
              <code className="rounded bg-muted px-1 text-xs">dressapp_integration_merchant_keys</code>.
            </p>
          ) : null}
          <p className="mt-1 text-sm text-muted-foreground">
            Merchant secret key for server-side calls; publishable key for browser / SDK. Store the
            secret server-side only.
          </p>
          <div className="mt-5 space-y-5">
            {success.secretKey ? (
              <div className="space-y-2">
                <Label className="text-base font-semibold text-foreground">
                  Merchant secret key
                </Label>
                <p className="font-mono text-sm sm:text-base leading-relaxed break-all rounded-lg border bg-background px-4 py-3 text-foreground">
                  {success.secretKey}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void copyText(success.secretKey!)}
                >
                  Copy secret key
                </Button>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">Publishable key</Label>
              <p className="text-xs text-muted-foreground">
                <code className="rounded bg-muted px-1">dress_pk_…</code> - for{" "}
                <code className="rounded bg-muted px-1">DRESSAPP_PUBLISHABLE_KEY</code> and embeds.
              </p>
              <p className="font-mono text-sm sm:text-base leading-relaxed break-all rounded-lg border bg-background px-4 py-3 text-foreground">
                {success.publishableKey}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void copyText(success.publishableKey)}
              >
                Copy publishable key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Usage page:{" "}
              <Link href="/usage" className="underline underline-offset-2">
                Bearer secret key
              </Link>{" "}
              only. Keys may not be shown again.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
