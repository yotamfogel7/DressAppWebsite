"use client"

import {
  FUNDING,
  PayPalButtons,
  PayPalScriptProvider,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Lock, ShieldCheck } from "lucide-react"
import { Header } from "@/components/landing/header"
import { SubscriptionCardForm } from "@/components/payment/subscription-card-form"
import { Button } from "@/components/ui/button"
import type { PlanCheckoutConfig } from "@/lib/paypal-public"
import { markFreshPlanPurchase } from "@/lib/payment-success"
import { PRICING_PLANS } from "@/lib/pricing-plans"
import { cn } from "@/lib/utils"

type PlanCheckoutProps = {
  config: PlanCheckoutConfig
}

type PayPalError = {
  message?: string
}

function parsePayPalError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as PayPalError).message === "string"
  ) {
    return (error as PayPalError).message!
  }
  return "Payment could not start. Try again or pick another method."
}

const walletButtonStyle: PayPalButtonsComponentProps["style"] = {
  layout: "vertical",
  shape: "rect",
  label: "subscribe",
  height: 48,
}

type WalletButtonProps = {
  fundingSource: (typeof FUNDING)[keyof typeof FUNDING]
  label: string
  createSubscription: NonNullable<
    PayPalButtonsComponentProps["createSubscription"]
  >
  onApprove: NonNullable<PayPalButtonsComponentProps["onApprove"]>
  onCancel: NonNullable<PayPalButtonsComponentProps["onCancel"]>
  onError: NonNullable<PayPalButtonsComponentProps["onError"]>
  busy: boolean
}

function WalletButton({
  fundingSource,
  label,
  createSubscription,
  onApprove,
  onCancel,
  onError,
  busy,
}: WalletButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const timer = window.setTimeout(() => {
      const hasButton = node.querySelector("iframe, paypal-button")
      if (!hasButton) setVisible(false)
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="space-y-1">
      <p className="sr-only">{label}</p>
      <div
        ref={containerRef}
        className={cn(
          "min-h-12 w-full",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <PayPalButtons
          fundingSource={fundingSource}
          style={walletButtonStyle}
          createSubscription={createSubscription}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onError}
        />
      </div>
    </div>
  )
}

export function PlanCheckout({ config }: PlanCheckoutProps) {
  const plan =
    PRICING_PLANS.find((p) => p.slug === config.slug) ?? PRICING_PLANS[0]
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const redirectToSuccess = useCallback(
    (subscriptionId: string) => {
      markFreshPlanPurchase()
      const params = new URLSearchParams({ plan: config.slug })
      if (subscriptionId) params.set("subscription_id", subscriptionId)
      window.location.assign(`/payment/success?${params.toString()}`)
    },
    [config.slug],
  )

  const createSubscription: NonNullable<
    PayPalButtonsComponentProps["createSubscription"]
  > = useCallback(
    (_data, actions) => {
      setCheckoutError(null)
      setBusy(true)
      return actions.subscription.create({
        plan_id: config.paypalPlanId,
        custom_id: `user:${config.userId}`,
        application_context: {
          brand_name: "DressApp",
          locale: "en-US",
          user_action: "SUBSCRIBE_NOW",
          return_url: config.returnUrl,
          cancel_url: config.cancelUrl,
        },
      })
    },
    [config.cancelUrl, config.paypalPlanId, config.returnUrl, config.userId],
  )

  const onApprove: NonNullable<PayPalButtonsComponentProps["onApprove"]> =
    useCallback(
      async (data) => {
        const subscriptionId =
          typeof data.subscriptionID === "string"
            ? data.subscriptionID.trim()
            : ""
        redirectToSuccess(subscriptionId)
      },
      [redirectToSuccess],
    )

  const onCancel = useCallback(() => {
    setBusy(false)
    setCheckoutError(null)
  }, [])

  const onError = useCallback((error: unknown) => {
    setBusy(false)
    const message = parsePayPalError(error)
    console.error("[plan-checkout] PayPal error:", error)
    setCheckoutError(message)
  }, [])

  const scriptOptions = {
    clientId: config.clientId,
    vault: true,
    intent: "subscription" as const,
    currency: "USD",
    components: "card-fields,buttons,applepay",
    enableFunding: "paypal,applepay",
    dataPageType: "checkout",
  }

  const walletButtonProps = {
    busy,
    createSubscription,
    onApprove,
    onCancel,
    onError,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-28 md:pt-32">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Secure checkout
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Complete your subscription
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Enter your card below, or use PayPal or Apple Pay from the order
            summary.
          </p>
        </div>

        {checkoutError ? (
          <p
            className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {checkoutError}
          </p>
        ) : null}

        <PayPalScriptProvider options={scriptOptions}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
              <h2 className="text-lg font-semibold">Debit or credit card</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Processed by PayPal. Your card details never touch DressApp
                servers.
              </p>

              <div className="mt-6">
                <SubscriptionCardForm
                  paypalPlanId={config.paypalPlanId}
                  userId={config.userId}
                  returnUrl={config.returnUrl}
                  cancelUrl={config.cancelUrl}
                  disabled={busy}
                  onSuccess={redirectToSuccess}
                  onError={(message) => {
                    setBusy(false)
                    setCheckoutError(message)
                  }}
                />
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5 shrink-0" aria-hidden />
                <span>
                  256-bit encryption. Cancel anytime from your PayPal account.
                </span>
              </div>
            </section>

            <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-28">
              <p className="text-sm font-medium text-muted-foreground">
                Order summary
              </p>
              <h2 className="mt-1 text-2xl font-bold">{plan.name}</h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {plan.price}
                </span>
                {plan.priceSuffix ? (
                  <span className="text-sm text-muted-foreground">
                    {plan.priceSuffix}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-3 text-xs text-muted-foreground">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <span>
                  Billed monthly through PayPal. You can update or cancel from
                  account settings after checkout.
                </span>
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-6">
                <p className="text-sm font-medium">Or pay with</p>
                <WalletButton
                  fundingSource={FUNDING.PAYPAL}
                  label="PayPal"
                  {...walletButtonProps}
                />
                <WalletButton
                  fundingSource={FUNDING.APPLEPAY}
                  label="Apple Pay"
                  {...walletButtonProps}
                />
              </div>

              <Button variant="ghost" className="mt-6 w-full" asChild>
                <Link href="/plans">Choose a different plan</Link>
              </Button>
            </aside>
          </div>
        </PayPalScriptProvider>
      </div>
    </div>
  )
}
