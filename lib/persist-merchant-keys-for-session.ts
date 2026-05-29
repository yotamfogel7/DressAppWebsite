import { auth } from "@/auth"
import { saveUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"

export async function persistMerchantKeysForSession(params: {
  secretKey: string
  publishableKey: string
  merchantSlug?: string | null
  merchantDashboardPassword?: string | null
}): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  const secretKey = params.secretKey.trim()
  const publishableKey = params.publishableKey.trim()
  if (!secretKey || !publishableKey) return

  try {
    await saveUserMerchantCredentials({
      userId: session.user.id,
      secretKey,
      publishableKey,
      merchantSlug: params.merchantSlug,
      merchantDashboardPassword: params.merchantDashboardPassword,
    })
  } catch (e) {
    console.error("[persistMerchantKeysForSession] failed", e)
  }
}
