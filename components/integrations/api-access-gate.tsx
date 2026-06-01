import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ApiAccessGate() {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Available on Pro and above</AlertTitle>
        <AlertDescription>
          The JavaScript SDK and direct REST API are included with Pro, Scale, and Enterprise+
          plans. Starter and Growth can still use the Shopify app.
        </AlertDescription>
      </Alert>
      <Button asChild>
        <Link href="/plans">View plans</Link>
      </Button>
    </div>
  )
}
