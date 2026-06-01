import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserPreferences, getUserWithPasswordByEmail, updateUserPreferences } from "@/lib/auth-db"
import { DRESSAPP_PRODUCTION_API_BASE_URL } from "@/lib/dressapp-api-base"
import { ensureMerchantForUser } from "@/lib/ensure-merchant-for-user"
import { getUserMerchantCredentials } from "@/lib/user-merchant-credentials-db"
import {
  normalizeStorefrontUrl,
  STOREFRONT_URL_PREF_KEY,
} from "@/lib/storefront-url"

async function resolveCredentialsUserId(session: {
  user: { id: string; email?: string | null; name?: string | null }
}) {
  const sessionEmail = session.user.email?.trim() ?? null
  if (sessionEmail) {
    const account = await getUserWithPasswordByEmail(sessionEmail)
    if (account) return String(account.id)
  }
  return session.user.id
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 })
  }

  try {
    const userId = await resolveCredentialsUserId(session)
    const prefs = await getUserPreferences(userId)
    let credentials = await getUserMerchantCredentials(userId)

    if (!credentials) {
      await ensureMerchantForUser(userId, {
        apiBase: DRESSAPP_PRODUCTION_API_BASE_URL,
        email: session.user.email ?? undefined,
        name: session.user.name,
      })
      credentials = await getUserMerchantCredentials(userId)
    }

    const storefrontRaw =
      typeof prefs[STOREFRONT_URL_PREF_KEY] === "string"
        ? prefs[STOREFRONT_URL_PREF_KEY]
        : null
    const storefrontUrl = storefrontRaw ? normalizeStorefrontUrl(storefrontRaw) : null

    if (!credentials) {
      return NextResponse.json({
        ok: true,
        hasKeys: false,
        keys: null,
        storefrontUrl,
        provisioningFailed: true,
        keysApiBase: DRESSAPP_PRODUCTION_API_BASE_URL,
        message:
          "Merchant keys could not be created on the DressApp production API. Check server logs and DRESSAPP_PARTNER_ADMIN_SECRET, then try again.",
      })
    }

    return NextResponse.json({
      ok: true,
      hasKeys: true,
      keys: {
        publishableKey: credentials.publishableKey,
        secretKey: credentials.secretKey,
        merchantSlug: credentials.merchantSlug,
      },
      storefrontUrl,
      keysApiBase: DRESSAPP_PRODUCTION_API_BASE_URL,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[settings/credentials] GET failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
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

  const rawUrl =
    typeof body === "object" &&
    body !== null &&
    "storefrontUrl" in body &&
    typeof (body as { storefrontUrl?: unknown }).storefrontUrl === "string"
      ? (body as { storefrontUrl: string }).storefrontUrl
      : ""

  const storefrontUrl = normalizeStorefrontUrl(rawUrl)
  if (!storefrontUrl) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid storefront URL (https://your-store.com)." },
      { status: 400 },
    )
  }

  try {
    await updateUserPreferences(session.user.id, {
      [STOREFRONT_URL_PREF_KEY]: storefrontUrl,
    })

    return NextResponse.json({
      ok: true,
      storefrontUrl,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[settings/credentials] PATCH failed", e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
