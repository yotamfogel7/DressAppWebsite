import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { SIGNUP_TRIAL_TRYON_ALLOWANCE } from "@/lib/signup-trial"

export function SdkAccessGate() {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>SDK access requires a plan</AlertTitle>
        <AlertDescription>
          The JavaScript SDK is included with the free trial ({SIGNUP_TRIAL_TRYON_ALLOWANCE} try-ons
          all time) or Pro, Scale, and Enterprise+ plans. Starter and Growth can still use the
          Shopify app.
        </AlertDescription>
      </Alert>
      <Button asChild>
        <Link href="/plans">View plans</Link>
      </Button>
    </div>
  )
}
