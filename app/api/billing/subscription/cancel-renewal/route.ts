import { NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  canCancelPayPalRenewalStatus,
  getBillingSubscriptionSummary,
  getStoredPayPalSubscriptionId,
  isPayPalRenewalCancelledStatus,
  verifyPayPalSubscriptionForUser,
} from "@/lib/billing-subscription"
import { cancelPayPalSubscriptionRenewal } from "@/lib/paypal"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  try {
    const subscriptionId = await getStoredPayPalSubscriptionId(session.user.id)
    if (!subscriptionId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "We could not find a PayPal subscription on your account. Contact support to turn off renewal.",
        },
        { status: 400 },
      )
    }

    const verified = await verifyPayPalSubscriptionForUser(subscriptionId, session.user.id)
    if (!verified.ok) {
      return NextResponse.json({ ok: false, error: verified.error }, { status: 403 })
    }

    if (!canCancelPayPalRenewalStatus(verified.details.status)) {
      return NextResponse.json(
        { ok: false, error: "Renewal is already turned off for this subscription." },
        { status: 409 },
      )
    }

    try {
      await cancelPayPalSubscriptionRenewal(
        subscriptionId,
        "Customer turned off renewal from DressApp billing settings",
      )
    } catch (e) {
      const verifiedAfter = await verifyPayPalSubscriptionForUser(subscriptionId, session.user.id)
      if (verifiedAfter.ok && isPayPalRenewalCancelledStatus(verifiedAfter.details.status)) {
        const updated = await getBillingSubscriptionSummary(session.user.id)
        return NextResponse.json({ ok: true, subscription: updated })
      }
      throw e
    }

    const updated = await getBillingSubscriptionSummary(session.user.id)
    return NextResponse.json({ ok: true, subscription: updated })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[billing/subscription/cancel-renewal] POST failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 502 })
  }
}
