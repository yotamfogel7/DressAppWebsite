import type { Pool } from "pg"

let schemaEnsured: Promise<void> | null = null

/**
 * Creates Auth.js adapter tables plus app columns for credentials and plan selection.
 * Safe to call multiple times (idempotent).
 */
export function ensureAuthSchema(pool: Pool): Promise<void> {
  schemaEnsured ??= runEnsureAuthSchema(pool)
  return schemaEnsured
}

async function runEnsureAuthSchema(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      "emailVerified" TIMESTAMPTZ,
      image TEXT,
      password_hash TEXT,
      selected_plan TEXT,
      business_name TEXT,
      primary_category TEXT
    )
  `)
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`)
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT`)
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMPTZ`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS selected_plan TEXT`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_category TEXT`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences_json JSON DEFAULT '{}'::json`,
  )
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`,
  )
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at BIGINT,
      id_token TEXT,
      scope TEXT,
      session_state TEXT,
      token_type TEXT,
      UNIQUE (provider, "providerAccountId")
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires TIMESTAMPTZ NOT NULL,
      "sessionToken" TEXT NOT NULL UNIQUE
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification_token (
      identifier TEXT NOT NULL,
      expires TIMESTAMPTZ NOT NULL,
      token TEXT NOT NULL,
      PRIMARY KEY (identifier, token)
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signup_verifications (
      email TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      name TEXT,
      password_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      verified_at TIMESTAMPTZ,
      business_name TEXT,
      primary_category TEXT
    )
  `)
  await pool.query(`
    ALTER TABLE signup_verifications ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ
  `)
  await pool.query(`
    ALTER TABLE signup_verifications ADD COLUMN IF NOT EXISTS business_name TEXT
  `)
  await pool.query(`
    ALTER TABLE signup_verifications ADD COLUMN IF NOT EXISTS primary_category TEXT
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_verifications (
      email TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_merchant_credentials (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      secret_key TEXT NOT NULL,
      publishable_key TEXT NOT NULL,
      merchant_slug TEXT,
      merchant_dashboard_password TEXT,
      google_api_key TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Shared DressApp users table: OAuth inserts omit these NOT NULL columns.
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'preferences_json'
      ) THEN
        ALTER TABLE users
          ALTER COLUMN preferences_json SET DEFAULT '{}'::json;
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'created_at'
      ) THEN
        ALTER TABLE users
          ALTER COLUMN created_at SET DEFAULT NOW();
      END IF;
    END $$
  `)
}
