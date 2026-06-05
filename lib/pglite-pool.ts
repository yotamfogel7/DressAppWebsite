import { mkdir } from "node:fs/promises"
import path from "node:path"
import type { Pool, QueryResult, QueryResultRow } from "pg"
import { PGlite } from "@electric-sql/pglite"

function getDefaultDataDir(): string {
  const cwd = process.cwd()
  const base = typeof cwd === "string" ? cwd : String(cwd)
  return path.resolve(base, ".data", "auth-pglite")
}

function resolveDataDir(dataDir: string): string {
  return path.resolve(typeof dataDir === "string" ? dataDir : String(dataDir))
}

type PgliteQueryResult<R extends QueryResultRow> = {
  rows: R[]
  affectedRows?: number
}

function toPgQueryResult<R extends QueryResultRow>(
  result: PgliteQueryResult<R>,
): QueryResult<R> {
  const rows = result.rows ?? []
  return {
    rows,
    rowCount: result.affectedRows ?? rows.length,
    command: "",
    oid: 0,
    fields: [],
  }
}

class PglitePoolAdapter {
  private readonly db: PGlite

  constructor(dataDir?: string) {
    this.db = dataDir ? new PGlite(dataDir) : new PGlite()
  }

  async query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<R>> {
    const result = values?.length
      ? await this.db.query<R>(text, values)
      : await this.db.query<R>(text)
    return toPgQueryResult(result)
  }

  async end(): Promise<void> {
    await this.db.close()
  }
}

async function probeAdapter(adapter: PglitePoolAdapter): Promise<void> {
  await adapter.query("SELECT 1")
}

export async function createEmbeddedAuthPool(
  dataDir = getDefaultDataDir(),
): Promise<Pool> {
  const resolvedDir = resolveDataDir(dataDir)
  try {
    await mkdir(resolvedDir, { recursive: true })
    const fileAdapter = new PglitePoolAdapter(resolvedDir)
    await probeAdapter(fileAdapter)
    return fileAdapter as unknown as Pool
  } catch (e) {
    console.warn(
      "[pglite-pool] filesystem embedded db unavailable; using in-memory dev db:",
      e instanceof Error ? e.message : e,
    )
    const memoryAdapter = new PglitePoolAdapter()
    await probeAdapter(memoryAdapter)
    return memoryAdapter as unknown as Pool
  }
}
