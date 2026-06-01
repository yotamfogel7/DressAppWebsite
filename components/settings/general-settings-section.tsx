"use client"

import { useCallback, useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import {
  SCHEME_PREVIEW,
  STOREFRONT_DOCK_SCHEMES,
  type WidgetScheme,
} from "@/lib/widget-schemes"
import { cn } from "@/lib/utils"
import { WidgetColorPreview } from "@/components/settings/widget-color-preview"

type WidgetAppearancePayload = {
  ok?: boolean
  scheme?: string
  customizationAllowed?: boolean
  error?: string
}

function SchemeSwatch({ schemeId }: { schemeId: WidgetScheme }) {
  const c = SCHEME_PREVIEW[schemeId]
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-11 shrink-0 overflow-hidden rounded-md border border-border"
    >
      <span className="min-w-0 flex-1" style={{ background: c.panel }} />
      <span className="min-w-0 flex-[0.55]" style={{ background: c.chrome }} />
      <span className="min-w-0 flex-[0.35]" style={{ background: c.accent }} />
    </span>
  )
}

export function GeneralSettingsSection() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scheme, setScheme] = useState<WidgetScheme>("default_dark")
  const [savedScheme, setSavedScheme] = useState<WidgetScheme>("default_dark")
  const [customizationAllowed, setCustomizationAllowed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/settings/widget-appearance", { cache: "no-store" })
      const data = (await res.json().catch(() => ({}))) as WidgetAppearancePayload
      if (!res.ok) {
        throw new Error(data.error ?? `Could not load settings (${res.status})`)
      }
      const next = (data.scheme ?? "default_dark") as WidgetScheme
      setScheme(next)
      setSavedScheme(next)
      setCustomizationAllowed(Boolean(data.customizationAllowed))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[GeneralSettings] load failed", e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onSave() {
    setSaving(true)
    setError(null)
    setSavedOk(false)
    try {
      const res = await fetch("/api/settings/widget-appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheme }),
      })
      const data = (await res.json().catch(() => ({}))) as WidgetAppearancePayload
      if (!res.ok) {
        throw new Error(data.error ?? `Could not save (${res.status})`)
      }
      const next = (data.scheme ?? scheme) as WidgetScheme
      setScheme(next)
      setSavedScheme(next)
      setSavedOk(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[GeneralSettings] save failed", e)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading settings…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Customize how the try-on dock looks on your storefront. Changes apply on the next page
          load.
        </p>
      </div>

      {!customizationAllowed ? (
        <Alert>
          <AlertTitle>Included on Growth and higher</AlertTitle>
          <AlertDescription>
            Upgrade to Growth or above to unlock color presets. Starter keeps the default DressApp
            look.
          </AlertDescription>
        </Alert>
      ) : null}

      {savedOk ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>
            Shoppers will see the new dock colors on their next page load.
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <Label className="text-base font-semibold">Storefront widget colors</Label>
        <p className="mt-1 text-sm text-muted-foreground">Dock color scheme</p>

        <WidgetColorPreview scheme={scheme} className="mt-5" />

        <RadioGroup
          value={scheme}
          onValueChange={(value) => {
            setScheme(value as WidgetScheme)
            setSavedOk(false)
          }}
          disabled={!customizationAllowed || saving}
          className="mt-4 space-y-3"
        >
          {STOREFRONT_DOCK_SCHEMES.map((opt) => (
            <label
              key={opt.id}
              htmlFor={`scheme-${opt.id}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                scheme === opt.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-muted/30",
                (!customizationAllowed || saving) && "cursor-not-allowed opacity-60",
              )}
            >
              <RadioGroupItem value={opt.id} id={`scheme-${opt.id}`} className="mt-1" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <SchemeSwatch schemeId={opt.id} />
                  <span className="font-medium">{opt.title}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{opt.subtitle}</p>
              </div>
            </label>
          ))}
        </RadioGroup>

        <div className="mt-6">
          <Button
            onClick={() => void onSave()}
            disabled={!customizationAllowed || saving || scheme === savedScheme}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save widget colors"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
