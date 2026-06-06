"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
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
  LineChart as LineChartIcon,
} from "lucide-react"
import {
  UsageMyKeysSection,
  type UsageQuotaDisplay,
} from "@/components/dressapp/usage-my-keys-section"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  UsageSeriesChart,
  USAGE_RANGE_UNIT_OPTIONS,
  MAX_USAGE_RANGE_SPAN,
  formatPctOrEmpty,
  usageRangeHint,
  type UsageRangeUnit,
  type UsageTimeseriesBucket,
} from "@/components/dressapp/usage-series-chart"
import { UsageImageRoulette } from "@/components/dressapp/usage-image-roulette"
import {
  UsageFunnelMetricCard,
  UsageTopTryonProducts,
  UsageTryonToPurchaseMetric,
  type TopTryonProduct,
} from "@/components/dressapp/usage-insights-sections"

type UsageSummaryJson = {
  ok?: boolean
  error?: string
  tryon_quota_per_month?: number
  tryon_used_this_month?: number
  tryons_remaining?: number
  try_on_count?: number
  user_model_generation_count?: number
  users_with_model_count?: number
  users_with_try_on_count?: number
  total_site_visitors?: number
  total_checkout_users?: number
  percent_users_with_model_pct?: number | null
  percent_users_with_tryon_pct?: number | null
  conversion_rate_without_tryon_session_pct?: number | null
  conversion_rate_with_tryon_session_pct?: number | null
}

type TimeseriesJson = {
  ok?: boolean
  error?: string
  buckets?: UsageTimeseriesBucket[]
}

type InsightsJson = {
  ok?: boolean
  error?: string
  top_products?: TopTryonProduct[]
  tryon_to_purchase?: {
    attribution_window_days?: number
    tryon_pairs?: number
    converted_pairs?: number
    conversion_rate_pct?: number | null
    order_tracking_enabled?: boolean
  }
}

async function parseJsonBody(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  if (!text.trim()) return {}
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.slice(0, 400)}`)
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

function UsageQuotaSummary({ quota }: { quota: UsageQuotaDisplay }) {
  return (
    <section
      className="rounded-xl border border-border bg-card/40 p-4 md:p-5"
      aria-label="Try-on allowance"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Plan try-ons
          </p>
          {quota.planLabel ? (
            <p className="mt-1 text-sm font-semibold text-foreground">{quota.planLabel}</p>
          ) : null}
        </div>
        <span className="text-xs text-muted-foreground">{quota.usageLabel}</span>
      </div>

      {quota.allowance != null ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background/80 px-3 py-3">
              <p className="text-xs text-muted-foreground">Included</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {quota.allowance.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/80 px-3 py-3">
              <p className="text-xs text-muted-foreground">Used</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {quota.used != null ? quota.used.toLocaleString() : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/80 px-3 py-3">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {quota.remaining != null ? quota.remaining.toLocaleString() : "-"}
              </p>
            </div>
          </div>

          {quota.usageError ? (
            <p className="text-xs text-destructive">Usage unavailable: {quota.usageError}</p>
          ) : quota.remaining === 0 ? (
            <p className="text-xs text-muted-foreground">
              {quota.isSignupTrial ? (
                <>
                  Trial used up.{" "}
                  <Link href="/plans" className="font-medium text-primary underline-offset-4 hover:underline">
                    Choose a plan
                  </Link>{" "}
                  to keep try-ons running.
                </>
              ) : (
                <>
                  Plan cap reached.{" "}
                  <Link
                    href="/settings/billing"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Set up on-demand billing
                  </Link>
                </>
              )}
            </p>
          ) : quota.remaining != null ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{quota.remaining.toLocaleString()}</span>{" "}
              {quota.remainingLabel}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Custom allowance - contact sales for your monthly limit.
        </p>
      )}
    </section>
  )
}

export function DressAppUsageDashboard() {
  const [secretKey, setSecretKey] = useState("")
  const [keysLoaded, setKeysLoaded] = useState(false)
  const [span, setSpan] = useState(1)
  const [spanDraft, setSpanDraft] = useState("1")
  const [unit, setUnit] = useState<UsageRangeUnit>("all")
  const [loading, setLoading] = useState(false)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const initialLoadDoneRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [seriesErr, setSeriesErr] = useState<string | null>(null)
  const [insightsErr, setInsightsErr] = useState<string | null>(null)
  const [summary, setSummary] = useState<UsageSummaryJson | null>(null)
  const [series, setSeries] = useState<UsageTimeseriesBucket[]>([])
  const [insights, setInsights] = useState<InsightsJson | null>(null)
  const [quota, setQuota] = useState<UsageQuotaDisplay | null>(null)

  const rangeHint = usageRangeHint(unit, span)

  const applySpanDraft = useCallback(() => {
    if (unit === "all") return
    const n = Number.parseInt(spanDraft.trim(), 10)
    if (!Number.isFinite(n)) {
      setSpanDraft(String(span))
      return
    }
    const cap = MAX_USAGE_RANGE_SPAN[unit]
    const clamped = Math.min(cap, Math.max(1, n))
    setSpan(clamped)
    setSpanDraft(String(clamped))
  }, [spanDraft, span, unit])

  useEffect(() => {
    if (unit === "all") return
    const cap = MAX_USAGE_RANGE_SPAN[unit]
    setSpan((s) => {
      const next = Math.min(cap, Math.max(1, s))
      if (next !== s) setSpanDraft(String(next))
      return next
    })
  }, [unit])

  const handleSecretKeyLoaded = useCallback((sk: string) => {
    setSecretKey((prev) => (prev === sk ? prev : sk))
  }, [])

  const handleKeysFetchComplete = useCallback(() => {
    setKeysLoaded(true)
  }, [])

  const handleQuotaLoaded = useCallback((next: UsageQuotaDisplay | null) => {
    setQuota(next)
  }, [])

  const loadAll = useCallback(async () => {
    if (!secretKey.trim()) return

    setError(null)
    setSeriesErr(null)
    setInsightsErr(null)
    if (!initialLoadDoneRef.current) {
      setLoading(true)
    } else {
      setMetricsLoading(true)
    }

    const qs = new URLSearchParams({ span: String(span), unit })

    try {
      const [summaryRes, seriesRes, insightsRes] = await Promise.all([
        fetch(`/api/dressapp/usage/summary?${qs}`, { credentials: "same-origin", cache: "no-store" }),
        fetch(`/api/dressapp/usage/timeseries?${qs}`, { credentials: "same-origin", cache: "no-store" }),
        fetch(`/api/dressapp/usage/insights?${qs}`, { credentials: "same-origin", cache: "no-store" }),
      ])

      const summaryData = (await parseJsonBody(summaryRes)) as UsageSummaryJson
      const seriesData = (await parseJsonBody(seriesRes)) as TimeseriesJson
      const insightsData = (await parseJsonBody(insightsRes)) as InsightsJson

      if (!summaryRes.ok || summaryData.ok === false) {
        const msg = formatApiFailure(
          summaryData,
          summaryRes,
          `Usage summary failed (HTTP ${summaryRes.status}).`,
        )
        console.error("[DressApp usage] summary failed", summaryRes.status, summaryData)
        setError(`${msg}\n\nHTTP ${summaryRes.status}`)
        setSummary(null)
      } else {
        setSummary(summaryData)
      }

      if (!seriesRes.ok || seriesData.ok === false) {
        const msg = formatApiFailure(
          seriesData,
          seriesRes,
          `Usage chart failed (HTTP ${seriesRes.status}).`,
        )
        console.error("[DressApp usage] timeseries failed", seriesRes.status, seriesData)
        setSeriesErr(msg)
        setSeries([])
      } else {
        setSeries(Array.isArray(seriesData.buckets) ? seriesData.buckets : [])
      }

      if (!insightsRes.ok || insightsData.ok === false) {
        const msg = formatApiFailure(
          insightsData,
          insightsRes,
          `Usage insights failed (HTTP ${insightsRes.status}).`,
        )
        console.error("[DressApp usage] insights failed", insightsRes.status, insightsData)
        setInsightsErr(msg)
        setInsights(null)
      } else {
        setInsights(insightsData)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.error("[DressApp usage] load error", e)
      setError(message)
    } finally {
      setLoading(false)
      setMetricsLoading(false)
      initialLoadDoneRef.current = true
    }
  }, [secretKey, span, unit])

  useEffect(() => {
    if (!keysLoaded || !secretKey.trim()) return
    void loadAll()
  }, [keysLoaded, secretKey, span, unit, loadAll])

  const loadTryonGalleryUrls = useCallback(
    async (opts?: { limit?: number; offset?: number }) => {
      const limit = opts?.limit ?? 16
      const offset = opts?.offset ?? 0
      const res = await fetch(
        `/api/dressapp/usage/recent-tryon-previews?limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(String(offset))}`,
        { credentials: "same-origin", cache: "no-store" },
      )
      const data = await parseJsonBody(res)
      if (!res.ok || data.ok === false) {
        throw new Error(
          typeof data.error === "string" ? data.error : `HTTP ${res.status}`,
        )
      }
      const raw = data.image_urls
      return Array.isArray(raw) ? raw.filter((u): u is string => typeof u === "string") : []
    },
    [],
  )

  const loadUserModelGalleryUrls = useCallback(async () => {
    const res = await fetch("/api/dressapp/usage/recent-user-model-previews?limit=16", {
      credentials: "same-origin",
      cache: "no-store",
    })
    const data = await parseJsonBody(res)
    if (!res.ok || data.ok === false) {
      throw new Error(typeof data.error === "string" ? data.error : `HTTP ${res.status}`)
    }
    const raw = data.image_urls
    return Array.isArray(raw) ? raw.filter((u): u is string => typeof u === "string") : []
  }, [])

  const tryons = summary?.try_on_count ?? 0
  const models = summary?.user_model_generation_count ?? 0
  const usersModel = summary?.users_with_model_count ?? 0
  const usersTryon = summary?.users_with_try_on_count ?? 0
  const totalSiteVisitors = summary?.total_site_visitors ?? 0
  const totalCheckoutUsers = summary?.total_checkout_users ?? 0
  const conversion = insights?.tryon_to_purchase
  const conversionTrackingOn = Boolean(conversion?.order_tracking_enabled)
  const conversionRate =
    conversion?.conversion_rate_pct != null ? `${conversion.conversion_rate_pct}%` : null
  const topProducts = insights?.top_products ?? []

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">Usage dashboard</h1>
            <span className="text-xs text-muted-foreground md:text-sm">
              Partner usage and funnel metrics
            </span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card/30 lg:w-[min(100%,22rem)] lg:max-h-full lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-5">
            <div className="space-y-4">
              <UsageMyKeysSection
                onSecretKeyLoaded={handleSecretKeyLoaded}
                onKeysFetchComplete={handleKeysFetchComplete}
                onQuotaLoaded={handleQuotaLoaded}
              />

              <div className="space-y-2">
                <Label>Time range</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {unit !== "all" ? (
                    <>
                      <span className="text-sm text-muted-foreground">Last</span>
                      <Input
                        id="usage-lookback-amount"
                        type="number"
                        min={1}
                        max={MAX_USAGE_RANGE_SPAN[unit]}
                        step={1}
                        inputMode="numeric"
                        autoComplete="off"
                        className="w-[5.5rem]"
                        value={spanDraft}
                        onChange={(e) => setSpanDraft(e.target.value)}
                        onBlur={applySpanDraft}
                      />
                    </>
                  ) : null}
                  <Select
                    value={unit}
                    onValueChange={(v) => {
                      const next = v as UsageRangeUnit
                      setUnit(next)
                      if (next !== "all" && !spanDraft.trim()) setSpanDraft("1")
                    }}
                  >
                    <SelectTrigger id="usage-lookback-unit" className="w-[8.5rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USAGE_RANGE_UNIT_OPTIONS.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {metricsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Metrics and charts use {rangeHint.toLowerCase()}.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => void loadAll()}
                disabled={loading || metricsLoading || !secretKey.trim()}
                aria-label="Refresh usage"
              >
                {loading || metricsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden />
                )}
              </Button>
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

              {quota ? <UsageQuotaSummary quota={quota} /> : null}

              {summary ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-base font-semibold">Usage overview</h2>
                    <p className="text-sm text-muted-foreground">
                      {(summary.tryons_remaining ?? 0).toLocaleString()} try-ons left in this billing
                      period · {(summary.tryon_used_this_month ?? 0).toLocaleString()} used of{" "}
                      {(summary.tryon_quota_per_month ?? 0).toLocaleString()} in your plan allowance.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      icon={<UserCircle2 className="h-5 w-5" aria-hidden />}
                      label="Users with model"
                      value={usersModel}
                      hint={rangeHint}
                    />
                    <MetricCard
                      icon={<Sparkles className="h-5 w-5" aria-hidden />}
                      label="Model jobs"
                      value={models}
                      hint={rangeHint}
                      chart={2}
                    />
                    <MetricCard
                      icon={<Users className="h-5 w-5" aria-hidden />}
                      label="Users with try-on"
                      value={usersTryon}
                      hint={rangeHint}
                    />
                    <MetricCard
                      icon={<Shirt className="h-5 w-5" aria-hidden />}
                      label="Try-ons"
                      value={tryons}
                      hint={rangeHint}
                      chart={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Storefront funnel</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on tracked storefront visitors. In the selected timeframe there were{" "}
                      {totalSiteVisitors.toLocaleString()} visitors, and out of them{" "}
                      {totalCheckoutUsers.toLocaleString()} checked out.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <UsageFunnelMetricCard
                        label="Users with model"
                        value={formatPctOrEmpty(summary.percent_users_with_model_pct)}
                        hint="Active models / tracked visitors (regenerations not counted)"
                      />
                      <UsageFunnelMetricCard
                        label="Users with try-on"
                        value={formatPctOrEmpty(summary.percent_users_with_tryon_pct)}
                        hint="Visitors who generated at least one try-on"
                      />
                      <UsageFunnelMetricCard
                        label="Conversion without try-on"
                        value={formatPctOrEmpty(summary.conversion_rate_without_tryon_session_pct)}
                        hint="Sessions without try-on that checked out / all sessions without try-on"
                      />
                      <UsageFunnelMetricCard
                        label="Conversion with try-on"
                        value={formatPctOrEmpty(summary.conversion_rate_with_tryon_session_pct)}
                        hint="Sessions with try-on that checked out / all sessions with try-on"
                      />
                    </div>
                  </div>

                  <section className="rounded-xl border border-border bg-card/30 p-4 md:p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium">
                      <LineChartIcon className="h-4 w-4 text-chart-4" aria-hidden />
                      Dashboard
                      <span className="text-xs font-normal text-muted-foreground">
                        Charts follow your activity in UTC ({rangeHint.toLowerCase()}).
                      </span>
                    </div>

                    {insightsErr ? (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Could not load insights</AlertTitle>
                        <AlertDescription>{insightsErr}</AlertDescription>
                      </Alert>
                    ) : null}

                    <UsageTryonToPurchaseMetric
                      loading={metricsLoading}
                      conversionTrackingOn={conversionTrackingOn}
                      conversionRate={conversionRate}
                      tryonPairs={conversion?.tryon_pairs ?? 0}
                      convertedPairs={conversion?.converted_pairs ?? 0}
                      attributionWindowDays={conversion?.attribution_window_days ?? 30}
                    />

                    {seriesErr ? (
                      <Alert variant="destructive" className="my-4">
                        <AlertTitle>Could not load chart</AlertTitle>
                        <AlertDescription>{seriesErr}</AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      <ChartBlock title="Users with a model">
                        <UsageSeriesChart
                          buckets={series}
                          getValue={(b) => b.users_with_model_count}
                          stroke="#00848e"
                        />
                      </ChartBlock>
                      <ChartBlock title="Model jobs">
                        <UsageSeriesChart
                          buckets={series}
                          getValue={(b) => b.user_model_generation_count}
                          stroke="#108043"
                        />
                      </ChartBlock>
                      <ChartBlock title="Users with try-on">
                        <UsageSeriesChart
                          buckets={series}
                          getValue={(b) => b.users_with_try_on_count}
                          stroke="#b98900"
                        />
                      </ChartBlock>
                      <ChartBlock title="Try-ons">
                        <UsageSeriesChart
                          buckets={series}
                          getValue={(b) => b.try_on_count}
                          stroke="#7c3aed"
                        />
                      </ChartBlock>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      X-axis labels are UTC bucket boundaries; each point is the total inside that
                      bucket (not cumulative across the whole range).
                    </p>
                  </section>

                  <UsageTopTryonProducts loading={metricsLoading} products={topProducts} />

                  <UsageImageRoulette
                    rouletteId="userModel"
                    loadImageUrls={loadUserModelGalleryUrls}
                    title="Recent user models"
                    subtitle="Digital models created by shoppers on your storefront."
                    loadingLabel="Loading recent user models…"
                    errorTitle="Could not load model previews"
                    emptyLabel="No user models yet"
                    logPrefix="[DressApp usage/user-model-roulette]"
                  />

                  <UsageImageRoulette
                    rouletteId="tryon"
                    loadImageUrls={loadTryonGalleryUrls}
                    title="Recent try-ons"
                    subtitle="Successful try-ons from shoppers on your storefront."
                    loadingLabel="Loading recent try-ons…"
                    errorTitle="Could not load try-on previews"
                    emptyLabel="No generated try-ons yet"
                    logPrefix="[DressApp usage/tryon-roulette]"
                    initialFetchLimit={50}
                    loadMoreBatchSize={10}
                    loadMoreIntervalMs={5000}
                    prefetchImages
                  />
                </>
              ) : keysLoaded && !secretKey.trim() ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-10 text-center text-sm text-muted-foreground">
                  Merchant keys are not ready yet. Check DressApp Settings → Credentials, then refresh
                  this page.
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-10 text-center text-sm text-muted-foreground">
                  {loading || !keysLoaded ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Loading your usage…
                    </span>
                  ) : (
                    "Adjust the time range, then press refresh to load charts and totals."
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  sub,
  chart,
}: {
  icon: React.ReactNode
  label: string
  value: number
  hint: string
  sub?: React.ReactNode
  chart?: number
}) {
  const bg =
    chart === 1
      ? "bg-gradient-to-br from-chart-1/12 to-transparent"
      : chart === 2
        ? "bg-gradient-to-br from-chart-2/12 to-transparent"
        : "bg-muted/20"
  const iconWrap =
    chart === 1
      ? "bg-chart-1/20 text-chart-1"
      : chart === 2
        ? "bg-chart-2/20 text-chart-2"
        : "bg-muted text-muted-foreground"

  return (
    <div className={`rounded-xl border border-border p-4 ${bg}`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconWrap}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
            {value.toLocaleString()}
          </p>
          {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
          <p className={`text-xs text-muted-foreground ${sub ? "mt-1" : "mt-1"}`}>{hint}</p>
        </div>
      </div>
    </div>
  )
}

function ChartBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}
