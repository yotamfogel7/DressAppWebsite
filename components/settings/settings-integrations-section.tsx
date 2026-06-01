"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { IntegrationsHub } from "@/components/integrations/integrations-hub"
import { planApiAccessAllowed } from "@/lib/plan-api-access"
import { normalizePlanSlug } from "@/lib/plan-slugs"

type MyKeysPayload = {
  ok?: boolean
  error?: string
  plan?: { slug: string } | null
}

export function SettingsIntegrationsSection() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiAccessAllowed, setApiAccessAllowed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dressapp/usage/my-keys", { cache: "no-store" })
      const payload = (await res.json().catch(() => ({}))) as MyKeysPayload
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? `Could not load plan access (${res.status})`)
      }
      const slug = payload.plan?.slug ? normalizePlanSlug(payload.plan.slug) : null
      setApiAccessAllowed(planApiAccessAllowed(slug))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[SettingsIntegrations] load failed", e)
      setError(msg)
      setApiAccessAllowed(false)
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
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading integrations…
      </div>
    )
  }

  return (
    <>
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not verify plan access</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <IntegrationsHub embedded apiAccessAllowed={apiAccessAllowed} />
    </>
  )
}
