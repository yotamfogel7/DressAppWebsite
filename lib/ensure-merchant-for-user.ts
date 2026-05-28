import { withAuthDb, getUserOnboardingProfile } from "@/lib/auth-db"
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

/**
 * Creates a DressApp merchant for a signed-up user if they do not have keys yet.
 * Failures are logged; callers should not block the user flow on errors.
 * Returns true when keys exist or were saved; false when provisioning could not complete.
 */
export async function ensureMerchantForUser(userId: string | number): Promise<boolean> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) return false

  const existing = await getUserMerchantCredentials(id)
  if (existing?.secretKey && existing.publishableKey) return true

  const apiBase = process.env.DRESSAPP_API_BASE_URL?.replace(/\/$/, "")
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
  if (!userRow?.email) {
    console.error("[ensureMerchantForUser] Could not resolve user for id", id)
    return false
  }

  const profile = await getUserOnboardingProfile(id)
  const name = profile?.business_name?.trim() || userRow.name?.trim() || "DressApp merchant"
  const email = normalizeMerchantEmail(userRow.email)
  if (!email) {
    console.error("[ensureMerchantForUser] Invalid email for user", id)
    return false
  }

  const slug = `${slugify(name)}-${id}`
  const password = randomMerchantDashboardPassword()

  let upstream: Response
  let text: string
  try {
    upstream = await fetch(`${apiBase}/partner/v1/admin/merchants`, {
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
