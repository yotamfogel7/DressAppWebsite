import { Pool } from "pg"

let pool: Pool | null = null

export function getAuthPool(): Pool {
  const url = process.env.AUTH_DATABASE_URL?.trim()
  if (!url) {
    const msg =
      "AUTH_DATABASE_URL is not set. Add a Postgres URL for website accounts (Auth.js)."
    console.error(`[auth] ${msg}`)
    throw new Error(msg)
  }
  if (!pool) {
    pool = new Pool({ connectionString: url, max: 5 })
  }
  return pool
}
