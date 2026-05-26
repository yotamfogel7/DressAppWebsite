import type { PlanSlug } from "@/lib/plan-slugs"

/** Public PayPal client id (safe to pass to the browser). */
export function getPayPalClientId(): string | null {
  return (
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ||
    process.env.PAYPAL_CLIENT_ID?.trim() ||
    null
  )
}

export function getPayPalSdkEnvironment(): "sandbox" | "production" {
  const env = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase()
  if (env === "live" || env === "production") return "production"
  return "sandbox"
}

export type PlanCheckoutConfig = {
  slug: PlanSlug
  paypalPlanId: string
  clientId: string
  sdkEnvironment: "sandbox" | "production"
  userId: string
  returnUrl: string
  cancelUrl: string
}
