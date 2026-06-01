import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { fetchMerchantUsage } from "@/lib/dressapp-monthly-usage"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  const credentials = await getUserMerchantCredentials(session.user.id)
  if (!credentials) {
    return NextResponse.json(
      { ok: false, error: "No merchant keys are saved for your account yet." },
      { status: 400 },
    )
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const result = await fetchMerchantUsage({
    secretKey: credentials.secretKey,
    dashboardPassword: credentials.merchantDashboardPassword,
    from,
    to,
  })

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status >= 400 && result.status < 600 ? result.status : 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    ...result.usage,
  })
}
