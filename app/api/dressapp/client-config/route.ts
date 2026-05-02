import { NextResponse } from "next/server"

/**
 * Publishable key is public by design; keeping it server-only avoids duplicating
 * NEXT_PUBLIC_* in .env. Same JSON as merchant creation returns both
 * secret_key and publishable_key.
 */
export async function GET() {
  const apiBase = (
    process.env.DRESSAPP_API_BASE_URL ||
    process.env.NEXT_PUBLIC_DRESSAPP_API_BASE_URL ||
    ""
  ).replace(/\/$/, "")

  const publishableKey =
    process.env.DRESSAPP_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY ||
    ""

  if (!apiBase || !publishableKey) {
    return NextResponse.json(
      {
        ok: false as const,
        missing: {
          apiBase: !apiBase,
          publishableKey: !publishableKey,
        },
        hint:
          "Set DRESSAPP_PUBLISHABLE_KEY (or NEXT_PUBLIC_DRESSAPP_PUBLISHABLE_KEY) to the dress_pk_… value from the same merchant-creation response as your merchant secret.",
      },
      { status: 200 },
    )
  }

  return NextResponse.json({
    ok: true as const,
    apiBase,
    publishableKey,
  })
}
