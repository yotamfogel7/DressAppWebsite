import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserPreferences, getUserSelectedPlan, updateUserPreferences } from "@/lib/auth-db"
import { normalizePlanSlug } from "@/lib/plan-slugs"
import {
  normalizeWidgetScheme,
  widgetSchemeCustomizationAllowed,
  WIDGET_SCHEMES,
  type WidgetScheme,
} from "@/lib/widget-schemes"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"
import { getDressAppMerchantApiBase } from "@/lib/dressapp-api-base"

const PREF_KEY = "dressapp_widget_scheme"

async function syncSchemeToBackend(secretKey: string, scheme: WidgetScheme): Promise<void> {
  const apiBase = getDressAppMerchantApiBase()
  const res = await fetch(`${apiBase}/partner/v1/merchants/me/storefront-settings`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ widget_scheme: scheme }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("[settings/widget-appearance] backend sync failed", res.status, text)
    throw new Error(`DressApp backend sync failed (${res.status}): ${text}`)
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  try {
    const planRaw = await getUserSelectedPlan(session.user.id)
    const planSlug = normalizePlanSlug(planRaw)
    const prefs = await getUserPreferences(session.user.id)
    const scheme = normalizeWidgetScheme(
      typeof prefs[PREF_KEY] === "string" ? prefs[PREF_KEY] : null,
    )

    return NextResponse.json({
      ok: true,
      scheme,
      customizationAllowed: widgetSchemeCustomizationAllowed(planSlug),
      planSlug,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[settings/widget-appearance] GET failed", e)
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

  const rawScheme =
    typeof body === "object" &&
    body !== null &&
    "scheme" in body &&
    typeof (body as { scheme?: unknown }).scheme === "string"
      ? (body as { scheme: string }).scheme.trim()
      : ""

  if (!(WIDGET_SCHEMES as readonly string[]).includes(rawScheme)) {
    return NextResponse.json({ ok: false, error: "Invalid widget color scheme." }, { status: 400 })
  }

  const scheme = rawScheme as WidgetScheme

  try {
    const planRaw = await getUserSelectedPlan(session.user.id)
    const planSlug = normalizePlanSlug(planRaw)
    if (!widgetSchemeCustomizationAllowed(planSlug)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Widget color customization requires Growth plan or higher.",
        },
        { status: 403 },
      )
    }

    await updateUserPreferences(session.user.id, { [PREF_KEY]: scheme })

    const creds = await getUserMerchantCredentials(session.user.id)
    if (creds?.secretKey) {
      try {
        await syncSchemeToBackend(creds.secretKey, scheme)
      } catch (e) {
        console.error("[settings/widget-appearance] backend sync error (non-fatal)", e)
      }
    }

    return NextResponse.json({
      ok: true,
      scheme,
      customizationAllowed: true,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[settings/widget-appearance] PATCH failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
