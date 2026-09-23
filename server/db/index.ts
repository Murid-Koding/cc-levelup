import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { drizzle as drizzleD1, type DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import type { H3Event } from 'h3'
import * as schema from './schema'

export type AppDatabase = DrizzleD1Database<typeof schema>

let devSqliteDb: Database.Database | null = null

function getLocalD1Database(): Database.Database {
  if (devSqliteDb) return devSqliteDb

  const d1Dir = join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject')
  if (!existsSync(d1Dir)) {
    throw new Error(
      `Direktori D1 lokal belum ada di ${d1Dir}. Jalankan "pnpm db:migrate:local" terlebih dahulu.`
    )
  }

  const files = readdirSync(d1Dir).filter((f) => f.endsWith('.sqlite') && !f.startsWith('metadata'))

  if (files.length === 0) {
    throw new Error(
      `Database SQLite lokal tidak ditemukan di ${d1Dir}. Jalankan "pnpm db:migrate:local".`
    )
  }

  const dbPath = join(d1Dir, files[0]!)
  devSqliteDb = new Database(dbPath)
  devSqliteDb.pragma('foreign_keys = ON')
  return devSqliteDb
}

export function useDb(event: H3Event): AppDatabase {
  // 1. Production Cloudflare Worker binding
  const cloudflare = event.context?.cloudflare as { env?: { DB?: unknown } } | undefined
  const binding = cloudflare?.env?.DB as Parameters<typeof drizzleD1>[0] | undefined

  if (binding) {
    return drizzleD1(binding, { schema })
  }

  // 2. Development mode fallback: gunakan database D1 lokal yang dibuat oleh Wrangler
  if (import.meta.dev) {
    const localDb = getLocalD1Database()
    return drizzleSqlite(localDb, { schema }) as unknown as AppDatabase
  }

  throw new Error('D1 binding "DB" is not configured')
}
