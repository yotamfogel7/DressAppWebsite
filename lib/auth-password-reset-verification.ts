import bcrypt from "bcryptjs"
import { withAuthDb } from "@/lib/auth-db"
import {
  generateSignupCode,
  hashSignupCode,
} from "@/lib/auth-signup-verification"

const CODE_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_MS = 60 * 1000

export type PasswordResetVerificationRow = {
  email: string
  code_hash: string
  expires_at: Date
  attempts: number
  created_at: Date
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export { generateSignupCode as generatePasswordResetCode }

export async function upsertPasswordResetVerification(params: {
  email: string
  code: string
}): Promise<{ createdAt: Date }> {
  const email = normalizeEmail(params.email)
  const codeHash = await hashSignupCode(params.code)
  const expiresAt = new Date(Date.now() + CODE_TTL_MS)

  return withAuthDb(async (pool) => {
    const existing = await pool.query<{ created_at: Date }>(
      `SELECT created_at FROM password_reset_verifications WHERE email = $1`,
      [email],
    )
    const prevCreated = existing.rows[0]?.created_at
    if (
      prevCreated &&
      Date.now() - new Date(prevCreated).getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new Error("RESEND_COOLDOWN")
    }

    const res = await pool.query<{ created_at: Date }>(
      `INSERT INTO password_reset_verifications (email, code_hash, expires_at, attempts, created_at)
       VALUES ($1, $2, $3, 0, NOW())
       ON CONFLICT (email) DO UPDATE SET
         code_hash = EXCLUDED.code_hash,
         expires_at = EXCLUDED.expires_at,
         attempts = 0,
         created_at = NOW()
       RETURNING created_at`,
      [email, codeHash, expiresAt],
    )
    const row = res.rows[0]
    if (!row) throw new Error("Password reset verification upsert returned no row")
    return { createdAt: row.created_at }
  })
}

export async function getPasswordResetVerification(
  email: string,
): Promise<PasswordResetVerificationRow | null> {
  const normalized = normalizeEmail(email)
  return withAuthDb(async (pool) => {
    const res = await pool.query<PasswordResetVerificationRow>(
      `SELECT email, code_hash, expires_at, attempts, created_at
       FROM password_reset_verifications WHERE email = $1`,
      [normalized],
    )
    return res.rows[0] ?? null
  })
}

async function incrementPasswordResetAttempts(email: string): Promise<void> {
  const normalized = normalizeEmail(email)
  await withAuthDb(async (pool) => {
    await pool.query(
      `UPDATE password_reset_verifications SET attempts = attempts + 1 WHERE email = $1`,
      [normalized],
    )
  })
}

export async function deletePasswordResetVerification(
  email: string,
): Promise<void> {
  const normalized = normalizeEmail(email)
  await withAuthDb(async (pool) => {
    await pool.query(`DELETE FROM password_reset_verifications WHERE email = $1`, [
      normalized,
    ])
  })
}

export async function verifyPasswordResetCode(params: {
  email: string
  code: string
}): Promise<
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "too_many_attempts" | "invalid" }
> {
  const row = await getPasswordResetVerification(params.email)
  if (!row) return { ok: false, reason: "missing" }
  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" }
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" }
  }

  const match = await bcrypt.compare(params.code, row.code_hash)
  if (!match) {
    await incrementPasswordResetAttempts(params.email)
    return { ok: false, reason: "invalid" }
  }

  return { ok: true }
}
