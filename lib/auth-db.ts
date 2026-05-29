import type { Pool } from "pg"
import { getAuthPool } from "@/lib/auth-pool"
import { ensureAuthSchema } from "@/lib/auth-schema"
import {
  normalizePrimaryCategories,
  serializePrimaryCategories,
  type PrimaryCategory,
} from "@/lib/onboarding-categories"
import type { UserOnboardingProfile } from "@/lib/onboarding"

export type AuthUserRow = {
  id: number
  email: string
  name: string | null
  image: string | null
  password_hash: string | null
  selected_plan: string | null
  business_name: string | null
  primary_category: string | null
}

export async function withAuthDb<T>(fn: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = getAuthPool()
  await ensureAuthSchema(pool)
  return fn(pool)
}

export async function getUserWithPasswordByEmail(
  email: string,
): Promise<AuthUserRow | null> {
  return withAuthDb(async (pool) => {
    const res = await pool.query<AuthUserRow>(
      `SELECT id, email,
              COALESCE(name, display_name) AS name,
              COALESCE(image, avatar_url) AS image,
              password_hash,
              selected_plan,
              business_name,
              primary_category
       FROM users WHERE lower(email) = lower($1)`,
      [email.trim()],
    )
    return res.rows[0] ?? null
  })
}

export async function createCredentialUser(params: {
  email: string
  name: string | null
  passwordHash: string
  emailVerified?: Date
}): Promise<{ id: number }> {
  const verifiedAt = params.emailVerified ?? null
  return withAuthDb(async (pool) => {
    const res = await pool.query<{ id: number }>(
      `INSERT INTO users (
         email,
         password_hash,
         name,
         display_name,
         "emailVerified",
         email_verified_at,
         preferences_json,
         created_at
       )
       VALUES ($1, $2, $3::text, $3::varchar, $4, $4, '{}'::json, NOW())
       RETURNING id`,
      [
        params.email.trim().toLowerCase(),
        params.passwordHash,
        params.name,
        verifiedAt,
      ],
    )
    const row = res.rows[0]
    if (!row) throw new Error("User insert returned no row")
    return row
  })
}

export async function updateUserSelectedPlan(
  userId: string | number,
  planSlug: string,
): Promise<void> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) {
    console.error("[auth-db] updateUserSelectedPlan: invalid user id", userId)
    throw new Error("Invalid user id")
  }
  await withAuthDb(async (pool) => {
    await pool.query(`UPDATE users SET selected_plan = $2 WHERE id = $1`, [
      id,
      planSlug,
    ])
  })
}

export async function getUserSelectedPlan(
  userId: string | number,
): Promise<string | null> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) return null
  return withAuthDb(async (pool) => {
    const res = await pool.query<{ selected_plan: string | null }>(
      `SELECT selected_plan FROM users WHERE id = $1`,
      [id],
    )
    return res.rows[0]?.selected_plan ?? null
  })
}

export async function getUserAccountDetails(
  userId: string | number,
): Promise<{
  email: string
  name: string | null
  selectedPlan: string | null
  businessName: string | null
  primaryCategories: PrimaryCategory[]
  hasPasswordAuth: boolean
} | null> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) return null
  return withAuthDb(async (pool) => {
    const res = await pool.query<{
      email: string
      name: string | null
      selected_plan: string | null
      business_name: string | null
      primary_category: string | null
      password_hash: string | null
    }>(
      `SELECT email,
              COALESCE(name, display_name) AS name,
              selected_plan,
              business_name,
              primary_category,
              password_hash
       FROM users WHERE id = $1`,
      [id],
    )
    const row = res.rows[0]
    if (!row) return null
    return {
      email: row.email,
      name: row.name,
      selectedPlan: row.selected_plan,
      businessName: row.business_name,
      primaryCategories: normalizePrimaryCategories(row.primary_category),
      hasPasswordAuth: Boolean(row.password_hash),
    }
  })
}

export async function updateUserPassword(
  userId: string | number,
  passwordHash: string,
): Promise<void> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) {
    console.error("[auth-db] updateUserPassword: invalid user id", userId)
    throw new Error("Invalid user id")
  }
  await withAuthDb(async (pool) => {
    await pool.query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [
      id,
      passwordHash,
    ])
  })
}

export async function getUserOnboardingProfile(
  userId: string | number,
): Promise<UserOnboardingProfile | null> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) return null
  return withAuthDb(async (pool) => {
    const res = await pool.query<{
      business_name: string | null
      primary_category: string | null
    }>(
      `SELECT business_name, primary_category FROM users WHERE id = $1`,
      [id],
    )
    const row = res.rows[0]
    if (!row) return null
    return {
      business_name: row.business_name,
      primary_categories: normalizePrimaryCategories(row.primary_category),
    }
  })
}

export async function updateUserOnboardingProfile(
  userId: string | number,
  params: { businessName: string; primaryCategories: PrimaryCategory[] },
): Promise<void> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) {
    console.error(
      "[auth-db] updateUserOnboardingProfile: invalid user id",
      userId,
    )
    throw new Error("Invalid user id")
  }
  if (params.primaryCategories.length === 0) {
    throw new Error("At least one category is required")
  }
  await withAuthDb(async (pool) => {
    await pool.query(
      `UPDATE users
       SET business_name = $2, primary_category = $3
       WHERE id = $1`,
      [
        id,
        params.businessName.trim(),
        serializePrimaryCategories(params.primaryCategories),
      ],
    )
  })
}

export async function getUserPreferences(
  userId: string | number,
): Promise<Record<string, unknown>> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) return {}
  return withAuthDb(async (pool) => {
    const res = await pool.query<{ preferences_json: Record<string, unknown> | null }>(
      `SELECT preferences_json FROM users WHERE id = $1`,
      [id],
    )
    const raw = res.rows[0]?.preferences_json
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}
  })
}

export async function updateUserPreferences(
  userId: string | number,
  patch: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const id = typeof userId === "string" ? Number.parseInt(userId, 10) : userId
  if (!Number.isFinite(id)) {
    console.error("[auth-db] updateUserPreferences: invalid user id", userId)
    throw new Error("Invalid user id")
  }
  return withAuthDb(async (pool) => {
    const res = await pool.query<{ preferences_json: Record<string, unknown> }>(
      `UPDATE users
       SET preferences_json = COALESCE(preferences_json, '{}'::json) || $2::json
       WHERE id = $1
       RETURNING preferences_json`,
      [id, JSON.stringify(patch)],
    )
    const row = res.rows[0]
    if (!row) throw new Error("User not found")
    return row.preferences_json ?? {}
  })
}
