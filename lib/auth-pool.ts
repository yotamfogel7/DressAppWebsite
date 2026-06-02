import { Pool } from "pg"
import { createEmbeddedAuthPool } from "@/lib/pglite-pool"
import { normalizePostgresConnectionUrl } from "@/lib/postgres-connection-url"

let pool: Pool | null = null
let initPromise: Promise<Pool> | null = null

function isLocalhostDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizePostgresConnectionUrl(url))
    const host = parsed.hostname.toLowerCase()
    return host === "localhost" || host === "127.0.0.1" || host === "::1"
  } catch {
    return false
  }
}

async function canConnectToPostgres(url: string): Promise<boolean> {
  const probe = new Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 1500,
  })
  try {
    await probe.query("SELECT 1")
    return true
  } catch {
    return false
  } finally {
    await probe.end().catch(() => undefined)
  }
}

async function createAuthPool(): Promise<Pool> {
  const rawUrl = process.env.AUTH_DATABASE_URL?.trim()
  if (!rawUrl) {
    const msg =
      "AUTH_DATABASE_URL is not set. Add a Postgres URL for website accounts (Auth.js)."
    console.error(`[auth] ${msg}`)
    throw new Error(msg)
  }

  const url = normalizePostgresConnectionUrl(rawUrl)
  const forceRemote = process.env.AUTH_DATABASE_FORCE_REMOTE === "true"
  const useEmbedded =
    process.env.AUTH_DATABASE_USE_EMBEDDED === "true" ||
    (process.env.NODE_ENV === "development" &&
      !forceRemote &&
      isLocalhostDatabaseUrl(url))

  if (useEmbedded) {
    const reachable = forceRemote ? false : await canConnectToPostgres(url)
    if (!reachable) {
      console.warn(
        "[auth] Local Postgres is unavailable at AUTH_DATABASE_URL. Using embedded dev database (.data/auth-pglite). Set AUTH_DATABASE_FORCE_REMOTE=true once Postgres is running.",
      )
      return createEmbeddedAuthPool()
    }
  }

  return new Pool({ connectionString: url, max: 5 })
}

export async function initAuthPool(): Promise<Pool> {
  if (pool) return pool
  initPromise ??= createAuthPool()
  pool = await initPromise
  return pool
}

/** Returns the auth pool after {@link initAuthPool} has resolved. */
export function getAuthPool(): Pool {
  if (!pool) {
    throw new Error(
      "[auth] Database pool is not ready yet. Call initAuthPool() before getAuthPool().",
    )
  }
  return pool
}
