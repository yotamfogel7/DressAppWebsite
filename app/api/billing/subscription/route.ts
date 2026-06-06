import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getBillingSubscriptionSummary } from "@/lib/billing-subscription"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  try {
    const subscription = await getBillingSubscriptionSummary(session.user.id)
    return NextResponse.json({ ok: true, subscription })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[billing/subscription] GET failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
