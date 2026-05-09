import { NextResponse } from "next/server"
import { dressappLocalDevUrlHint } from "@/lib/dressapp-local-url-hint"
import { saveMerchantPublishableKey } from "@/lib/dressapp-integration-merchant-db"

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

type Body = {
  name?: string
  slug?: string
  allowed_origins?: string[]
}

/**
 * Creates a partner merchant via DressApp and stores the publishable key in Postgres
 * (`DRESSAPP_MERCHANT_KEYS_DATABASE_URL`).
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
        "[dressapp/integration/merchant-publishable-key] Missing DRESSAPP_API_BASE_URL or DRESSAPP_PARTNER_ADMIN_SECRET",
      )
      return NextResponse.json(
        {
          error:
            "Server missing DRESSAPP_API_BASE_URL or DRESSAPP_PARTNER_ADMIN_SECRET.",
        },
        { status: 500 },
      )
    }

    if (!process.env.DRESSAPP_MERCHANT_KEYS_DATABASE_URL?.trim()) {
      console.error(
        "[dressapp/integration/merchant-publishable-key] Missing DRESSAPP_MERCHANT_KEYS_DATABASE_URL",
      )
      return NextResponse.json(
        {
          error:
            "DRESSAPP_MERCHANT_KEYS_DATABASE_URL is not set. Configure Postgres to save publishable keys.",
        },
        { status: 500 },
      )
    }

    let body: Body
    try {
      body = (await req.json()) as Body
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : "DressApp integration merchant"
    const slug =
      typeof body.slug === "string" && body.slug.trim()
        ? body.slug.trim()
        : `integration-${crypto.randomUUID().slice(0, 8)}`

    const payload: Record<string, unknown> = { name, slug }
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
      console.error("[dressapp/integration/merchant-publishable-key] DressApp fetch failed", e)
      const hint = dressappLocalDevUrlHint(apiBase)
      return NextResponse.json(
        { error: `Could not reach DressApp at ${apiBase}: ${msg}`, ...(hint ? { hint } : {}) },
        { status: 502 },
      )
    }

    if (!upstream.ok) {
      console.error(
        "[dressapp/integration/merchant-publishable-key] DressApp API",
        upstream.status,
        text,
      )
      return NextResponse.json(
        {
          error: text?.trim() || `DressApp API error ${upstream.status}`,
          upstreamStatus: upstream.status,
        },
        {
          status:
            upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502,
        },
      )
    }

    let json: Record<string, unknown> = {}
    try {
      json = text ? (JSON.parse(text) as Record<string, unknown>) : {}
    } catch {
      console.error(
        "[dressapp/integration/merchant-publishable-key] Invalid JSON from API:",
        text,
      )
      return NextResponse.json(
        { error: "DressApp returned non-JSON body", raw: text },
        { status: 502 },
      )
    }

    const publishableKey =
      (json.publishable_key as string) || (json.publishableKey as string) || ""
    const secretKey =
      (json.secret_key as string) || (json.secretKey as string) || ""

    if (!publishableKey) {
      console.error(
        "[dressapp/integration/merchant-publishable-key] Missing publishable_key in response",
        json,
      )
      return NextResponse.json(
        { error: "DressApp response did not include a publishable_key." },
        { status: 502 },
      )
    }

    try {
      await saveMerchantPublishableKey({
        slug,
        merchantName: name,
        publishableKey,
      })
    } catch (dbErr) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr)
      console.error("[dressapp/integration/merchant-publishable-key] Database error", dbErr)
      return NextResponse.json(
        {
          error: `Merchant was created but saving to the database failed: ${msg}`,
          publishable_key: publishableKey,
          secret_key: secretKey || undefined,
        },
        { status: 500 },
      )
    }

    const out = {
      ...json,
      publishable_key: publishableKey,
      secret_key: secretKey || json.secret_key,
      saved_to_database: true,
      _demo: {
        envSnippet: [
          `DRESSAPP_MERCHANT_SECRET=${secretKey || "<secret_key from response>"}`,
          `DRESSAPP_PUBLISHABLE_KEY=${publishableKey}`,
          `NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY=${publishableKey}`,
        ].join("\n"),
      },
    }

    return NextResponse.json(out)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp/integration/merchant-publishable-key] unhandled", e)
    return NextResponse.json({ error: msg || "Internal server error" }, { status: 500 })
  }
}
