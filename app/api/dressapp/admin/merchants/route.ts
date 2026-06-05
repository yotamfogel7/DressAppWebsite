import { NextResponse } from "next/server"
import { dressappLocalDevUrlHint } from "@/lib/dressapp-local-url-hint"
import { randomMerchantDashboardPassword } from "@/lib/dressapp-http-basic"
import { normalizeMerchantEmail } from "@/lib/dressapp-merchant-email"
import { formatPartnerMerchantCreationErrorBody } from "@/lib/dressapp-partner-api-errors"
import { persistMerchantKeysForSession } from "@/lib/persist-merchant-keys-for-session"

/** Trim and strip optional surrounding quotes from .env values. */
function readEnvSecret(raw: string | undefined): string {
  if (raw == null) return ""
  let t = raw.trim()
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim()
  }
  return t
}

function registrationGateOpen() {
  return (
    process.env.DRESSAPP_ENABLE_MERCHANT_REGISTRATION === "true" ||
    process.env.NODE_ENV === "development"
  )
}

/** Whether the demo can call partner admin (env present). */
export async function GET() {
  const registerEndpointEnabled = registrationGateOpen()
  const apiBase = Boolean(process.env.DRESSAPP_API_BASE_URL?.trim())
  const partnerRaw = process.env.DRESSAPP_PARTNER_ADMIN_SECRET
  const partnerAdminSecret = Boolean(readEnvSecret(partnerRaw))
  const ready = registerEndpointEnabled && apiBase && partnerAdminSecret

  const dev =
    process.env.NODE_ENV === "development"
      ? {
          partnerAdminSecretLength: readEnvSecret(partnerRaw).length,
          partnerAdminLinePresent: partnerRaw !== undefined,
        }
      : undefined

  return NextResponse.json({
    registerEndpointEnabled,
    ready,
    missing: {
      apiBase: !apiBase,
      partnerAdminSecret: !partnerAdminSecret,
    },
    dev,
    hint:
      partnerRaw !== undefined && !readEnvSecret(partnerRaw)
        ? "DRESSAPP_PARTNER_ADMIN_SECRET is set but empty. In .env.local, put the secret on the same line after =, or remove the line so another .env file can supply it."
        : !partnerRaw
          ? "DRESSAPP_PARTNER_ADMIN_SECRET is unset. Add it to .env.local and restart next dev."
          : undefined,
  })
}

type CreateMerchantBody = {
  name?: string
  slug?: string
  email?: string
  allowed_origins?: string[]
}

/**
 * POST /partner/v1/admin/merchants - requires X-Partner-Admin-Secret on DressApp API.
 * Gated in production unless DRESSAPP_ENABLE_MERCHANT_REGISTRATION=true.
 */
export async function POST(req: Request) {
  try {
    if (!registrationGateOpen()) {
      return NextResponse.json(
        {
          error:
            "Merchant registration is disabled. Run Next in development or set DRESSAPP_ENABLE_MERCHANT_REGISTRATION=true.",
        },
        { status: 403 },
      )
    }

    const apiBase = process.env.DRESSAPP_API_BASE_URL?.replace(/\/$/, "")
    const partnerSecret = readEnvSecret(process.env.DRESSAPP_PARTNER_ADMIN_SECRET)
    if (!apiBase || !partnerSecret) {
      console.error(
        "[dressapp/admin/merchants] Missing DRESSAPP_API_BASE_URL or DRESSAPP_PARTNER_ADMIN_SECRET",
      )
      return NextResponse.json(
        {
          error:
            "Server missing DRESSAPP_API_BASE_URL or DRESSAPP_PARTNER_ADMIN_SECRET.",
        },
        { status: 500 },
      )
    }

    let body: CreateMerchantBody
    try {
      body = (await req.json()) as CreateMerchantBody
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const slug = typeof body.slug === "string" ? body.slug.trim() : ""
    const email = normalizeMerchantEmail(typeof body.email === "string" ? body.email : "")
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Fields name and slug are required." },
        { status: 400 },
      )
    }
    if (!email) {
      return NextResponse.json(
        { error: "Field email is required and must be a valid email address." },
        { status: 400 },
      )
    }

    const password = randomMerchantDashboardPassword()
    const payload: Record<string, unknown> = { name, slug, password, email }
    if (Array.isArray(body.allowed_origins) && body.allowed_origins.length > 0) {
      const origins = body.allowed_origins
        .map((o) => (typeof o === "string" ? o.trim() : ""))
        .filter(Boolean)
      if (origins.length) payload.allowed_origins = origins
    }

    let upstream: Response
    let text: string
    try {
      upstream = await fetch(`${apiBase}/partner/v1/admin/merchants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Partner-Admin-Secret": partnerSecret,
        },
        body: JSON.stringify(payload),
      })
      text = await upstream.text()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[dressapp/admin/merchants] fetch to DressApp failed", e)
      const hint = dressappLocalDevUrlHint(apiBase)
      return NextResponse.json(
        {
          error: `Could not reach DressApp at ${apiBase}: ${msg}`,
          ...(hint ? { hint } : {}),
        },
        { status: 502 },
      )
    }

    if (!upstream.ok) {
      console.error(
        "[dressapp/admin/merchants] DressApp API",
        upstream.status,
        text,
      )
      return NextResponse.json(
        {
          error: formatPartnerMerchantCreationErrorBody(text, upstream.status),
          upstreamStatus: upstream.status,
        },
        { status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502 },
      )
    }

    let json: Record<string, unknown> = {}
    try {
      json = text ? (JSON.parse(text) as Record<string, unknown>) : {}
    } catch {
      console.error("[dressapp/admin/merchants] Invalid JSON from API:", text)
      return NextResponse.json(
        { error: "DressApp returned non-JSON body", raw: text },
        { status: 502 },
      )
    }

    const publishableKey =
      (json.publishable_key as string) || (json.publishableKey as string) || ""
    const secretKey =
      (json.secret_key as string) || (json.secretKey as string) || ""

    if (secretKey && publishableKey) {
      await persistMerchantKeysForSession({
        secretKey,
        publishableKey,
        merchantSlug: slug,
        merchantDashboardPassword: password,
      })
    }

    const out = {
      ...json,
      publishable_key: publishableKey || json.publishable_key,
      secret_key: secretKey || json.secret_key,
      _demo: {
        envSnippet: [
          `DRESSAPP_MERCHANT_SECRET=${secretKey || "<secret_key from response>"}`,
          `DRESSAPP_PUBLISHABLE_KEY=${publishableKey || "<publishable_key from response>"}`,
          `NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY=${publishableKey || "<optional duplicate>"}`,
        ].join("\n"),
      },
    }

    try {
      return NextResponse.json(out)
    } catch (serializeErr) {
      console.error("[dressapp/admin/merchants] JSON stringify failed", serializeErr)
      return NextResponse.json(
        {
          error: "Response could not be serialized",
          publishable_key: publishableKey,
          secret_key: secretKey,
        },
        { status: 500 },
      )
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp/admin/merchants] unhandled", e)
    return NextResponse.json({ error: msg || "Internal server error" }, { status: 500 })
  }
}
