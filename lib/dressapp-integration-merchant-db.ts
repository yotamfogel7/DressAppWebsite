import postgres from "postgres"

/**
 * Persists merchant publishable keys from the integration flow.
 * Set `DRESSAPP_MERCHANT_KEYS_DATABASE_URL` to a Postgres connection string.
 */
export async function saveMerchantPublishableKey(params: {
  slug: string
  merchantName: string
  publishableKey: string
}): Promise<void> {
  const url = process.env.DRESSAPP_MERCHANT_KEYS_DATABASE_URL?.trim()
  if (!url) {
    throw new Error(
      "DRESSAPP_MERCHANT_KEYS_DATABASE_URL is not set. Add a Postgres URL to persist publishable keys.",
    )
  }

  const sql = postgres(url, { max: 1, idle_timeout: 5, max_lifetime: 60 * 5 })
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS dressapp_integration_merchant_keys (
        id bigserial PRIMARY KEY,
        slug text NOT NULL UNIQUE,
        merchant_name text NOT NULL,
        publishable_key text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `
    await sql`
      INSERT INTO dressapp_integration_merchant_keys (slug, merchant_name, publishable_key)
      VALUES (${params.slug}, ${params.merchantName}, ${params.publishableKey})
      ON CONFLICT (slug) DO UPDATE SET
        merchant_name = EXCLUDED.merchant_name,
        publishable_key = EXCLUDED.publishable_key,
        created_at = now()
    `
  } finally {
    await sql.end({ timeout: 5 })
  }
}
