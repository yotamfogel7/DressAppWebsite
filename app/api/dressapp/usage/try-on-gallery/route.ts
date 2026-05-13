import { NextResponse } from "next/server"
import postgres from "postgres"

const LIMIT = 48

/** Safe unquoted names for Postgres identifiers (no dots; use schema + table env). */
const IDENT = /^[a-z_][a-z0-9_]{0,127}$/i

function quoteIdent(name: string): string {
  if (!IDENT.test(name)) {
    throw new Error(`Invalid identifier (use letters, numbers, underscore only): ${name}`)
  }
  return `"${name.replace(/"/g, '""')}"`
}

function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim())
    return u.protocol === "https:" || u.protocol === "http:"
  } catch {
    return false
  }
}

export async function GET() {
  const dbUrl = process.env.DRESSAPP_TRY_ON_GALLERY_DATABASE_URL?.trim()
  const schema = (process.env.DRESSAPP_TRY_ON_GALLERY_SCHEMA ?? "public").trim()
  const table = process.env.DRESSAPP_TRY_ON_GALLERY_TABLE?.trim()
  const column = process.env.DRESSAPP_TRY_ON_GALLERY_URL_COLUMN?.trim()

  if (!dbUrl) {
    return NextResponse.json({
      ok: true,
      images: [] as { url: string }[],
      configured: false,
      message:
        "Gallery disabled: set DRESSAPP_TRY_ON_GALLERY_DATABASE_URL, DRESSAPP_TRY_ON_GALLERY_TABLE, and DRESSAPP_TRY_ON_GALLERY_URL_COLUMN.",
    })
  }

  if (!table || !column) {
    const msg =
      "DRESSAPP_TRY_ON_GALLERY_DATABASE_URL is set but DRESSAPP_TRY_ON_GALLERY_TABLE or DRESSAPP_TRY_ON_GALLERY_URL_COLUMN is missing."
    console.error("[dressapp/usage/try-on-gallery]", msg)
    return NextResponse.json({
      ok: false,
      images: [] as { url: string }[],
      configured: true,
      error: msg,
    })
  }

  let qSchema: string
  let qTable: string
  let qCol: string
  try {
    qSchema = quoteIdent(schema)
    qTable = quoteIdent(table)
    qCol = quoteIdent(column)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("[dressapp/usage/try-on-gallery] bad identifier", { message, schema, table, column })
    return NextResponse.json({
      ok: false,
      images: [] as { url: string }[],
      configured: true,
      error: message,
    })
  }

  const sql = postgres(dbUrl, { max: 1, idle_timeout: 5, max_lifetime: 60 * 5 })
  try {
    const rows = await sql.unsafe<{ url: unknown }[]>(
      `SELECT ${qCol} AS url FROM ${qSchema}.${qTable} WHERE ${qCol} IS NOT NULL AND trim(${qCol}::text) <> '' ORDER BY random() LIMIT ${LIMIT}`,
    )
    const seen = new Set<string>()
    const images: { url: string }[] = []
    for (const row of rows) {
      const raw = row.url
      if (typeof raw !== "string") continue
      const u = raw.trim()
      if (!isHttpUrl(u) || seen.has(u)) continue
      seen.add(u)
      images.push({ url: u })
    }
    return NextResponse.json({ ok: true, images, configured: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("[dressapp/usage/try-on-gallery] query failed", { message })
    return NextResponse.json({
      ok: false,
      images: [] as { url: string }[],
      configured: true,
      error: message,
    })
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {})
  }
}
