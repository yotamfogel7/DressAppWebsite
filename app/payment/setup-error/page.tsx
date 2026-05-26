import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Payment setup | DressApp",
  description: "PayPal checkout could not start.",
}

const MESSAGES: Record<string, string> = {
  missing_paypal_config:
    "PayPal is not fully configured on the server. Ask your admin to set PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and PAYPAL_ENVIRONMENT.",
  missing_plan_mapping:
    "No PayPal billing plan is mapped for that tier. Set the matching PAYPAL_PLAN_* environment variable.",
  paypal_api_error: "PayPal rejected the checkout request. Try again or contact support.",
  contact_sales:
    "Enterprise+ is sold through sales. Use the contact section on the site to reach us.",
}

export default async function PaymentSetupErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const key = code?.trim() ?? ""
  const message =
    key && MESSAGES[key]
      ? MESSAGES[key]
      : "Something went wrong starting checkout. Try again from the plans page or contact support."

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header sticky />
      <div className="mx-auto max-w-lg px-6 pb-16 pt-28 md:pt-32">
        <h1 className="text-2xl font-bold tracking-tight">Checkout unavailable</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{message}</p>
        <p className="mt-2 text-xs font-mono text-muted-foreground" role="status">
          code={key || "unknown"}
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/plans">Back to plans</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account">Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
