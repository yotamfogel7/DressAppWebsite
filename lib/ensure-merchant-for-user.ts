import { withAuthDb, getUserOnboardingProfile } from "@/lib/auth-db"
import { normalizeBusinessName } from "@/lib/onboarding"
import { randomMerchantDashboardPassword } from "@/lib/dressapp-http-basic"
import { normalizeMerchantEmail } from "@/lib/dressapp-merchant-email"
import {
  getUserMerchantCredentials,
  saveUserMerchantCredentials,
} from "@/lib/user-merchant-credentials-db"

function readEnvSecret(raw: string | undefined): string {
  if (raw == null) return ""
  let t = raw.trim()
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim()
  }
  return t
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
  return base || "merchant"
}

export type EnsureMerchantForUserOptions = {
  /** Override DressApp API base (e.g. production URL for Settings credentials). */
  apiBase?: string
  /** Fallback when the users table row is missing (stale JWT id). */
  email?: string
  name?: string | null
}

/**
 * Creates a DressApp merchant for a signed-up user if they do not have keys yet.
 * Failures are logged; callers should not block the user flow on errors.
 * Returns true when keys exist or were saved; false when provisioning could not complete.
 */
export async function ensureMerchantForUser(
  userId: string | number,
  options?: EnsureMerchantForUserOptions,
): Promise<boolean> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) return false

  const existing = await getUserMerchantCredentials(id)
  if (existing?.secretKey && existing.publishableKey) return true

  const apiBase =
    options?.apiBase?.replace(/\/$/, "") ||
    process.env.DRESSAPP_API_BASE_URL?.replace(/\/$/, "")
  const partnerSecret = readEnvSecret(process.env.DRESSAPP_PARTNER_ADMIN_SECRET)
  if (!apiBase || !partnerSecret) {
    console.error(
      "[ensureMerchantForUser] Missing DRESSAPP_API_BASE_URL or DRESSAPP_PARTNER_ADMIN_SECRET",
    )
    return false
  }

  const userRow = await withAuthDb(async (pool) => {
    const res = await pool.query<{ email: string; name: string | null }>(
      `SELECT email, COALESCE(name, display_name) AS name FROM users WHERE id = $1`,
      [id],
    )
    return res.rows[0] ?? null
  })

  const resolvedEmail = userRow?.email?.trim() || options?.email?.trim() || ""
  const resolvedName = userRow?.name?.trim() || options?.name?.trim() || null

  if (!resolvedEmail) {
    console.error("[ensureMerchantForUser] Could not resolve user email for id", id)
    return false
  }
  const profile = await getUserOnboardingProfile(id)
  const name =
    normalizeBusinessName(profile?.business_name) || resolvedName || "DressApp merchant"
  const email = normalizeMerchantEmail(resolvedEmail)
  if (!email) {
    console.error("[ensureMerchantForUser] Invalid email for user", id)
    return false
  }

  const slug = `${slugify(name)}-${id}`
  const password = randomMerchantDashboardPassword()

  const merchantUrl = `${apiBase}/partner/v1/admin/merchants`
  console.info(`[ensureMerchantForUser] POST ${merchantUrl} for ${email}`)

  let upstream: Response
  let text: string
  try {
    upstream = await fetch(merchantUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Partner-Admin-Secret": partnerSecret,
      },
      body: JSON.stringify({ name, slug, password, email }),
    })
    text = await upstream.text()
  } catch (e) {
    console.error("[ensureMerchantForUser] DressApp fetch failed", e)
    return false
  }

  if (!upstream.ok) {
    console.error("[ensureMerchantForUser] DressApp API", upstream.status, text)
    return false
  }

  let json: Record<string, unknown> = {}
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    console.error("[ensureMerchantForUser] Invalid JSON from API:", text)
    return false
  }

  const publishableKey =
    (json.publishable_key as string) || (json.publishableKey as string) || ""
  const secretKey = (json.secret_key as string) || (json.secretKey as string) || ""
  if (!publishableKey || !secretKey) {
    console.error("[ensureMerchantForUser] Missing keys in API response", json)
    return false
  }

  try {
    await saveUserMerchantCredentials({
      userId: id,
      secretKey,
      publishableKey,
      merchantSlug: slug,
      merchantDashboardPassword: password,
    })
    return true
  } catch (e) {
    console.error("[ensureMerchantForUser] save credentials failed", e)
    return false
  }
}
