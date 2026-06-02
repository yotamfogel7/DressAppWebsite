/**
 * Normalizes Postgres URLs copied from Python/SQLAlchemy configs for Node drivers.
 * e.g. postgresql+psycopg://user:pass@host:6432/db -> postgresql://...
 */
export function normalizePostgresConnectionUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  return trimmed.replace(/^postgresql\+psycopg:\/\//i, "postgresql://")
}
