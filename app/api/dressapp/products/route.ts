import { NextResponse } from "next/server"
import { dressappLocalDevUrlHint } from "@/lib/dressapp-local-url-hint"

export async function POST(req: Request) {
  const apiBase = process.env.DRESSAPP_API_BASE_URL?.replace(/\/$/, "")
  const secret = process.env.DRESSAPP_MERCHANT_SECRET
  if (!apiBase || !secret) {
    console.error(
      "[dressapp/products] Missing DRESSAPP_API_BASE_URL or DRESSAPP_MERCHANT_SECRET",
    )
    return NextResponse.json(
      {
        error:
          "Server missing DRESSAPP_API_BASE_URL or DRESSAPP_MERCHANT_SECRET.",
      },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  let res: Response
  let text: string
  try {
    res = await fetch(`${apiBase}/partner/v1/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    text = await res.text()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[dressapp/products] fetch failed", e)
    const hint = dressappLocalDevUrlHint(apiBase)
    return NextResponse.json(
      { error: `Could not reach DressApp at ${apiBase}: ${msg}`, ...(hint ? { hint } : {}) },
      { status: 502 },
    )
  }
  if (!res.ok) {
    console.error("[dressapp/products] DressApp API", res.status, text)
    return NextResponse.json(
      { error: text || `DressApp API error ${res.status}`, upstreamStatus: res.status },
      { status: res.status },
    )
  }

  return NextResponse.json(text ? JSON.parse(text) : {})
}
