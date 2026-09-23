import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { H3Event } from 'h3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { SessionDetail, SessionSummary } from '~~/shared/types/session'
import handler from './[slug].get'

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

describe('GET /api/sessions/[slug]', () => {
  let sqlite: Database.Database

  beforeEach(() => {
    sqlite = new Database(':memory:')
    setupDatabase(sqlite)
  })

  afterEach(() => {
    sqlite.close()
  })

  function createMockEvent(slug: string | undefined): H3Event {
    const url = `http://localhost/api/sessions/${slug ?? ''}`
    const req = new Request(url)
    const event = new H3Event(req)
    event.context.params = { slug }
    event.context.cloudflare = {
      env: {
        DB: createD1Mock(sqlite)
      }
    }
    return event
  }

  it('mengembalikan detail sesi published beserta pembicara, ringkasan, dan related sessions', async () => {
    const event = createMockEvent('membangun-api-dengan-nuxt')
    const result = (await (handler as unknown as (e: unknown) => Promise<SessionDetail>)(
      event
    )) as SessionDetail

    expect(result.id).toBe(1)
    expect(result.slug).toBe('membangun-api-dengan-nuxt')
    expect(result.judul).toBe('Membangun API dengan Nuxt')
    expect(result.ringkasan).toBeTruthy()
    expect(result.pembicara.nama).toBe('Budi Santoso')
    // Bio pembicara tidak diekspos di scope MVP publik
    expect((result.pembicara as Record<string, unknown>).bio).toBeUndefined()
    expect(result.linkMateri).toBe(
      'https://drive.google.com/drive/folders/membangun-api-dengan-nuxt-test'
    )
    expect(result.kategoris.length).toBeGreaterThan(0)
    expect(result.relatedSessions).toBeDefined()
    expect(result.relatedSessions.length).toBeLessThanOrEqual(3)
    // Sesi 1 memiliki kategori Teknologi (1) dan Product (6)
    // Sesi terkait tidak boleh memuat Sesi 1 itu sendiri
    expect(result.relatedSessions.some((s: SessionSummary) => s.id === 1)).toBe(false)
  })

  it('hanya menerima tautan materi yang berasal dari Google Drive', async () => {
    // Sisipkan sesi dengan tautan materi bukan google drive
    sqlite
      .prepare(
        "INSERT INTO sharing_sessions (id, slug, judul, pembicara_id, tanggal, deskripsi, ringkasan, youtube_video_id, link_materi, status) VALUES (99, 'sesi-bad-link', 'Bad Link', 1, '2026-08-01', 'desk', 'ringkasan text', 'vid99', 'https://malicious.example.com/slide', 'published')"
      )
      .run()

    const event = createMockEvent('sesi-bad-link')
    const result = (await (handler as unknown as (e: unknown) => Promise<SessionDetail>)(
      event
    )) as SessionDetail

    expect(result.linkMateri).toBeNull()
  })

  it('melempar 404 jika slug adalah sesi draft', async () => {
    // Sesi id 6 di seed adalah 'draft-sesi-belum-tayang'
    const event = createMockEvent('draft-sesi-belum-tayang')

    await expect(
      (handler as unknown as (e: unknown) => Promise<unknown>)(event)
    ).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404
      })
    )
  })

  it('melempar 404 jika slug tidak ditemukan', async () => {
    const event = createMockEvent('sesi-yang-tidak-pernah-ada')

    await expect(
      (handler as unknown as (e: unknown) => Promise<unknown>)(event)
    ).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404
      })
    )
  })

  it('melempar 400 jika format slug tidak valid', async () => {
    const event = createMockEvent('slug_dengan_underscore!')

    await expect(
      (handler as unknown as (e: unknown) => Promise<unknown>)(event)
    ).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 400
      })
    )
  })

  it('sesi terkait tidak boleh mengandung sesi draft dan maksimal 3 item', async () => {
    // Sisipkan draft dengan tanggal sangat baru pada kategori 1
    sqlite
      .prepare(
        "INSERT INTO sharing_sessions (id, slug, judul, pembicara_id, tanggal, deskripsi, ringkasan, youtube_video_id, status) VALUES (100, 'draft-terbaru', 'Draft Terbaru', 1, '2026-12-01', 'desk', 'ringkasan text', 'vid100', 'draft')"
      )
      .run()
    sqlite.prepare('INSERT INTO session_kategoris (session_id, kategori_id) VALUES (100, 1)').run()

    const event = createMockEvent('pengenalan-typescript-modern')
    const result = (await (handler as unknown as (e: unknown) => Promise<SessionDetail>)(
      event
    )) as SessionDetail

    expect(result.relatedSessions.length).toBeLessThanOrEqual(3)
    expect(
      result.relatedSessions.some((s: SessionSummary) => s.slug === 'draft-sesi-belum-tayang')
    ).toBe(false)
    expect(result.relatedSessions.some((s: SessionSummary) => s.slug === 'draft-terbaru')).toBe(
      false
    )
  })
})
