"use client"

import { useCallback, useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Loader2, Globe, ShoppingBag, MousePointerClick } from "lucide-react"
import {
  SCHEME_PREVIEW,
  STOREFRONT_DOCK_SCHEMES,
  WIDGET_DOCK_PREVIEW,
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

type StorefrontSettingsPayload = {
  ok?: boolean
  widget_language?: string
  allow_out_of_stock_tryon?: boolean
  pdp_tryon_button_enabled?: boolean
  error?: string
}

type WidgetLanguage = "en" | "he"

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

const STOREFRONT_ACTIVE_FILL = "#1e2340"

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  hint,
  wideControl = false,
  divider = true,
}: {
  icon: React.ElementType
  label: string
  description: string
  children: React.ReactNode
  hint?: React.ReactNode
  wideControl?: boolean
  divider?: boolean
}) {
  return (
    <div
      className={cn(
        "col-span-4 grid grid-cols-subgrid items-center gap-x-3 py-[14px]",
        divider && "border-t [border-top-width:0.5px] border-border",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </span>
      <div className="min-w-0 pr-2">
        <p className="text-sm font-medium leading-[1.4]">{label}</p>
        <p className="text-xs leading-[1.4] text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center",
          wideControl ? "col-span-2" : "justify-center",
        )}
      >
        {wideControl ? (
          <div className="ml-[21px] -translate-x-1/2 shrink-0">{children}</div>
        ) : (
          children
        )}
      </div>
      {!wideControl ? (
        <div className="flex shrink-0 items-center">{hint ?? null}</div>
      ) : null}
    </div>
  )
}

function SettingHintFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-md border border-border bg-muted/25 p-1.5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

function OosSizeHint() {
  const sizes = ["S", "M", "L", "XL"] as const
  const [selected, setSelected] = useState<"S" | "M" | "L">("M")

  return (
    <SettingHintFrame>
      <div className="flex gap-1" role="group" aria-label="Size preview">
        {sizes.map((size) => {
          const disabled = size === "XL"
          if (disabled) {
            return (
              <span
                key={size}
                aria-disabled="true"
                className="flex size-6 cursor-not-allowed items-center justify-center rounded border border-border/50 bg-muted/60 text-[9px] font-semibold leading-none text-muted-foreground/45 line-through decoration-muted-foreground/45"
              >
                {size}
              </span>
            )
          }

          const isSelected = selected === size
          return (
            <button
              key={size}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(size)}
              className={cn(
                "flex size-6 cursor-pointer items-center justify-center rounded border text-[9px] font-semibold leading-none transition-colors hover:border-foreground/30 hover:bg-muted/50",
                isSelected
                  ? "border-foreground/40 bg-muted text-foreground"
                  : "border-border bg-background text-foreground",
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </SettingHintFrame>
  )
}

function TryItOnButtonHint() {
  const btn = WIDGET_DOCK_PREVIEW.default_dark.btnPrimary
  return (
    <SettingHintFrame className="bg-white">
      <button
        type="button"
        className="w-[76px] cursor-pointer rounded-full px-2 py-1 text-[8px] font-semibold leading-tight transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
        style={{
          background: btn.background,
          border: btn.border,
          color: btn.color,
          boxShadow: btn.boxShadow,
        }}
      >
        Try it on
      </button>
    </SettingHintFrame>
  )
}

function StorefrontToggle({
  checked,
  onCheckedChange,
  disabled,
  id,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
}) {
  return (
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="h-6 w-[42px] data-[state=checked]:bg-[#1e2340] data-[state=unchecked]:bg-input [&_[data-slot=switch-thumb]]:size-5 [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-[calc(100%-2px)]"
    />
  )
}

export function GeneralSettingsSection() {
  // Widget colors
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scheme, setScheme] = useState<WidgetScheme>("default_dark")
  const [savedScheme, setSavedScheme] = useState<WidgetScheme>("default_dark")
  const [customizationAllowed, setCustomizationAllowed] = useState(false)
  const [colorError, setColorError] = useState<string | null>(null)
  const [colorSavedOk, setColorSavedOk] = useState(false)

  // Storefront settings
  const [sfLoading, setSfLoading] = useState(true)
  const [sfSaving, setSfSaving] = useState(false)
  const [language, setLanguage] = useState<WidgetLanguage>("en")
  const [savedLanguage, setSavedLanguage] = useState<WidgetLanguage>("en")
  const [allowOos, setAllowOos] = useState(false)
  const [savedAllowOos, setSavedAllowOos] = useState(false)
  const [pdpButton, setPdpButton] = useState(true)
  const [savedPdpButton, setSavedPdpButton] = useState(true)
  const [sfError, setSfError] = useState<string | null>(null)
  const [sfSavedOk, setSfSavedOk] = useState(false)

  const sfDirty =
    language !== savedLanguage || allowOos !== savedAllowOos || pdpButton !== savedPdpButton

  const loadColors = useCallback(async () => {
    setLoading(true)
    setColorError(null)
    try {
      const res = await fetch("/api/settings/widget-appearance", { cache: "no-store" })
      const data = (await res.json().catch(() => ({}))) as WidgetAppearancePayload
      if (!res.ok) throw new Error(data.error ?? `Could not load settings (${res.status})`)
      const next = (data.scheme ?? "default_dark") as WidgetScheme
      setScheme(next)
      setSavedScheme(next)
      setCustomizationAllowed(Boolean(data.customizationAllowed))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[GeneralSettings] load colors failed", e)
      setColorError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStorefrontSettings = useCallback(async () => {
    setSfLoading(true)
    setSfError(null)
    try {
      const res = await fetch("/api/settings/storefront-settings", { cache: "no-store" })
      const data = (await res.json().catch(() => ({}))) as StorefrontSettingsPayload
      if (!res.ok) throw new Error(data.error ?? `Could not load settings (${res.status})`)
      const lang = (data.widget_language ?? "en") as WidgetLanguage
      setLanguage(lang)
      setSavedLanguage(lang)
      setAllowOos(Boolean(data.allow_out_of_stock_tryon))
      setSavedAllowOos(Boolean(data.allow_out_of_stock_tryon))
      setPdpButton(data.pdp_tryon_button_enabled !== false)
      setSavedPdpButton(data.pdp_tryon_button_enabled !== false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[GeneralSettings] load storefront settings failed", e)
      setSfError(msg)
    } finally {
      setSfLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadColors()
    void loadStorefrontSettings()
  }, [loadColors, loadStorefrontSettings])

  async function onSaveColors() {
    setSaving(true)
    setColorError(null)
    setColorSavedOk(false)
    try {
      const res = await fetch("/api/settings/widget-appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheme }),
      })
      const data = (await res.json().catch(() => ({}))) as WidgetAppearancePayload
      if (!res.ok) throw new Error(data.error ?? `Could not save (${res.status})`)
      const next = (data.scheme ?? scheme) as WidgetScheme
      setScheme(next)
      setSavedScheme(next)
      setColorSavedOk(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[GeneralSettings] save colors failed", e)
      setColorError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function onSaveStorefrontSettings() {
    setSfSaving(true)
    setSfError(null)
    setSfSavedOk(false)
    try {
      const res = await fetch("/api/settings/storefront-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          widget_language: language,
          allow_out_of_stock_tryon: allowOos,
          pdp_tryon_button_enabled: pdpButton,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as StorefrontSettingsPayload
      if (!res.ok) throw new Error(data.error ?? `Could not save (${res.status})`)
      const lang = (data.widget_language ?? language) as WidgetLanguage
      setLanguage(lang)
      setSavedLanguage(lang)
      setAllowOos(Boolean(data.allow_out_of_stock_tryon))
      setSavedAllowOos(Boolean(data.allow_out_of_stock_tryon))
      const pdp = data.pdp_tryon_button_enabled !== false
      setPdpButton(pdp)
      setSavedPdpButton(pdp)
      setSfSavedOk(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[GeneralSettings] save storefront settings failed", e)
      setSfError(msg)
    } finally {
      setSfSaving(false)
    }
  }

  if (loading || sfLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading settings...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Customize how the try-on widget behaves and looks on your storefront.
        </p>
      </div>

      {/* Storefront behavior card */}
      <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
        <Label className="text-base font-semibold">Storefront behavior</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Control how the try-on widget works for your shoppers.
        </p>

        {sfError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{sfError}</AlertDescription>
          </Alert>
        )}

        <div className="mt-5 grid grid-cols-[2rem_minmax(0,26rem)_42px_auto] gap-x-3">
          <SettingRow
            divider={false}
            wideControl
            icon={Globe}
            label="Widget language"
            description="The language shown inside the try-on widget for shoppers."
          >
            <div
              className="inline-flex overflow-hidden rounded-md border border-border"
              role="group"
              aria-label="Widget language"
            >
              {(
                [
                  { value: "en", label: "English" },
                  { value: "he", label: "Hebrew" },
                ] as const
              ).map((opt, index) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={language === opt.value}
                  onClick={() => {
                    setLanguage(opt.value)
                    setSfSavedOk(false)
                  }}
                  disabled={sfSaving}
                  style={
                    language === opt.value
                      ? { backgroundColor: STOREFRONT_ACTIVE_FILL }
                      : undefined
                  }
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-[background-color,color,filter]",
                    index > 0 && "border-l border-border",
                    sfSaving
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer",
                    language === opt.value
                      ? "text-white hover:brightness-110"
                      : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow
            icon={ShoppingBag}
            label="Allow try-on for out-of-stock sizes"
            description="When enabled, shoppers can try on variants that are out of stock. When off, those variants are grayed out."
            hint={<OosSizeHint />}
          >
            <StorefrontToggle
              checked={allowOos}
              onCheckedChange={(checked) => {
                setAllowOos(checked)
                setSfSavedOk(false)
              }}
              disabled={sfSaving}
            />
          </SettingRow>

          <SettingRow
            icon={MousePointerClick}
            label="Show &quot;Try it on&quot; button on product pages"
            description='Displays a "Try it on" button above Add to Cart on product detail pages.'
            hint={<TryItOnButtonHint />}
          >
            <StorefrontToggle
              checked={pdpButton}
              onCheckedChange={(checked) => {
                setPdpButton(checked)
                setSfSavedOk(false)
              }}
              disabled={sfSaving}
            />
          </SettingRow>
        </div>

        <div className="mt-6">
          <Button
            onClick={() => void onSaveStorefrontSettings()}
            disabled={sfSaving || !sfDirty}
          >
            {sfSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving...
              </>
            ) : (
              "Save preferences"
            )}
          </Button>
        </div>

        {sfSavedOk && (
          <Alert className="mt-4 border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-100">
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Changes will apply on the next page load.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Widget colors card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <Label className="text-base font-semibold">Storefront widget colors</Label>
        <p className="mt-1 text-sm text-muted-foreground">Dock color scheme</p>

        {!customizationAllowed && (
          <Alert className="mt-4">
            <AlertTitle>Included on Growth and higher</AlertTitle>
            <AlertDescription>
              Upgrade to Growth or above to unlock color presets. Starter keeps the default DressApp
              look.
            </AlertDescription>
          </Alert>
        )}

        {colorSavedOk && (
          <Alert className="mt-4">
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>
              Shoppers will see the new dock colors on their next page load.
            </AlertDescription>
          </Alert>
        )}

        {colorError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{colorError}</AlertDescription>
          </Alert>
        )}

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0 lg:pr-6">
            <RadioGroup
              value={scheme}
              onValueChange={(value) => {
                setScheme(value as WidgetScheme)
                setColorSavedOk(false)
              }}
              disabled={!customizationAllowed || saving}
              className="space-y-3"
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
                onClick={() => void onSaveColors()}
                disabled={!customizationAllowed || saving || scheme === savedScheme}
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving...
                  </>
                ) : (
                  "Save widget colors"
                )}
              </Button>
            </div>
          </div>

          <div className="flex shrink-0 justify-end overflow-x-auto">
            <WidgetColorPreview scheme={scheme} />
          </div>
        </div>
      </div>
    </div>
  )
}
