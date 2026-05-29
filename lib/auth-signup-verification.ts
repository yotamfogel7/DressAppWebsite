import bcrypt from "bcryptjs"
import { withAuthDb } from "@/lib/auth-db"

const CODE_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_MS = 60 * 1000

export type SignupVerificationRow = {
  email: string
  code_hash: string
  name: string | null
  password_hash: string
  expires_at: Date
  attempts: number
  created_at: Date
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
    const existing = await pool.query<{ created_at: Date }>(
      `SELECT created_at FROM signup_verifications WHERE email = $1`,
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
      `INSERT INTO signup_verifications (email, code_hash, name, password_hash, expires_at, attempts, created_at)
       VALUES ($1, $2, $3, $4, $5, 0, NOW())
       ON CONFLICT (email) DO UPDATE SET
         code_hash = EXCLUDED.code_hash,
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         expires_at = EXCLUDED.expires_at,
         attempts = 0,
         created_at = NOW()
       RETURNING created_at`,
      [email, codeHash, params.name, params.passwordHash, expiresAt],
    )
    const row = res.rows[0]
    if (!row) throw new Error("Signup verification upsert returned no row")
    return { createdAt: row.created_at }
  })
}

export async function getSignupVerification(
  email: string,
): Promise<SignupVerificationRow | null> {
  const normalized = normalizeEmail(email)
  return withAuthDb(async (pool) => {
    const res = await pool.query<SignupVerificationRow>(
      `SELECT email, code_hash, name, password_hash, expires_at, attempts, created_at
       FROM signup_verifications WHERE email = $1`,
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

export async function deleteSignupVerification(email: string): Promise<void> {
  const normalized = normalizeEmail(email)
  await withAuthDb(async (pool) => {
    await pool.query(`DELETE FROM signup_verifications WHERE email = $1`, [
      normalized,
    ])
  })
}

export async function verifySignupCode(params: {
  email: string
  code: string
}): Promise<
  | { ok: true; name: string | null; passwordHash: string }
  | { ok: false; reason: "missing" | "expired" | "too_many_attempts" | "invalid" }
> {
  const row = await getSignupVerification(params.email)
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

  await deleteSignupVerification(params.email)
  return {
    ok: true,
    name: row.name,
    passwordHash: row.password_hash,
  }
}
