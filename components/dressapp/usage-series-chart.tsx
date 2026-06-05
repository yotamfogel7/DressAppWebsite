"use client"

import { useId, useMemo, useState } from "react"

export type UsageTimeseriesBucket = {
  label: string
  try_on_count: number
  user_model_generation_count: number
  users_with_model_count: number
  users_with_try_on_count: number
}

function yTickValues(maxV: number, divisions: number): number[] {
  const d = Math.max(1, divisions)
  const raw = Array.from({ length: d + 1 }, (_, i) => Math.round((maxV * i) / d))
  return [...new Set(raw)].sort((a, b) => a - b)
}

const X_LABEL_CHAR_PX = 5.85
const X_LABEL_MIN_GAP_PX = 6

function axisTickDisplayLen(label: string): number {
  if (label.length > 14) return 13
  return label.length
}

function axisTickHalfWidthPx(label: string): number {
  return (axisTickDisplayLen(label) * X_LABEL_CHAR_PX) / 2
}

function xLabelIndexSet(n: number, maxLabels: number): Set<number> {
  if (n <= 0) return new Set()
  if (n === 1) return new Set([0])
  const cap = Math.min(Math.max(2, maxLabels), n)
  const out = new Set<number>()
  for (let k = 0; k < cap; k++) {
    out.add(Math.round((k / (cap - 1)) * (n - 1)))
  }
  return out
}

function xLabelsOverlap(cx: number[], labels: string[], indices: number[]): boolean {
  const sorted = [...indices].sort((a, b) => (cx[a] ?? 0) - (cx[b] ?? 0))
  for (let k = 0; k < sorted.length - 1; k++) {
    const i = sorted[k]!
    const j = sorted[k + 1]!
    const xi = cx[i] ?? 0
    const xj = cx[j] ?? 0
    const need =
      axisTickHalfWidthPx(labels[i] ?? "") +
      axisTickHalfWidthPx(labels[j] ?? "") +
      X_LABEL_MIN_GAP_PX
    if (xj - xi < need) return true
  }
  return false
}

function xLabelIndexSetNonOverlapping(n: number, cx: number[], labels: string[]): Set<number> {
  if (n <= 0) return new Set()
  if (n === 1) return new Set([0])
  const maxTry = Math.min(n, 12)
  for (let maxLabels = maxTry; maxLabels >= 2; maxLabels--) {
    const set = xLabelIndexSet(n, maxLabels)
    const arr = [...set].sort((a, b) => a - b)
    if (!xLabelsOverlap(cx, labels, arr)) return set
  }
  return new Set([0, n - 1])
}

export function UsageSeriesChart({
  buckets,
  getValue,
  stroke,
}: {
  buckets: UsageTimeseriesBucket[]
  getValue: (b: UsageTimeseriesBucket) => number
  stroke: string
}) {
  const gridId = useId().replace(/:/g, "")
  const [hover, setHover] = useState<{ i: number; value: number; label: string } | null>(null)

  const vals = buckets.map(getValue)
  const maxV = Math.max(1, ...vals)
  const w = 380
  const h = 132
  const padLeft = 44
  const padRight = 12
  const padTop = 10
  const padBottom = 42
  const plotW = w - padLeft - padRight
  const plotBottom = h - padBottom
  const innerH = plotBottom - padTop
  const n = Math.max(1, buckets.length)
  const xLabels = buckets.map((b) => b.label)
  const yTicks = yTickValues(maxV, 4)

  const pts: string[] = []
  const cx: number[] = []
  const cy: number[] = []
  for (let i = 0; i < n; i++) {
    const x = n === 1 ? padLeft + plotW / 2 : padLeft + (i / (n - 1)) * plotW
    const v = vals[i] ?? 0
    const y = padTop + innerH - (v / maxV) * innerH
    pts.push(`${x},${y}`)
    cx.push(x)
    cy.push(y)
  }

  const xLabelIndices = xLabelIndexSetNonOverlapping(n, cx, xLabels)

  const tipW = 108
  const tipH = 38
  const tipPad = 6
  const tip = hover
    ? (() => {
        const i = hover.i
        const px = cx[i] ?? 0
        const py = cy[i] ?? 0
        const main = hover.value.toLocaleString()
        const sub = hover.label.length > 18 ? `${hover.label.slice(0, 16)}…` : hover.label
        const above = py > padTop + tipH + tipPad + 8
        const cxTip = Math.min(w - padRight - tipW / 2, Math.max(padLeft + tipW / 2, px))
        const cyTip = above ? py - tipH - tipPad : py + tipPad + 4
        return { cxTip, cyTip, main, sub }
      })()
    : null

  if (buckets.length === 0) {
    return (
      <div className="flex h-[132px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-xs text-muted-foreground">
        No data in this range
      </div>
    )
  }

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      className="block max-w-full"
      role="img"
      aria-label="Usage chart"
    >
      <defs>
        <pattern id={gridId} width="18" height="14" patternUnits="userSpaceOnUse">
          <path
            d="M 18 0 L 0 0 0 14"
            fill="none"
            stroke="oklch(0.22 0 0)"
            strokeWidth="0.5"
            opacity={0.55}
          />
        </pattern>
      </defs>
      <rect x={padLeft} y={padTop} width={plotW} height={innerH} fill={`url(#${gridId})`} />
      {yTicks.map((tv) => {
        const yy = padTop + innerH - (tv / maxV) * innerH
        return (
          <g key={`yt-${tv}`}>
            <line
              x1={padLeft}
              y1={yy}
              x2={padLeft + plotW}
              y2={yy}
              stroke="oklch(0.22 0 0)"
              strokeWidth="0.75"
              opacity={0.65}
            />
            <text
              x={padLeft - 6}
              y={yy + 4}
              textAnchor="end"
              fill="oklch(0.65 0 0)"
              fontSize="10"
              className="font-sans"
            >
              {tv.toLocaleString()}
            </text>
          </g>
        )
      })}
      <line
        x1={padLeft}
        y1={padTop}
        x2={padLeft}
        y2={plotBottom}
        stroke="oklch(0.35 0 0)"
        strokeWidth="1"
      />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.join(" ")}
      />
      {cx.map((x, i) => (
        <circle
          key={`pt-${i}`}
          cx={x}
          cy={cy[i]}
          r="12"
          fill="transparent"
          className="cursor-pointer"
          onPointerEnter={() =>
            setHover({ i, value: vals[i] ?? 0, label: buckets[i]?.label ?? "" })
          }
          onPointerLeave={() => setHover(null)}
        />
      ))}
      {hover ? (
        <circle
          cx={cx[hover.i]}
          cy={cy[hover.i]}
          r="3.5"
          fill={stroke}
          pointerEvents="none"
        />
      ) : null}
      {buckets.map((b, i) => {
        if (!xLabelIndices.has(i)) return null
        const x = cx[i] ?? 0
        return (
          <text
            key={`t-${i}`}
            x={x}
            y={h - 10}
            textAnchor="middle"
            fill="oklch(0.65 0 0)"
            fontSize="10"
            className="font-sans"
          >
            {b.label.length > 14 ? `${b.label.slice(0, 12)}…` : b.label}
          </text>
        )
      })}
      {tip ? (
        <g pointerEvents="none">
          <rect
            x={tip.cxTip - tipW / 2}
            y={tip.cyTip}
            width={tipW}
            height={tipH}
            rx={6}
            fill="oklch(0.12 0 0)"
            stroke="oklch(0.22 0 0)"
            strokeWidth="1"
          />
          <text
            x={tip.cxTip}
            y={tip.cyTip + 16}
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="600"
            className="font-sans"
          >
            {tip.main}
          </text>
          <text
            x={tip.cxTip}
            y={tip.cyTip + 30}
            textAnchor="middle"
            fill="oklch(0.75 0 0)"
            fontSize="9"
            className="font-sans"
          >
            {tip.sub}
          </text>
        </g>
      ) : null}
    </svg>
  )
}

export function usageRangeHint(unit: UsageRangeUnit, span: number): string {
  if (unit === "all") return "All time (since install)"
  const labels: Record<Exclude<UsageRangeUnit, "all">, string> = {
    day: "days",
    week: "weeks",
    month: "months",
    year: "years",
  }
  return `Last ${span} ${labels[unit]}`
}

export type UsageRangeUnit = "all" | "day" | "week" | "month" | "year"

export const USAGE_RANGE_UNIT_OPTIONS: { id: UsageRangeUnit; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "day", label: "Days" },
  { id: "week", label: "Weeks" },
  { id: "month", label: "Months" },
  { id: "year", label: "Years" },
]

export const MAX_USAGE_RANGE_SPAN: Record<Exclude<UsageRangeUnit, "all">, number> = {
  day: 60,
  week: 8,
  month: 12,
  year: 5,
}

export function formatPctOrEmpty(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Not enough data"
  return `${value}%`
}
