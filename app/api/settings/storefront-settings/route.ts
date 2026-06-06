import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserPreferences, updateUserPreferences } from "@/lib/auth-db"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"
import { getDressAppMerchantApiBase } from "@/lib/dressapp-api-base"

const PREF_KEYS = {
  language: "dressapp_widget_language",
  allowOosTryon: "dressapp_allow_out_of_stock_tryon",
  pdpTryonButton: "dressapp_pdp_tryon_button_enabled",
} as const

export type WidgetLanguage = "en" | "he"
const VALID_LANGUAGES: WidgetLanguage[] = ["en", "he"]

function normalizeLanguage(raw: unknown): WidgetLanguage {
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase()
    if (v === "he" || v === "he-il" || v === "hebrew") return "he"
    if (v === "en") return "en"
  }
  return "en"
}

async function syncToBackend(
  secretKey: string,
  patch: {
    widget_language?: WidgetLanguage
    allow_out_of_stock_tryon?: boolean
    pdp_tryon_button_enabled?: boolean
  },
): Promise<void> {
  const apiBase = getDressAppMerchantApiBase()
  const res = await fetch(`${apiBase}/partner/v1/merchants/me/storefront-settings`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("[settings/storefront-settings] backend sync failed", res.status, text)
    throw new Error(`DressApp backend sync failed (${res.status}): ${text}`)
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  try {
    const prefs = await getUserPreferences(session.user.id)
    return NextResponse.json({
      ok: true,
      widget_language: normalizeLanguage(prefs[PREF_KEYS.language]),
      allow_out_of_stock_tryon: Boolean(prefs[PREF_KEYS.allowOosTryon]),
      pdp_tryon_button_enabled:
        PREF_KEYS.pdpTryonButton in prefs ? Boolean(prefs[PREF_KEYS.pdpTryonButton]) : true,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[settings/storefront-settings] GET failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 })
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ ok: false, error: "Expected a JSON object." }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const prefPatch: Record<string, unknown> = {}
  const backendPatch: {
    widget_language?: WidgetLanguage
    allow_out_of_stock_tryon?: boolean
    pdp_tryon_button_enabled?: boolean
  } = {}

  if ("widget_language" in b) {
    if (typeof b.widget_language !== "string" || !VALID_LANGUAGES.includes(b.widget_language as WidgetLanguage)) {
      return NextResponse.json(
        { ok: false, error: "widget_language must be 'en' or 'he'." },
        { status: 400 },
      )
    }
    const lang = b.widget_language as WidgetLanguage
    prefPatch[PREF_KEYS.language] = lang
    backendPatch.widget_language = lang
  }

  if ("allow_out_of_stock_tryon" in b) {
    if (typeof b.allow_out_of_stock_tryon !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "allow_out_of_stock_tryon must be a boolean." },
        { status: 400 },
      )
    }
    prefPatch[PREF_KEYS.allowOosTryon] = b.allow_out_of_stock_tryon
    backendPatch.allow_out_of_stock_tryon = b.allow_out_of_stock_tryon
  }

  if ("pdp_tryon_button_enabled" in b) {
    if (typeof b.pdp_tryon_button_enabled !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "pdp_tryon_button_enabled must be a boolean." },
        { status: 400 },
      )
    }
    prefPatch[PREF_KEYS.pdpTryonButton] = b.pdp_tryon_button_enabled
    backendPatch.pdp_tryon_button_enabled = b.pdp_tryon_button_enabled
  }

  if (Object.keys(prefPatch).length === 0) {
    return NextResponse.json({ ok: false, error: "No valid fields to update." }, { status: 400 })
  }

  try {
    await updateUserPreferences(session.user.id, prefPatch)

    const creds = await getUserMerchantCredentials(session.user.id)
    if (creds?.secretKey) {
      try {
        await syncToBackend(creds.secretKey, backendPatch)
      } catch (e) {
        console.error("[settings/storefront-settings] backend sync error (non-fatal)", e)
      }
    }

    const prefs = await getUserPreferences(session.user.id)
    return NextResponse.json({
      ok: true,
      widget_language: normalizeLanguage(prefs[PREF_KEYS.language]),
      allow_out_of_stock_tryon: Boolean(prefs[PREF_KEYS.allowOosTryon]),
      pdp_tryon_button_enabled:
        PREF_KEYS.pdpTryonButton in prefs ? Boolean(prefs[PREF_KEYS.pdpTryonButton]) : true,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[settings/storefront-settings] PATCH failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
