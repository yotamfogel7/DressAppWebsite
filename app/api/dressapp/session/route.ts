import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { dressappLocalDevUrlHint } from "@/lib/dressapp-local-url-hint"

export async function POST(req: Request) {
  const apiBase = process.env.DRESSAPP_API_BASE_URL?.replace(/\/$/, "")
  const secret = process.env.DRESSAPP_MERCHANT_SECRET
  if (!apiBase || !secret) {
    console.error(
      "[dressapp/session] Missing DRESSAPP_API_BASE_URL or DRESSAPP_MERCHANT_SECRET",
    )
    return NextResponse.json(
      {
        error:
          "Server missing DRESSAPP_API_BASE_URL or DRESSAPP_MERCHANT_SECRET. Create a merchant (partner admin) and set the merchant secret_key — not the partner admin secret.",
      },
      { status: 500 },
    )
  }

  let body: { external_user_ref?: string } = {}
  try {
    body = (await req.json()) as { external_user_ref?: string }
  } catch {
    body = {}
  }

  const external_user_ref = body.external_user_ref ?? `anon_${randomUUID()}`

  let res: Response
  let text: string
  try {
    res = await fetch(`${apiBase}/partner/v1/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ external_user_ref }),
    })
    text = await res.text()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp/session] fetch failed", e)
    const hint = dressappLocalDevUrlHint(apiBase)
    return NextResponse.json(
      { error: `Could not reach DressApp at ${apiBase}: ${msg}`, ...(hint ? { hint } : {}) },
      { status: 502 },
    )
  }
  if (!res.ok) {
    console.error("[dressapp/session] DressApp API", res.status, text)
    return NextResponse.json(
      { error: text || `DressApp API error ${res.status}`, upstreamStatus: res.status },
      { status: res.status },
    )
  }

  const json = text ? (JSON.parse(text) as { access_token?: string }) : {}
  if (!json.access_token) {
    console.error("[dressapp/session] No access_token in response:", text)
    return NextResponse.json(
      { error: "DressApp session response missing access_token", raw: text },
      { status: 502 },
    )
  }

  return NextResponse.json({
    access_token: json.access_token,
    external_user_ref,
  })
}
