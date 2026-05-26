"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Loader2,
  RefreshCw,
  Shirt,
  Sparkles,
  Users,
  UserCircle2,
  Wallet,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ImageIcon,
} from "lucide-react"
import { UsageMyKeysSection } from "@/components/dressapp/usage-my-keys-section"
import {
  subDays,
  subHours,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DRESSAPP_TRY_ON_USD,
  DRESSAPP_USER_MODEL_USD,
  formatUsd,
} from "@/lib/dressapp-usage-pricing"
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"

const USAGE_PATH = "/partner/v1/merchants/me/usage"

const CHART_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
] as const

const USAGE_LINE_TOOLTIP = {
  contentStyle: {
    background: "oklch(0.12 0 0)",
    border: "1px solid oklch(0.22 0 0)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#fff",
  },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#fff" },
} as const

/** Two points so a line renders for a single API total (not a time series). */
function buildTotalRampData(count: number) {
  return [
    { step: 0, count: 0 },
    { step: 1, count: count },
  ]
}

function UsageMetricMiniLine({
  title,
  value,
  stroke,
}: {
  title: string
  value: number
  stroke: string
}) {
  const data = useMemo(() => buildTotalRampData(value), [value])
  const yMax = Math.max(value, 1)
  return (
    <div className="rounded-xl border border-border bg-card/30 p-3 md:p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums md:text-2xl">{value.toLocaleString()}</p>
      <div className="mt-2 h-36 w-full min-w-0 md:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" />
            <XAxis dataKey="step" type="number" domain={[0, 1]} hide />
            <YAxis
              domain={[0, yMax]}
              width={36}
              tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
              axisLine={{ stroke: "oklch(0.22 0 0)" }}
              tickFormatter={(v) => (typeof v === "number" ? v.toLocaleString() : String(v))}
            />
            <Tooltip
              cursor={{ stroke: "oklch(0.35 0 0)", strokeWidth: 1 }}
              {...USAGE_LINE_TOOLTIP}
              formatter={(n: number) => [n.toLocaleString(), "Count"]}
            />
            <Line
              type="linear"
              dataKey="count"
              name="Count"
              stroke={stroke}
              strokeWidth={2}
              dot={{ fill: stroke, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** Strip accidental `Bearer ` prefix when pasting from docs; trim whitespace. */
function normalizeMerchantSecretKeyInput(raw: string): string {
  let s = raw.trim()
  const bearerPrefix = s.match(/^Bearer\s+(.+)$/i)
  if (bearerPrefix?.[1]) {
    s = bearerPrefix[1].trim()
  }
  return s
}

/** Reject publishable keys before calling the API (403 from require_partner_scopes). */
function validateMerchantSecretKey(secret: string): string | null {
  const s = secret.trim()
  if (!s) return "Paste your merchant secret API key (dress_sk_live_…)."
  if (s.startsWith("dress_pk_")) {
    return (
      "Publishable keys (dress_pk_…) cannot call this endpoint. " +
      "Use your secret key (dress_sk_live_…) with sessions:write scope — the API returns 403 otherwise."
    )
  }
  if (!s.startsWith("dress_sk_")) {
    return "Expected a secret key starting with dress_sk_ (e.g. dress_sk_live_…)."
  }
  return null
}

const LOOKBACK_UNITS = ["hours", "days", "weeks", "months", "years"] as const
type LookbackUnit = (typeof LOOKBACK_UNITS)[number]

const LOOKBACK_LABELS: Record<LookbackUnit, string> = {
  hours: "Hours",
  days: "Days",
  weeks: "Weeks",
  months: "Months",
  years: "Years",
}

type UsageRangeMode = "all" | "custom"

/** `to` = now, `from` = now minus the lookback window (ISO strings for query params). */
function computeFromToIso(amount: number, unit: LookbackUnit): { from: string; to: string } {
  const to = new Date()
  let from: Date
  switch (unit) {
    case "hours":
      from = subHours(to, amount)
      break
    case "days":
      from = subDays(to, amount)
      break
    case "weeks":
      from = subWeeks(to, amount)
      break
    case "months":
      from = subMonths(to, amount)
      break
    case "years":
      from = subYears(to, amount)
      break
    default:
      from = subDays(to, amount)
  }
  return { from: from.toISOString(), to: to.toISOString() }
}

export type DressAppUsagePayload = {
  try_on_count: number
  user_model_generation_count: number
  users_with_model_count: number
  users_with_try_on_count: number
  merchant_id?: string
  period_from?: string
  period_to?: string
}

async function parseJsonBody(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  if (!text.trim()) {
    return {}
  }
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.slice(0, 400)}`)
  }
}

function readNonNegativeInt(val: unknown, field: string): number {
  if (typeof val !== "number" || !Number.isFinite(val) || val < 0 || !Number.isInteger(val)) {
    throw new Error(
      `Invalid or missing integer field "${field}" in usage response (got ${String(val)}).`,
    )
  }
  return val
}

function parseUsagePayload(data: Record<string, unknown>): DressAppUsagePayload {
  return {
    try_on_count: readNonNegativeInt(data.try_on_count, "try_on_count"),
    user_model_generation_count: readNonNegativeInt(
      data.user_model_generation_count,
      "user_model_generation_count",
    ),
    users_with_model_count: readNonNegativeInt(
      data.users_with_model_count,
      "users_with_model_count",
    ),
    users_with_try_on_count: readNonNegativeInt(
      data.users_with_try_on_count,
      "users_with_try_on_count",
    ),
    merchant_id: typeof data.merchant_id === "string" ? data.merchant_id : undefined,
    period_from: typeof data.period_from === "string" ? data.period_from : undefined,
    period_to: typeof data.period_to === "string" ? data.period_to : undefined,
  }
}

function formatApiFailure(data: Record<string, unknown>, res: Response, fallback: string): string {
  const err = typeof data.error === "string" ? data.error : fallback
  const detail = typeof data.detail === "string" ? data.detail : ""
  const message = typeof data.message === "string" ? data.message : ""
  const hint = typeof data.hint === "string" ? data.hint : ""
  const parts = [err, message, detail, hint].filter(Boolean)
  return parts.length ? parts.join("\n\n") : fallback
}

function normalizeApiBase(raw: string): string {
  return raw.trim().replace(/\/$/, "")
}

type GalleryJson = {
  ok?: boolean
  images?: { url: string }[]
  configured?: boolean
  message?: string
  error?: string
}

function UsageTryOnGalleryMarquee() {
  const [items, setItems] = useState<{ url: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [info, setInfo] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setErr(null)
      setInfo(null)
      try {
        const res = await fetch("/api/dressapp/usage/try-on-gallery", { credentials: "same-origin" })
        const data = (await res.json()) as GalleryJson
        if (cancelled) return
        if (!res.ok) {
          const msg = typeof data.error === "string" ? data.error : `HTTP ${res.status}`
          console.error("[DressApp usage gallery] bad response", res.status, data)
          setErr(msg)
          setItems([])
          return
        }
        if (data.error) {
          console.error("[DressApp usage gallery]", data.error)
          setErr(data.error)
        }
        if (data.message && !data.configured) {
          setInfo(data.message)
        }
        setItems(Array.isArray(data.images) ? data.images.filter((x) => x?.url) : [])
      } catch (e) {
        if (cancelled) return
        const message = e instanceof Error ? e.message : String(e)
        console.error("[DressApp usage gallery] fetch failed", e)
        setErr(message)
        setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loop = useMemo(
    () => (items.length && !reducedMotion ? [...items, ...items] : items),
    [items, reducedMotion],
  )

  return (
    <section
      className="border-t border-border bg-muted/20"
      aria-label="Recent try-on images from your database"
    >
      <div className="flex items-center gap-2 border-b border-border/80 px-4 py-2">
        <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Try-on gallery
        </span>
        {loading ? (
          <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
        ) : null}
      </div>
      <div
        className={`relative h-[7.5rem] md:h-[8.5rem] ${reducedMotion ? "overflow-x-auto" : "overflow-hidden"}`}
      >
        {err ? (
          <div className="flex h-full items-center px-4 text-xs text-destructive">
            Gallery could not load: {err}
          </div>
        ) : info && !items.length ? (
          <div className="flex h-full items-center px-4 text-xs text-muted-foreground">{info}</div>
        ) : !items.length && !loading ? (
          <div className="flex h-full items-center px-4 text-xs text-muted-foreground">
            No image URLs returned. Check table rows and URL column values.
          </div>
        ) : (
          <div
            className={`flex h-full items-center gap-3 px-3 py-2 ${loop.length && !reducedMotion ? "usage-gallery-marquee w-max" : "w-max min-w-full"}`}
          >
            {loop.map((im, i) => (
              <div
                key={`${im.url}-${i}`}
                className="relative h-[5.75rem] w-[5.75rem] shrink-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm md:h-[6.75rem] md:w-[6.75rem]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={im.url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function DressAppUsageDashboard() {
  const apiBase = useMemo(
    () => normalizeApiBase(process.env.NEXT_PUBLIC_DRESSAPP_API_BASE_URL ?? ""),
    [],
  )

  const [secretKey, setSecretKey] = useState("")
  const [rangeMode, setRangeMode] = useState<UsageRangeMode>("all")
  const [lookbackAmount, setLookbackAmount] = useState("")
  const [lookbackUnit, setLookbackUnit] = useState<LookbackUnit>("days")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<DressAppUsagePayload | null>(null)

  const estimates = useMemo(() => {
    if (!usage) return null
    const tryOnCost = usage.try_on_count * DRESSAPP_TRY_ON_USD
    const modelCost = usage.user_model_generation_count * DRESSAPP_USER_MODEL_USD
    return {
      tryOnCost,
      modelCost,
      combined: tryOnCost + modelCost,
    }
  }, [usage])

  const spendSlices = useMemo(() => {
    if (!estimates || estimates.combined <= 0) return []
    return [
      { name: "Try-ons (list est.)", value: estimates.tryOnCost },
      { name: "Models (list est.)", value: estimates.modelCost },
    ]
  }, [estimates])

  const handleLoad = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    const isRefresh = mode === "refresh"
    setError(null)
    if (!isRefresh) {
      setUsage(null)
    }

    const base = apiBase
    if (!base) {
      setError(
        "This site is missing NEXT_PUBLIC_DRESSAPP_API_BASE_URL. Add it to the deployment environment and rebuild.",
      )
      return
    }
    const secret = normalizeMerchantSecretKeyInput(secretKey)
    const keyErr = validateMerchantSecretKey(secret)
    if (keyErr) {
      setError(keyErr)
      return
    }

    const path = USAGE_PATH
    const qs = new URLSearchParams()
    if (rangeMode === "custom") {
      const rawLookback = lookbackAmount.trim()
      if (rawLookback === "") {
        setError(
          "Custom time range: enter a whole number of 1 or more, or switch to All time.",
        )
        return
      }
      const n = Number.parseInt(rawLookback, 10)
      if (!Number.isFinite(n) || n < 1) {
        setError(
          "Custom time range: use a whole number of 1 or more, or switch to All time.",
        )
        return
      }
      const { from, to } = computeFromToIso(n, lookbackUnit)
      qs.set("from", from)
      qs.set("to", to)
    }
    const query = qs.toString()
    const url = query ? `${base}${path}?${query}` : `${base}${path}`

    const headers: Record<string, string> = {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json",
    }

    setLoading(true)
    try {
      const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "omit",
      })

      const data = await parseJsonBody(res)

      if (!res.ok) {
        const msg = formatApiFailure(
          data,
          res,
          `Usage request failed (HTTP ${res.status}).`,
        )
        console.error("[DressApp usage] request failed", {
          status: res.status,
          url,
          body: data,
        })
        setError(`${msg}\n\nHTTP ${res.status}`)
        return
      }

      try {
        setUsage(parseUsagePayload(data))
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        console.error("[DressApp usage] invalid response shape", { data, message })
        setError(`${message}\n\nHTTP ${res.status}`)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.error("[DressApp usage] network or parse error", e)
      setError(
        `${message}\n\nIf the browser blocked the request, the API may need CORS for this origin, or use a server-side proxy — see backend.md.`,
      )
    } finally {
      setLoading(false)
    }
  }, [apiBase, secretKey, rangeMode, lookbackAmount, lookbackUnit])

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">Usage dashboard</h1>
            <span className="text-xs text-muted-foreground md:text-sm">
              Partner usage and list-price estimates
            </span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="w-full shrink-0 border-b border-border bg-card/30 lg:w-[min(100%,22rem)] lg:border-b-0 lg:border-r">
          <div className="max-h-[42vh] overflow-y-auto p-4 md:max-h-none lg:max-h-full lg:p-5">
            <div className="space-y-4">
              <UsageMyKeysSection
                onSecretKeyLoaded={(sk) => {
                  setSecretKey((prev) => (prev.trim() ? prev : sk))
                }}
              />
              <div className="space-y-2">
                <Label htmlFor="usage-merchant-secret">Merchant secret API key</Label>
                <Input
                  id="usage-merchant-secret"
                  name="merchantSecret"
                  type="password"
                  autoComplete="off"
                  placeholder="dress_sk_live_…"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time range</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={rangeMode}
                  onValueChange={(v) => {
                    if (!v) return
                    const mode = v as UsageRangeMode
                    setRangeMode(mode)
                    if (mode === "custom" && !lookbackAmount.trim()) {
                      setLookbackAmount("30")
                    }
                  }}
                  className="flex w-full flex-wrap gap-1"
                >
                  <ToggleGroupItem value="all" className="flex-1 text-xs">
                    All time
                  </ToggleGroupItem>
                  <ToggleGroupItem value="custom" className="flex-1 text-xs">
                    Custom window
                  </ToggleGroupItem>
                </ToggleGroup>
                {rangeMode === "custom" ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-sm text-muted-foreground">Last</span>
                    <Input
                      id="usage-lookback-amount"
                      name="usageLookbackAmount"
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="30"
                      className="w-[5.5rem]"
                      value={lookbackAmount}
                      onChange={(e) => setLookbackAmount(e.target.value)}
                    />
                    <Select
                      value={lookbackUnit}
                      onValueChange={(v) => setLookbackUnit(v as LookbackUnit)}
                    >
                      <SelectTrigger id="usage-lookback-unit" className="w-[8.5rem]" size="default">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOOKBACK_UNITS.map((u) => (
                          <SelectItem key={u} value={u}>
                            {LOOKBACK_LABELS[u]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => void handleLoad("initial")} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Loading…
                    </>
                  ) : (
                    "Load usage"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleLoad("refresh")}
                  disabled={loading || !usage}
                  title={!usage ? "Load usage first, then refresh" : undefined}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Could not load usage</AlertTitle>
                  <AlertDescription>
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans text-xs">
                      {error}
                    </pre>
                  </AlertDescription>
                </Alert>
              ) : null}

              {usage && estimates ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-border bg-gradient-to-br from-chart-1/12 to-transparent p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/20 text-chart-1">
                          <Shirt className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Try-ons
                          </p>
                          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                            {usage.try_on_count}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatUsd(DRESSAPP_TRY_ON_USD)} each →{" "}
                            <span className="text-foreground">{formatUsd(estimates.tryOnCost)}</span> est.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-gradient-to-br from-chart-2/12 to-transparent p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20 text-chart-2">
                          <Sparkles className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Model jobs
                          </p>
                          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                            {usage.user_model_generation_count}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatUsd(DRESSAPP_USER_MODEL_USD)} each →{" "}
                            <span className="text-foreground">{formatUsd(estimates.modelCost)}</span> est.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <UserCircle2 className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Users with model
                          </p>
                          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                            {usage.users_with_model_count}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Distinct shoppers</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Users className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Users with try-on
                          </p>
                          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                            {usage.users_with_try_on_count}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Distinct shoppers</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card/30 p-4 md:p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium">
                      <LineChartIcon className="h-4 w-4 text-chart-4" aria-hidden />
                      Usage metrics
                      <span className="text-xs font-normal text-muted-foreground">
                        One total per chart for the range you loaded (not daily history).
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <UsageMetricMiniLine
                        title="Try-ons"
                        value={usage.try_on_count}
                        stroke={CHART_FILLS[0]}
                      />
                      <UsageMetricMiniLine
                        title="Models generated"
                        value={usage.user_model_generation_count}
                        stroke={CHART_FILLS[1]}
                      />
                      <UsageMetricMiniLine
                        title="Users with a model"
                        value={usage.users_with_model_count}
                        stroke={CHART_FILLS[2]}
                      />
                      <UsageMetricMiniLine
                        title="Users with try-on"
                        value={usage.users_with_try_on_count}
                        stroke={CHART_FILLS[3]}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card/40 p-4 md:p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Wallet className="h-4 w-4 text-chart-3" aria-hidden />
                      <span className="text-sm font-medium">Estimated total (list rates)</span>
                      <span className="text-xs text-muted-foreground">Try-ons plus model jobs, not an invoice.</span>
                    </div>
                    <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight md:text-4xl">
                      {formatUsd(estimates.combined)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/30 p-4 md:p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                      <PieChartIcon className="h-4 w-4 text-chart-2" aria-hidden />
                      Spend mix (estimate)
                    </div>
                    {spendSlices.length ? (
                      <div className="mx-auto h-64 max-w-md w-full min-w-0 md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip
                              formatter={(v: number) => formatUsd(v)}
                              contentStyle={{
                                background: "oklch(0.12 0 0)",
                                border: "1px solid oklch(0.22 0 0)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "#fff",
                              }}
                              labelStyle={{ color: "#fff" }}
                              itemStyle={{ color: "#fff" }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Pie
                              data={spendSlices}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={52}
                              outerRadius={80}
                              paddingAngle={2}
                            >
                              {spendSlices.map((_, i) => (
                                <Cell key={i} fill={CHART_FILLS[i % CHART_FILLS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        At zero usage there is nothing to chart for spend mix. Load a merchant with activity or
                        confirm counts from the API.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-10 text-center text-sm text-muted-foreground">
                  Enter your secret key and load usage to see charts and totals.
                </div>
              )}
            </div>
          </div>

          <UsageTryOnGalleryMarquee />
        </div>
      </div>
    </div>
  )
}
