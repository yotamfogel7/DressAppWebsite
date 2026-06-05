import bcrypt from "bcryptjs"
import { withAuthDb } from "@/lib/auth-db"
import {
  normalizeBusinessName,
  type UserOnboardingProfile,
} from "@/lib/onboarding"
import {
  normalizePrimaryCategories,
  serializePrimaryCategories,
  type PrimaryCategory,
} from "@/lib/onboarding-categories"

const CODE_TTL_MS = 10 * 60 * 1000
const PENDING_ONBOARDING_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_MS = 60 * 1000

export type PendingSignupRow = {
  email: string
  code_hash: string
  name: string | null
  password_hash: string
  expires_at: Date
  attempts: number
  created_at: Date
  verified_at: Date | null
  business_name: string | null
  primary_category: string | null
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function generateSignupCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000
  return n.toString().padStart(6, "0")
}

export async function hashSignupCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10)
}

export async function upsertSignupVerification(params: {
  email: string
  code: string
  name: string | null
  passwordHash: string
}): Promise<{ createdAt: Date }> {
  const email = normalizeEmail(params.email)
  const codeHash = await hashSignupCode(params.code)
  const expiresAt = new Date(Date.now() + CODE_TTL_MS)

  return withAuthDb(async (pool) => {
    const existing = await pool.query<{ created_at: Date; verified_at: Date | null }>(
      `SELECT created_at, verified_at FROM signup_verifications WHERE email = $1`,
      [email],
    )
    const prev = existing.rows[0]
    if (
      prev?.created_at &&
      !prev.verified_at &&
      Date.now() - new Date(prev.created_at).getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new Error("RESEND_COOLDOWN")
    }

    const res = await pool.query<{ created_at: Date }>(
      `INSERT INTO signup_verifications (
         email, code_hash, name, password_hash, expires_at, attempts, created_at
       )
       VALUES ($1, $2, $3, $4, $5, 0, NOW())
       ON CONFLICT (email) DO UPDATE SET
         code_hash = EXCLUDED.code_hash,
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         expires_at = EXCLUDED.expires_at,
         attempts = 0,
         created_at = NOW(),
         verified_at = NULL,
         business_name = NULL,
         primary_category = NULL
       RETURNING created_at`,
      [email, codeHash, params.name, params.passwordHash, expiresAt],
    )
    const row = res.rows[0]
    if (!row) throw new Error("Signup verification upsert returned no row")
    return { createdAt: row.created_at }
  })
}

export async function getPendingSignup(
  email: string,
): Promise<PendingSignupRow | null> {
  const normalized = normalizeEmail(email)
  return withAuthDb(async (pool) => {
    const res = await pool.query<PendingSignupRow>(
      `SELECT email, code_hash, name, password_hash, expires_at, attempts, created_at,
              verified_at, business_name, primary_category
       FROM signup_verifications
       WHERE email = $1`,
      [normalized],
    )
    return res.rows[0] ?? null
  })
}

export async function incrementSignupVerificationAttempts(
  email: string,
): Promise<void> {
  const normalized = normalizeEmail(email)
  await withAuthDb(async (pool) => {
    await pool.query(
      `UPDATE signup_verifications SET attempts = attempts + 1 WHERE email = $1`,
      [normalized],
    )
  })
}

export async function deletePendingSignup(email: string): Promise<void> {
  const normalized = normalizeEmail(email)
  await withAuthDb(async (pool) => {
    await pool.query(`DELETE FROM signup_verifications WHERE email = $1`, [
      normalized,
    ])
  })
}

export async function verifySignupCodeForPendingOnboarding(params: {
  email: string
  code: string
}): Promise<
  | { ok: true; name: string | null; passwordHash: string }
  | { ok: false; reason: "missing" | "expired" | "too_many_attempts" | "invalid" }
> {
  const row = await getPendingSignup(params.email)
  if (!row) return { ok: false, reason: "missing" }
  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" }
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" }
  }

  const match = await bcrypt.compare(params.code, row.code_hash)
  if (!match) {
    await incrementSignupVerificationAttempts(params.email)
    return { ok: false, reason: "invalid" }
  }

  const email = normalizeEmail(params.email)
  const expiresAt = new Date(Date.now() + PENDING_ONBOARDING_TTL_MS)
  await withAuthDb(async (pool) => {
    await pool.query(
      `UPDATE signup_verifications
       SET verified_at = NOW(), expires_at = $2, attempts = 0
       WHERE email = $1`,
      [email, expiresAt],
    )
  })

  return {
    ok: true,
    name: row.name,
    passwordHash: row.password_hash,
  }
}

export async function getVerifiedPendingSignup(
  email: string,
): Promise<PendingSignupRow | null> {
  const row = await getPendingSignup(email)
  if (!row?.verified_at) return null
  if (new Date(row.expires_at).getTime() < Date.now()) return null
  return row
}

/** Restore pending signup row when dev DB resets but the sealed session cookie is valid. */
export async function ensureVerifiedPendingSignupFromSession(params: {
  email: string
  password: string
  name?: string | null
}): Promise<PendingSignupRow | null> {
  const existing = await getVerifiedPendingSignup(params.email)
  if (existing) return existing

  const normalized = normalizeEmail(params.email)
  const passwordHash = await bcrypt.hash(params.password, 10)
  const expiresAt = new Date(Date.now() + PENDING_ONBOARDING_TTL_MS)

  await withAuthDb(async (pool) => {
    await pool.query(
      `INSERT INTO signup_verifications (
         email, code_hash, name, password_hash, expires_at, attempts, created_at,
         verified_at, business_name, primary_category
       )
       VALUES ($1, 'rehydrated', $2, $3, $4, 0, NOW(), NOW(), NULL, NULL)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         expires_at = EXCLUDED.expires_at,
         verified_at = COALESCE(signup_verifications.verified_at, NOW()),
         attempts = 0`,
      [normalized, params.name ?? null, passwordHash, expiresAt],
    )
  })

  return getVerifiedPendingSignup(normalized)
}

export function pendingSignupProfile(
  row: PendingSignupRow,
): UserOnboardingProfile {
  return {
    business_name: normalizeBusinessName(row.business_name),
    primary_categories: normalizePrimaryCategories(row.primary_category),
  }
}

export function isPendingSignupProfileComplete(
  row: PendingSignupRow,
): boolean {
  const profile = pendingSignupProfile(row)
  return Boolean(
    profile.business_name && profile.primary_categories.length > 0,
  )
}

export async function updatePendingSignupProfile(
  email: string,
  params: { businessName: string; primaryCategories: PrimaryCategory[] },
): Promise<void> {
  const normalized = normalizeEmail(email)
  const businessName = normalizeBusinessName(params.businessName)
  if (!businessName) {
    throw new Error("Business name is required")
  }
  if (params.primaryCategories.length === 0) {
    throw new Error("At least one category is required")
  }

  await withAuthDb(async (pool) => {
    const res = await pool.query(
      `UPDATE signup_verifications
       SET business_name = $2, primary_category = $3
       WHERE email = $1 AND verified_at IS NOT NULL`,
      [
        normalized,
        businessName,
        serializePrimaryCategories(params.primaryCategories),
      ],
    )
    if ((res.rowCount ?? 0) === 0) {
      throw new Error("Pending signup not found or not verified")
    }
  })
}
