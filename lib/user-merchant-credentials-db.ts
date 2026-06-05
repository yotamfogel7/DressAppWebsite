import type { Pool } from "pg"
import { withAuthDb } from "@/lib/auth-db"
import { initAuthPool } from "@/lib/auth-pool"
import { ensureAuthSchema } from "@/lib/auth-schema"

export type UserMerchantCredentials = {
  userId: number
  secretKey: string
  publishableKey: string
  merchantSlug: string | null
  merchantDashboardPassword: string | null
  googleApiKey: string | null
  updatedAt: string | null
}

export type SaveUserMerchantCredentialsInput = {
  userId: string | number
  secretKey: string
  publishableKey: string
  merchantSlug?: string | null
  merchantDashboardPassword?: string | null
  googleApiKey?: string | null
}

async function withCredentialsDb<T>(fn: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = await initAuthPool()
  await ensureAuthSchema(pool)
  return fn(pool)
}

function parseUserId(userId: string | number): number {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) {
    throw new Error("Invalid user id")
  }
  return id
}

function rowToCredentials(row: {
  user_id: number
  secret_key: string
  publishable_key: string
  merchant_slug: string | null
  merchant_dashboard_password: string | null
  google_api_key: string | null
  updated_at: Date | string | null
}): UserMerchantCredentials {
  return {
    userId: row.user_id,
    secretKey: row.secret_key,
    publishableKey: row.publishable_key,
    merchantSlug: row.merchant_slug,
    merchantDashboardPassword: row.merchant_dashboard_password,
    googleApiKey: row.google_api_key,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  }
}

export async function getUserMerchantCredentials(
  userId: string | number,
): Promise<UserMerchantCredentials | null> {
  const id = parseUserId(userId)
  return withCredentialsDb(async (pool) => {
    const res = await pool.query<{
      user_id: number
      secret_key: string
      publishable_key: string
      merchant_slug: string | null
      merchant_dashboard_password: string | null
      google_api_key: string | null
      updated_at: Date | string | null
    }>(
      `SELECT user_id, secret_key, publishable_key, merchant_slug,
              merchant_dashboard_password, google_api_key, updated_at
       FROM user_merchant_credentials
       WHERE user_id = $1`,
      [id],
    )
    const row = res.rows[0]
    return row ? rowToCredentials(row) : null
  })
}

/** Reuse keys from another account with the same email (e.g. after local DB reset). */
export async function copyMerchantCredentialsByEmail(
  targetUserId: string | number,
  email: string,
): Promise<boolean> {
  const targetId = parseUserId(targetUserId)
  const normalizedEmail = email.trim()
  if (!normalizedEmail) return false

  const source = await withAuthDb(async (pool) => {
    const res = await pool.query<{
      user_id: number
      secret_key: string
      publishable_key: string
      merchant_slug: string | null
      merchant_dashboard_password: string | null
      google_api_key: string | null
    }>(
      `SELECT c.user_id, c.secret_key, c.publishable_key, c.merchant_slug,
              c.merchant_dashboard_password, c.google_api_key
       FROM user_merchant_credentials c
       INNER JOIN users u ON u.id = c.user_id
       WHERE lower(u.email) = lower($1)
         AND c.user_id <> $2
         AND c.secret_key <> ''
         AND c.publishable_key <> ''
       ORDER BY c.updated_at DESC NULLS LAST, c.user_id DESC
       LIMIT 1`,
      [normalizedEmail, targetId],
    )
    return res.rows[0] ?? null
  })

  if (!source) return false

  try {
    await saveUserMerchantCredentials({
      userId: targetId,
      secretKey: source.secret_key,
      publishableKey: source.publishable_key,
      merchantSlug: source.merchant_slug,
      merchantDashboardPassword: source.merchant_dashboard_password,
      googleApiKey: source.google_api_key,
    })
    return true
  } catch (e) {
    console.error("[copyMerchantCredentialsByEmail] save failed", e)
    return false
  }
}

export async function saveUserMerchantCredentials(
  input: SaveUserMerchantCredentialsInput,
): Promise<void> {
  const id = parseUserId(input.userId)
  const secretKey = input.secretKey.trim()
  const publishableKey = input.publishableKey.trim()
  if (!secretKey || !publishableKey) {
    throw new Error("Secret and publishable keys are required")
  }

  await withCredentialsDb(async (pool) => {
    await pool.query(
      `INSERT INTO user_merchant_credentials (
         user_id, secret_key, publishable_key, merchant_slug,
         merchant_dashboard_password, google_api_key, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         secret_key = EXCLUDED.secret_key,
         publishable_key = EXCLUDED.publishable_key,
         merchant_slug = COALESCE(EXCLUDED.merchant_slug, user_merchant_credentials.merchant_slug),
         merchant_dashboard_password = COALESCE(
           EXCLUDED.merchant_dashboard_password,
           user_merchant_credentials.merchant_dashboard_password
         ),
         google_api_key = COALESCE(EXCLUDED.google_api_key, user_merchant_credentials.google_api_key),
         updated_at = NOW()`,
      [
        id,
        secretKey,
        publishableKey,
        input.merchantSlug?.trim() || null,
        input.merchantDashboardPassword?.trim() || null,
        input.googleApiKey?.trim() || null,
      ],
    )
  })
}
