import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { H3Event } from 'h3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import handler from './index.get'

const MIGRATIONS_DIR = join(process.cwd(), 'migrations')
const SEED_FILE = join(process.cwd(), 'server/db/seed.sql')

function setupDatabase(sqlite: Database.Database) {
  sqlite.pragma('foreign_keys = ON')

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')
    for (const statement of sql.split('--> statement-breakpoint')) {
      const trimmed = statement.trim()
      if (trimmed) sqlite.exec(trimmed)
    }
  }

  const seedSql = readFileSync(SEED_FILE, 'utf8')
  sqlite.exec(seedSql)
}

function createD1Mock(sqlite: Database.Database) {
  return {
    prepare(query: string) {
      let boundParams: unknown[] = []
      return {
        bind(...params: unknown[]) {
          boundParams = params
          return this
        },
        async all() {
          const stmt = sqlite.prepare(query)
          const rows = boundParams.length > 0 ? stmt.all(...boundParams) : stmt.all()
          return {
            results: rows,
            success: true,
            meta: { duration: 0 }
          }
        },
        async run() {
          const stmt = sqlite.prepare(query)
          const info = boundParams.length > 0 ? stmt.run(...boundParams) : stmt.run()
          return {
            results: [],
            success: true,
            meta: { changes: info.changes, last_row_id: info.lastInsertRowid }
          }
        },
        async first(colName?: string) {
          const stmt = sqlite.prepare(query)
          const row = (boundParams.length > 0 ? stmt.get(...boundParams) : stmt.get()) as
            Record<string, unknown> | undefined
          if (!row) return null
          return colName ? row[colName] : row
        },
        async raw() {
          const stmt = sqlite.prepare(query)
          return boundParams.length > 0 ? stmt.raw().all(...boundParams) : stmt.raw().all()
        }
      }
    },
    async batch(statements: Array<{ all: () => Promise<unknown> }>) {
      return Promise.all(statements.map((s) => s.all()))
    },
    async exec(query: string) {
      sqlite.exec(query)
      return { count: 1, duration: 0 }
    }
  }
}

describe('sessions list handler (GET /api/sessions)', () => {
  let sqlite: Database.Database

  beforeEach(() => {
    sqlite = new Database(':memory:')
    setupDatabase(sqlite)
  })

  afterEach(() => {
    sqlite.close()
  })

  function createMockEvent(query: Record<string, string>) {
    const searchParams = new URLSearchParams(query).toString()
    const url = `http://localhost/api/sessions?${searchParams}`
    const req = new Request(url)
    const event = new H3Event(req)
    event.context.cloudflare = {
      env: {
        DB: createD1Mock(sqlite)
      }
    }
    return event
  }

  it('filters out draft sessions from handler response and counts only published', async () => {
    const event = createMockEvent({ page: '1', limit: '20' })
    const result = await (
      handler as unknown as (e: unknown) => Promise<{
        sessions: Array<{ id: number; slug: string; status?: string }>
        pagination: { total: number }
      }>
    )(event)

    expect(result.pagination.total).toBe(12)
    expect(result.sessions.length).toBe(12)
    expect(result.sessions.some((s) => s.slug === 'draft-sesi-belum-tayang')).toBe(false)
  })

  it('orders sessions newest-first by tanggal and resolves same-date by id descending', async () => {
    const event = createMockEvent({ page: '1', limit: '20' })
    const result = await (
      handler as unknown as (e: unknown) => Promise<{
        sessions: Array<{ tanggal: string; id: number; slug: string }>
      }>
    )(event)

    for (let i = 0; i < result.sessions.length - 1; i++) {
      const curr = result.sessions[i]!
      const next = result.sessions[i + 1]!
      if (curr.tanggal === next.tanggal) {
        expect(curr.id).toBeGreaterThan(next.id)
      } else {
        expect(curr.tanggal > next.tanggal).toBe(true)
      }
    }

    const sameDateSessions = result.sessions.filter((s) => s.tanggal === '2026-04-10')
    expect(sameDateSessions.length).toBe(2)
    expect(sameDateSessions[0]!.id).toBe(8)
    expect(sameDateSessions[1]!.id).toBe(7)
  })

  it('paginates accurately across multiple pages with zero overlap', async () => {
    const page1Event = createMockEvent({ page: '1', limit: '5' })
    const page2Event = createMockEvent({ page: '2', limit: '5' })
    const page3Event = createMockEvent({ page: '3', limit: '5' })

    const p1 = await (
      handler as unknown as (e: unknown) => Promise<{
        sessions: Array<{ id: number }>
        pagination: { total: number; totalPages: number; page: number }
      }>
    )(page1Event)

    const p2 = await (
      handler as unknown as (e: unknown) => Promise<{
        sessions: Array<{ id: number }>
        pagination: { total: number; totalPages: number; page: number }
      }>
    )(page2Event)

    const p3 = await (
      handler as unknown as (e: unknown) => Promise<{
        sessions: Array<{ id: number }>
        pagination: { total: number; totalPages: number; page: number }
      }>
    )(page3Event)

    expect(p1.sessions.length).toBe(5)
    expect(p2.sessions.length).toBe(5)
    expect(p3.sessions.length).toBe(2)

    const p1Ids = p1.sessions.map((s) => s.id)
    const p2Ids = p2.sessions.map((s) => s.id)
    const p3Ids = p3.sessions.map((s) => s.id)

    const allIds = [...p1Ids, ...p2Ids, ...p3Ids]
    const uniqueIds = new Set(allIds)

    expect(uniqueIds.size).toBe(12)
    expect(p1.pagination.total).toBe(12)
    expect(p1.pagination.totalPages).toBe(3)
  })

  it('includes speaker and categories and does not leak ringkasan in listing', async () => {
    const event = createMockEvent({ page: '1', limit: '1' })
    const result = await (
      handler as unknown as (e: unknown) => Promise<{
        sessions: Array<Record<string, unknown>>
      }>
    )(event)

    const item = result.sessions[0]!
    expect(item.pembicara).toBeDefined()
    expect((item.pembicara as { nama: string }).nama).toBeDefined()
    expect(Array.isArray(item.kategoris)).toBe(true)
    expect(item.ringkasan).toBeUndefined()
  })

  it('rejects invalid query inputs with 400 error', async () => {
    const invalidEvent = createMockEvent({ page: '-5', limit: '10' })
    await expect(
      (handler as unknown as (e: unknown) => Promise<unknown>)(invalidEvent)
    ).rejects.toThrow()
  })
})
