"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

function generateSlug(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `integration-${crypto.randomUUID().slice(0, 8)}`
  }
  return `integration-${Date.now().toString(36)}`
}

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
  const [name, setName] = useState("DressApp integration merchant")
  const [slug, setSlug] = useState(() => generateSlug())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    publishableKey: string
    saved: boolean
  } | null>(null)

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
          slug: slug.trim() || generateSlug(),
        }),
      })
      const data = await parseJsonResponse(res)
      if (!res.ok) {
        const err =
          typeof data.error === "string"
            ? data.error
            : `Request failed (${res.status})`
        const hint = typeof data.hint === "string" ? `\n\n${data.hint}` : ""
        setError(err + hint)
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
      setSuccess({
        publishableKey: pk,
        saved: data.saved_to_database === true,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      console.error("[integration merchant key]", e)
    } finally {
      setBusy(false)
    }
  }, [name, slug])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Calls partner admin to create a merchant, then writes the{" "}
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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="int-merchant-slug">Slug (unique)</Label>
          <div className="flex gap-2">
            <Input
              id="int-merchant-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={busy}
            />
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setSlug(generateSlug())}
            >
              New slug
            </Button>
          </div>
        </div>
      </div>
      <Button
        type="button"
        disabled={busy || !name.trim()}
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
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap text-sm">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>Publishable key saved</AlertTitle>
          <AlertDescription className="space-y-2 text-sm">
            {success.saved ? (
              <p>
                Row upserted in <code className="rounded bg-muted px-1 text-xs">dressapp_integration_merchant_keys</code>.
              </p>
            ) : null}
            <p className="font-mono text-xs break-all">{success.publishableKey}</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
