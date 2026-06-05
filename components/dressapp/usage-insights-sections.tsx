"use client"

import { Loader2 } from "lucide-react"

export type TopTryonProduct = {
  product_id: number
  title: string
  image_url?: string | null
  try_on_count: number
}

const PODIUM_RANKS = [
  {
    rank: 1,
    label: "#1",
    medal: "Gold",
    accent: "#D4AF37",
    accentSoft: "rgba(212, 175, 55, 0.14)",
    border: "rgba(212, 175, 55, 0.45)",
    scale: "scale-[1.02]",
  },
  {
    rank: 2,
    label: "#2",
    medal: "Silver",
    accent: "#A8A9AD",
    accentSoft: "rgba(168, 169, 173, 0.14)",
    border: "rgba(168, 169, 173, 0.45)",
    scale: "scale-100",
  },
  {
    rank: 3,
    label: "#3",
    medal: "Bronze",
    accent: "#CD7F32",
    accentSoft: "rgba(205, 127, 50, 0.14)",
    border: "rgba(205, 127, 50, 0.45)",
    scale: "scale-[0.98]",
  },
] as const

export function UsageTopTryonProducts({
  loading,
  products,
}: {
  loading: boolean
  products: TopTryonProduct[]
}) {
  return (
    <section className="rounded-xl border border-border bg-card/30 p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium">Top 3 most tried-on products</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Your most tried-on products in the selected chart time range.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading leaderboard…
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No try-ons in this range yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {PODIUM_RANKS.map((slot) => {
            const product = products[slot.rank - 1]
            if (!product) {
              return (
                <div
                  key={slot.rank}
                  className="min-h-[168px] rounded-xl border border-dashed border-border bg-muted/10"
                />
              )
            }
            return (
              <div key={product.product_id} className={`origin-top ${slot.scale}`}>
                <div
                  className="min-h-[168px] rounded-xl border p-4"
                  style={{
                    borderColor: slot.border,
                    background: `linear-gradient(180deg, ${slot.accentSoft} 0%, var(--card) 42%)`,
                    boxShadow:
                      slot.rank === 1 ? "0 10px 28px rgba(212, 175, 55, 0.16)" : undefined,
                  }}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                      className="rounded-lg px-3 py-1 text-xs font-bold"
                      style={{
                        color: slot.accent,
                        background: slot.accentSoft,
                        border: `1px solid ${slot.border}`,
                      }}
                    >
                      {slot.label} · {slot.medal}
                    </span>
                    <span className="font-mono text-lg font-semibold tabular-nums">
                      {product.try_on_count.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-[72px] w-[72px] shrink-0 rounded-lg border object-cover"
                        style={{ borderColor: slot.border, borderWidth: 2 }}
                      />
                    ) : (
                      <div className="h-[72px] w-[72px] shrink-0 rounded-lg bg-muted" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.try_on_count.toLocaleString()} try-ons
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function UsageTryonToPurchaseMetric({
  loading,
  conversionTrackingOn,
  conversionRate,
  tryonPairs,
  convertedPairs,
  attributionWindowDays,
}: {
  loading: boolean
  conversionTrackingOn: boolean
  conversionRate: string | null
  tryonPairs: number
  convertedPairs: number
  attributionWindowDays: number
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <h4 className="text-sm font-medium">Try-on to purchase</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        Logged-in shoppers who tried a product and bought the same item within{" "}
        {attributionWindowDays} days.
      </p>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading conversion…
        </div>
      ) : !conversionTrackingOn ? (
        <div className="mt-4 space-y-2">
          <p className="font-mono text-3xl font-semibold">-</p>
          <p className="text-xs text-muted-foreground">
            Order tracking requires Shopify app permissions. Conversion counts from paid orders
            after permissions are granted.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <p className="font-mono text-3xl font-semibold tabular-nums">
            {conversionRate ?? "0%"}
          </p>
          <p className="text-sm text-muted-foreground">
            {convertedPairs.toLocaleString()} of {tryonPairs.toLocaleString()} try-on pairs
            converted
          </p>
        </div>
      )}
    </div>
  )
}

export function UsageFunnelMetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
