import { mkdir } from "node:fs/promises"
import path from "node:path"
import type { Pool, QueryResult, QueryResultRow } from "pg"
import { PGlite } from "@electric-sql/pglite"

const DEFAULT_DATA_DIR = path.join(process.cwd(), ".data", "auth-pglite")

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

  constructor(dataDir: string) {
    this.db = new PGlite(dataDir)
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

export async function createEmbeddedAuthPool(
  dataDir = DEFAULT_DATA_DIR,
): Promise<Pool> {
  await mkdir(dataDir, { recursive: true })
  return new PglitePoolAdapter(dataDir) as unknown as Pool
}
