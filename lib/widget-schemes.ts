import type { PlanSlug } from "@/lib/plan-slugs"

export const WIDGET_SCHEMES = ["default_dark", "soft_light", "dawn_light"] as const
export type WidgetScheme = (typeof WIDGET_SCHEMES)[number]
export const WIDGET_SCHEME_DEFAULT: WidgetScheme = "default_dark"

export const STOREFRONT_DOCK_SCHEMES: {
  id: WidgetScheme
  title: string
  subtitle: string
}[] = [
  {
    id: "default_dark",
    title: "DressApp night",
    subtitle: "Teal accents on a deep panel - the default DressApp look.",
  },
  {
    id: "soft_light",
    title: "Soft day",
    subtitle: "Light chrome that stays readable on bright storefronts.",
  },
  {
    id: "dawn_light",
    title: "Dawn",
    subtitle: "Warm paper tones for editorial or lifestyle brands.",
  },
]

/** Compact storefront dock preview (matches `@dressapp/react-widget` embed themes). */
export type WidgetDockPreviewTheme = {
  storefrontBg: string
  panel: {
    background: string
    border: string
    color: string
    boxShadow: string
  }
  headerBorder: string
  tabTrack: { background: string; border: string }
  tabPill: { background: string; boxShadow: string }
  tabSelected: string
  tabIdle: string
  kicker: string
  lead: string
  btnPrimary: {
    background: string
    border: string
    color: string
    boxShadow: string
  }
  thumbBorder: string
  fab: {
    background: string
    border: string
    color: string
    boxShadow: string
  }
}

export const WIDGET_DOCK_PREVIEW: Record<WidgetScheme, WidgetDockPreviewTheme> = {
  default_dark: {
    storefrontBg: "linear-gradient(160deg, #e8eaef 0%, #d4d8e2 55%, #c5cad6 100%)",
    panel: {
      background: "oklch(0.14 0.03 235)",
      border: "1px solid oklch(0.5 0.06 200 / 0.32)",
      color: "oklch(0.9 0.02 220)",
      boxShadow: "0 0 0 1px oklch(0.52 0.1 200 / 0.07), 0 12px 32px rgba(0,0,0,0.35)",
    },
    headerBorder: "oklch(0.45 0.05 200 / 0.22)",
    tabTrack: {
      background: "oklch(0.09 0.02 240)",
      border: "1px solid oklch(0.45 0.05 200 / 0.22)",
    },
    tabPill: {
      background: "oklch(0.2 0.04 235)",
      boxShadow: "0 0 0 1px oklch(0.55 0.1 200 / 0.28), 0 2px 8px rgba(0,0,0,0.3)",
    },
    tabSelected: "oklch(0.93 0.02 220)",
    tabIdle: "oklch(0.55 0.04 210)",
    kicker: "oklch(0.65 0.04 210)",
    lead: "oklch(0.88 0.03 220)",
    btnPrimary: {
      background: "oklch(0.38 0.1 198)",
      border: "1px solid oklch(0.55 0.1 200 / 0.35)",
      color: "oklch(0.97 0.02 220)",
      boxShadow: "0 0 12px oklch(0.55 0.12 200 / 0.15)",
    },
    thumbBorder: "rgba(58,220,235,0.48)",
    fab: {
      background: "#0a0f14",
      border: "1px solid rgba(58,220,235,0.38)",
      color: "oklch(0.95 0.02 220)",
      boxShadow:
        "0 0 0 2px rgba(58,220,235,0.2), 0 0 20px rgba(42,200,218,0.2), 0 10px 28px rgba(0,0,0,0.45)",
    },
  },
  soft_light: {
    storefrontBg: "linear-gradient(160deg, #f6f7fa 0%, #eceef4 55%, #e2e5ee 100%)",
    panel: {
      background: "oklch(0.993 0.002 264)",
      border: "1px solid rgba(44, 52, 87, 0.14)",
      color: "#2c3457",
      boxShadow: "0 0 0 1px rgba(44, 52, 87, 0.06), 0 16px 36px rgba(44, 52, 87, 0.1)",
    },
    headerBorder: "rgba(44, 52, 87, 0.12)",
    tabTrack: {
      background: "oklch(0.965 0.006 264)",
      border: "1px solid rgba(44, 52, 87, 0.1)",
    },
    tabPill: {
      background: "oklch(0.993 0.002 264)",
      boxShadow: "0 0 0 1px rgba(44, 52, 87, 0.12), 0 2px 8px rgba(44, 52, 87, 0.08)",
    },
    tabSelected: "#2c3457",
    tabIdle: "rgba(44, 52, 87, 0.55)",
    kicker: "rgba(44, 52, 87, 0.55)",
    lead: "#2c3457",
    btnPrimary: {
      background: "rgba(44, 52, 87, 0.1)",
      border: "1px solid rgba(44, 52, 87, 0.22)",
      color: "#2c3457",
      boxShadow: "0 1px 0 rgba(255,255,255,0.55) inset, 0 2px 10px rgba(44, 52, 87, 0.08)",
    },
    thumbBorder: "rgba(44, 52, 87, 0.34)",
    fab: {
      background: "oklch(0.993 0.002 264)",
      border: "1px solid rgba(44, 52, 87, 0.28)",
      color: "#2c3457",
      boxShadow:
        "0 0 0 2px rgba(44, 52, 87, 0.08), 0 0 16px rgba(44, 52, 87, 0.1), 0 10px 24px rgba(44, 52, 87, 0.1)",
    },
  },
  dawn_light: {
    storefrontBg: "linear-gradient(160deg, #f8f2ea 0%, #efe4d8 55%, #e5d6c8 100%)",
    panel: {
      background: "#faf5ef",
      border: "1px solid rgba(160,120,88,0.28)",
      color: "#2a2218",
      boxShadow: "0 0 0 1px rgba(160,120,88,0.1), 0 16px 36px rgba(60,40,20,0.1)",
    },
    headerBorder: "rgba(160,120,88,0.22)",
    tabTrack: {
      background: "#f0e6dc",
      border: "1px solid rgba(160,120,88,0.2)",
    },
    tabPill: {
      background: "#fffaf5",
      boxShadow: "0 0 0 1px rgba(180,130,90,0.2), 0 2px 8px rgba(80,50,20,0.08)",
    },
    tabSelected: "#4a220f",
    tabIdle: "#6a5648",
    kicker: "#6a5648",
    lead: "#2a2218",
    btnPrimary: {
      background: "#f0d4c4",
      border: "1px solid rgba(170,95,55,0.42)",
      color: "#4a220f",
      boxShadow: "0 1px 0 rgba(255,252,248,0.6) inset, 0 2px 10px rgba(170,95,55,0.15)",
    },
    thumbBorder: "rgba(170,95,55,0.35)",
    fab: {
      background: "#f4e9df",
      border: "1px solid rgba(180,110,70,0.45)",
      color: "#5c3018",
      boxShadow:
        "0 0 0 2px rgba(180,110,70,0.15), 0 0 16px rgba(180,110,70,0.18), 0 10px 24px rgba(80,40,10,0.1)",
    },
  },
}

export const SCHEME_PREVIEW: Record<
  WidgetScheme,
  { panel: string; chrome: string; accent: string }
> = {
  default_dark: {
    panel: "oklch(0.14 0.03 235)",
    chrome: "oklch(0.09 0.02 240)",
    accent: "rgb(58, 220, 235)",
  },
  soft_light: {
    panel: "oklch(0.993 0.002 264)",
    chrome: "oklch(0.965 0.006 264)",
    accent: "#2c3457",
  },
  dawn_light: {
    panel: "#faf5ef",
    chrome: "#f0e6dc",
    accent: "rgb(180, 110, 70)",
  },
}

const CUSTOMIZATION_PLANS = new Set<PlanSlug>([
  "growth",
  "pro",
  "enterprise",
  "enterprise-plus",
])

export function normalizeWidgetScheme(raw: string | null | undefined): WidgetScheme {
  const s = (raw ?? "").trim()
  return (WIDGET_SCHEMES as readonly string[]).includes(s)
    ? (s as WidgetScheme)
    : WIDGET_SCHEME_DEFAULT
}

export function widgetSchemeCustomizationAllowed(planSlug: PlanSlug | null): boolean {
  if (!planSlug) return false
  if (planSlug === "starter") return false
  return CUSTOMIZATION_PLANS.has(planSlug)
}
