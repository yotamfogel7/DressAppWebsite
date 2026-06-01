import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { creditOnDemandWallet, fetchOnDemandWalletStatus } from "@/lib/dressapp-on-demand-wallet"
import { capturePayPalOrder } from "@/lib/paypal"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

export async function POST(request: Request) {
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

  const orderId =
    typeof body === "object" &&
    body !== null &&
    "orderId" in body &&
    typeof (body as { orderId?: unknown }).orderId === "string"
      ? (body as { orderId: string }).orderId.trim()
      : ""

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "orderId is required." }, { status: 400 })
  }

  try {
    const credentials = await getUserMerchantCredentials(session.user.id)
    if (!credentials) {
      return NextResponse.json(
        { ok: false, error: "No merchant keys are saved for your account yet." },
        { status: 400 },
      )
    }

    const capture = await capturePayPalOrder(orderId)

    const walletBefore = await fetchOnDemandWalletStatus({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })
    if (!walletBefore.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Payment captured but wallet status unavailable: ${walletBefore.error}. Contact support with capture id ${capture.captureId}.`,
          captureId: capture.captureId,
        },
        { status: 502 },
      )
    }

    const merchantId = walletBefore.wallet.merchant_id
    if (!merchantId) {
      return NextResponse.json(
        {
          ok: false,
          error: `Payment captured but merchant id is missing from wallet API. Contact support with capture id ${capture.captureId}.`,
          captureId: capture.captureId,
        },
        { status: 502 },
      )
    }

    const idempotencyKey = `paypal:${capture.captureId}`
    const credit = await creditOnDemandWallet({
      merchantId,
      amountCents: capture.amountCents,
      paypalCaptureId: capture.captureId,
      idempotencyKey,
    })

    if (!credit.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Payment captured but wallet credit failed: ${credit.error}. Contact support with capture id ${capture.captureId}.`,
          captureId: capture.captureId,
        },
        { status: credit.status >= 400 && credit.status < 600 ? credit.status : 502 },
      )
    }

    const walletAfter = await fetchOnDemandWalletStatus({
      secretKey: credentials.secretKey,
      dashboardPassword: credentials.merchantDashboardPassword,
    })

    return NextResponse.json({
      ok: true,
      captureId: capture.captureId,
      amountCents: capture.amountCents,
      balanceCents: credit.balance_cents,
      wallet: walletAfter.ok
        ? {
            enabled: walletAfter.wallet.enabled,
            monthlyBudgetCents: walletAfter.wallet.monthly_budget_cents,
            balanceCents: walletAfter.wallet.balance_cents,
            spentThisPeriodCents: walletAfter.wallet.spent_this_period_cents,
          }
        : null,
      walletRefreshError: walletAfter.ok ? null : walletAfter.error,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[billing/on-demand-tryons/capture-order] failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
