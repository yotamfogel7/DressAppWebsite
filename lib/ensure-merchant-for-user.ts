import { getUserOnboardingProfile, resolveAuthUserId } from "@/lib/auth-db"
import { getDressAppMerchantApiBase } from "@/lib/dressapp-api-base"
import { randomMerchantDashboardPassword } from "@/lib/dressapp-http-basic"
import {
  buildMerchantRecoveryEmail,
  isMerchantEmailAlreadyInUseError,
  normalizeMerchantEmail,
} from "@/lib/dressapp-merchant-email"
import { normalizeBusinessName } from "@/lib/onboarding"
import {
  copyMerchantCredentialsByEmail,
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

function randomSlugSuffix(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let s = ""
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]
  }
  return s
}

function isMerchantSlugAlreadyInUseError(status: number, body: string): boolean {
  if (status !== 409) return false
  const lower = body.toLowerCase()
  return lower.includes("slug already in use") || lower.includes("slug")
}

type ProvisionMerchantInput = {
  apiBase: string
  partnerSecret: string
  name: string
  slug: string
  email: string
  password: string
}

type ProvisionMerchantResult =
  | {
      ok: true
      publishableKey: string
      secretKey: string
    }
  | {
      ok: false
      status: number
      body: string
    }

async function provisionMerchant(
  input: ProvisionMerchantInput,
): Promise<ProvisionMerchantResult> {
  const merchantUrl = `${input.apiBase}/partner/v1/admin/merchants`
  console.info(`[ensureMerchantForUser] POST ${merchantUrl} for ${input.email}`)

  let upstream: Response
  let text: string
  try {
    upstream = await fetch(merchantUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Partner-Admin-Secret": input.partnerSecret,
      },
      body: JSON.stringify({
        name: input.name,
        slug: input.slug,
        password: input.password,
        email: input.email,
      }),
    })
    text = await upstream.text()
  } catch (e) {
    console.error("[ensureMerchantForUser] DressApp fetch failed", e)
    return { ok: false, status: 0, body: String(e) }
  }

  if (!upstream.ok) {
    console.error("[ensureMerchantForUser] DressApp API", upstream.status, text)
    return { ok: false, status: upstream.status, body: text }
  }

  let json: Record<string, unknown> = {}
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    console.error("[ensureMerchantForUser] Invalid JSON from API:", text)
    return { ok: false, status: upstream.status, body: text }
  }

  const publishableKey =
    (json.publishable_key as string) || (json.publishableKey as string) || ""
  const secretKey = (json.secret_key as string) || (json.secretKey as string) || ""
  if (!publishableKey || !secretKey) {
    console.error("[ensureMerchantForUser] Missing keys in API response", json)
    return { ok: false, status: upstream.status, body: text }
  }

  return { ok: true, publishableKey, secretKey }
}

async function saveProvisionedMerchantCredentials(params: {
  userId: number
  publishableKey: string
  secretKey: string
  merchantSlug: string
  merchantDashboardPassword: string
}): Promise<boolean> {
  try {
    await saveUserMerchantCredentials({
      userId: params.userId,
      secretKey: params.secretKey,
      publishableKey: params.publishableKey,
      merchantSlug: params.merchantSlug,
      merchantDashboardPassword: params.merchantDashboardPassword,
    })
    return true
  } catch (e) {
    console.error("[ensureMerchantForUser] save credentials failed", e)
    return false
  }
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
  const resolvedUser = await resolveAuthUserId(userId, options?.email)
  if (!resolvedUser) {
    console.error(
      "[ensureMerchantForUser] Could not resolve user for id",
      userId,
      options?.email ?? "(no session email)",
    )
    return false
  }

  const id = resolvedUser.id
  const existing = await getUserMerchantCredentials(id)
  if (existing?.secretKey && existing.publishableKey) return true

  const apiBase = options?.apiBase?.replace(/\/$/, "") || getDressAppMerchantApiBase()
  const partnerSecret = readEnvSecret(process.env.DRESSAPP_PARTNER_ADMIN_SECRET)
  if (!apiBase || !partnerSecret) {
    console.error(
      "[ensureMerchantForUser] Missing DRESSAPP_API_BASE_URL or DRESSAPP_PARTNER_ADMIN_SECRET",
    )
    return false
  }

  const resolvedEmail = resolvedUser.email.trim()
  const resolvedName = resolvedUser.name?.trim() || options?.name?.trim() || null

  const profile = await getUserOnboardingProfile(id)
  const rawName =
    normalizeBusinessName(profile?.business_name) || resolvedName || "DressApp merchant"
  const name = rawName.length >= 2 ? rawName : `${rawName} Store`
  const email = normalizeMerchantEmail(resolvedEmail)
  if (!email) {
    console.error("[ensureMerchantForUser] Invalid email for user", id)
    return false
  }

  const baseSlug = `${slugify(name)}-${id}`
  const password = randomMerchantDashboardPassword()

  const initial = await provisionMerchant({
    apiBase,
    partnerSecret,
    name,
    slug: baseSlug,
    email,
    password,
  })

  if (initial.ok) {
    return saveProvisionedMerchantCredentials({
      userId: id,
      publishableKey: initial.publishableKey,
      secretKey: initial.secretKey,
      merchantSlug: baseSlug,
      merchantDashboardPassword: password,
    })
  }

  if (isMerchantSlugAlreadyInUseError(initial.status, initial.body)) {
    const retrySlug = `${baseSlug}-${randomSlugSuffix()}`
    const retryPassword = randomMerchantDashboardPassword()
    console.warn(
      `[ensureMerchantForUser] Slug ${baseSlug} already in use; retrying with ${retrySlug}`,
    )
    const retried = await provisionMerchant({
      apiBase,
      partnerSecret,
      name,
      slug: retrySlug,
      email,
      password: retryPassword,
    })
    if (retried.ok) {
      return saveProvisionedMerchantCredentials({
        userId: id,
        publishableKey: retried.publishableKey,
        secretKey: retried.secretKey,
        merchantSlug: retrySlug,
        merchantDashboardPassword: retryPassword,
      })
    }
    if (!isMerchantEmailAlreadyInUseError(retried.status, retried.body)) {
      return false
    }
    // fall through to email-in-use recovery below
  } else if (!isMerchantEmailAlreadyInUseError(initial.status, initial.body)) {
    return false
  }

  if (await copyMerchantCredentialsByEmail(id, email)) {
    console.info(
      "[ensureMerchantForUser] Reused saved merchant credentials for",
      email,
      "user",
      id,
    )
    return true
  }

  const recoveryEmail = buildMerchantRecoveryEmail(email, id)
  if (!recoveryEmail) {
    console.error(
      "[ensureMerchantForUser] Could not build recovery email for user",
      id,
    )
    return false
  }

  const recoverySlug = `${baseSlug}-acct${id}`
  const recoveryPassword = randomMerchantDashboardPassword()
  console.warn(
    `[ensureMerchantForUser] Merchant email ${email} already exists remotely; provisioning recovery merchant ${recoveryEmail}`,
  )

  const recovery = await provisionMerchant({
    apiBase,
    partnerSecret,
    name,
    slug: recoverySlug,
    email: recoveryEmail,
    password: recoveryPassword,
  })

  if (!recovery.ok) {
    return false
  }

  return saveProvisionedMerchantCredentials({
    userId: id,
    publishableKey: recovery.publishableKey,
    secretKey: recovery.secretKey,
    merchantSlug: recoverySlug,
    merchantDashboardPassword: recoveryPassword,
  })
}
