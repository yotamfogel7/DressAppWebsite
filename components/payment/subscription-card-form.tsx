"use client"

import {
  PayPalCVVField,
  PayPalCardFieldsProvider,
  PayPalExpiryField,
  PayPalNameField,
  PayPalNumberField,
  usePayPalCardFields,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js"
import type { PayPalCardFieldsComponentOptions } from "@paypal/paypal-js"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type SubscriptionCardFormProps = {
  paypalPlanId: string
  userId: string
  returnUrl: string
  cancelUrl: string
  onSuccess: (subscriptionId: string) => void
  onError: (message: string) => void
  disabled?: boolean
}

type CardFieldsApproveData = { orderID?: string; subscriptionID?: string }

const fieldClassName =
  "min-h-11 rounded-lg border border-input bg-background px-3 py-2 shadow-xs"

function CardFieldShell({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div id={id} className={fieldClassName}>
        {children}
      </div>
    </div>
  )
}

function SubscribeWithCardButton({
  busy,
  onBusy,
  onError,
}: {
  busy: boolean
  onBusy: (value: boolean) => void
  onError: (message: string) => void
}) {
  const { cardFieldsForm } = usePayPalCardFields()

  async function handleSubmit() {
    if (!cardFieldsForm) {
      onError(
        "Card form is still loading. Wait a moment, or enable Advanced Credit and Debit Card Payments in your PayPal app.",
      )
      return
    }

    onBusy(true)
    try {
      const state = await cardFieldsForm.getState()
      if (!state.isFormValid) {
        onError("Enter valid card details before subscribing.")
        return
      }
      await cardFieldsForm.submit()
    } catch (error) {
      console.error("[subscription-card-form] submit:", error)
      onError(
        error instanceof Error
          ? error.message
          : "Could not process your card. Check the details and try again.",
      )
    } finally {
      onBusy(false)
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      className="mt-6 w-full"
      disabled={busy || !cardFieldsForm}
      onClick={() => void handleSubmit()}
    >
      {busy ? "Processing..." : "Subscribe with card"}
    </Button>
  )
}

export function SubscriptionCardForm({
  paypalPlanId,
  userId,
  returnUrl,
  cancelUrl,
  onSuccess,
  onError,
  disabled = false,
}: SubscriptionCardFormProps) {
  const [busy, setBusy] = useState(false)
  const [fieldsReady, setFieldsReady] = useState(false)

  const createSubscription = useCallback<
    NonNullable<PayPalButtonsComponentProps["createSubscription"]>
  >(
    (_data, actions) =>
      actions.subscription.create({
        plan_id: paypalPlanId,
        custom_id: `user:${userId}`,
        application_context: {
          brand_name: "DressApp",
          locale: "en-US",
          user_action: "SUBSCRIBE_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    [cancelUrl, paypalPlanId, returnUrl, userId],
  )

  const onApprove = useCallback(
    (data: CardFieldsApproveData) => {
      const subscriptionId =
        (typeof data.subscriptionID === "string" && data.subscriptionID.trim()) ||
        (typeof data.orderID === "string" && data.orderID.trim()) ||
        ""
      if (!subscriptionId) {
        onError("PayPal did not return a subscription id after card checkout.")
        return
      }
      onSuccess(subscriptionId)
    },
    [onError, onSuccess],
  )

  const handlePayPalError = useCallback(
    (error: unknown) => {
      setBusy(false)
      console.error("[subscription-card-form] PayPal error:", error)
      onError(
        error instanceof Error
          ? error.message
          : "Card checkout failed. Confirm Advanced Card Payments is enabled in PayPal.",
      )
    },
    [onError],
  )

  const providerOptions = {
    createSubscription,
    onApprove,
    onError: handlePayPalError,
    onCancel: () => setBusy(false),
    style: {
      input: {
        "font-size": "16px",
        "font-family": "inherit",
        color: "inherit",
      },
      ".invalid": {
        color: "#b91c1c",
      },
    },
    inputEvents: {
      onFocus: () => setFieldsReady(true),
    },
  } as unknown as PayPalCardFieldsComponentOptions

  return (
    <div className={cn(disabled && "pointer-events-none opacity-60")}>
      <PayPalCardFieldsProvider {...providerOptions}>
        <div
          className={cn(
            "space-y-4",
            !fieldsReady && "min-h-[220px] animate-pulse rounded-lg bg-muted/30",
          )}
        >
          <CardFieldShell id="card-name" label="Name on card">
            <PayPalNameField placeholder="Jane Doe" />
          </CardFieldShell>

          <CardFieldShell id="card-number" label="Card number">
            <PayPalNumberField
              placeholder="1234 5678 9012 3456"
              inputEvents={{ onFocus: () => setFieldsReady(true) }}
            />
          </CardFieldShell>

          <div className="grid gap-4 sm:grid-cols-2">
            <CardFieldShell id="card-expiry" label="Expiry">
              <PayPalExpiryField placeholder="MM / YY" />
            </CardFieldShell>
            <CardFieldShell id="card-cvv" label="Security code">
              <PayPalCVVField placeholder="CVV" />
            </CardFieldShell>
          </div>
        </div>

        <SubscribeWithCardButton
          busy={busy}
          onBusy={setBusy}
          onError={onError}
        />
      </PayPalCardFieldsProvider>

      <p className="mt-3 text-xs text-muted-foreground">
        Card fields come from PayPal&apos;s JavaScript SDK (already enabled on
        your app). If fields stay blank, confirm your sandbox business account
        is fully set up at sandbox.paypal.com, then retry. PayPal can take a
        few minutes after app changes.
      </p>
    </div>
  )
}
