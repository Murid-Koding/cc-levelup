import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { H3Event } from 'h3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type {
  CategoryDetailResponse,
  CategorySummary,
  SearchIndexItem
} from '~~/shared/types/session'
import categoryDetailHandler from './categories/[slug].get'
import categoriesHandler from './categories/index.get'
import searchIndexHandler from './search-index.get'

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

describe('Discovery Endpoints', () => {
  let sqlite: Database.Database

  beforeEach(() => {
    sqlite = new Database(':memory:')
    setupDatabase(sqlite)
  })

  afterEach(() => {
    sqlite.close()
  })

  function createMockEvent(url: string, params?: Record<string, string>): H3Event {
    const req = new Request(url)
    const event = new H3Event(req)
    if (params) {
      event.context.params = params
    }
    event.context.cloudflare = {
      env: {
        DB: createD1Mock(sqlite)
      }
    }
    return event
  }

  describe('GET /api/search-index', () => {
    it('mengembalikan hanya sesi published dan mengecualikan draft dengan payload bersih', async () => {
      const event = createMockEvent('http://localhost/api/search-index')
      const result = await (
        searchIndexHandler as unknown as (e: unknown) => Promise<SearchIndexItem[]>
      )(event)

      // Total di seed ada 12 published dan 1 draft
      expect(result.length).toBe(12)
      expect(result.some((item) => item.slug === 'draft-sesi-belum-tayang')).toBe(false)

      const first = result[0]
      expect(first).toHaveProperty('id')
      expect(first).toHaveProperty('slug')
      expect(first).toHaveProperty('judul')
      expect(first.pembicara).toHaveProperty('nama')
      expect(first.pembicara).toHaveProperty('slug')
      expect(first.kategoris.length).toBeGreaterThan(0)
      expect(first.kategoris[0]).toHaveProperty('slug')
      expect(first.ringkasanSnippet.length).toBeLessThanOrEqual(153)
    })
  })

  describe('GET /api/categories', () => {
    it('mengembalikan daftar kategori terurut abjad', async () => {
      const event = createMockEvent('http://localhost/api/categories')
      const result = await (
        categoriesHandler as unknown as (e: unknown) => Promise<CategorySummary[]>
      )(event)

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('nama')
      expect(result[0]).toHaveProperty('slug')

      const names = result.map((r) => r.nama)
      const sortedNames = [...names].sort()
      expect(names).toEqual(sortedNames)
    })
  })

  describe('GET /api/categories/[slug]', () => {
    it('mengembalikan detail kategori beserta sesi terpaginasi', async () => {
      const event = createMockEvent('http://localhost/api/categories/teknologi?page=1&limit=5', {
        slug: 'teknologi'
      })
      const result = await (
        categoryDetailHandler as unknown as (e: unknown) => Promise<CategoryDetailResponse>
      )(event)

      expect(result.kategori.slug).toBe('teknologi')
      expect(result.kategori.nama).toBe('Teknologi')
      expect(result.sessions.length).toBeLessThanOrEqual(5)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(5)
      expect(result.pagination.total).toBeGreaterThan(0)
      expect(result.sessions.every((s) => s.kategoris.some((k) => k.slug === 'teknologi'))).toBe(
        true
      )
      expect(result.sessions.some((s) => s.slug === 'draft-sesi-belum-tayang')).toBe(false)
    })

    it('mendukung kategori kosong tanpa error (empty state)', async () => {
      sqlite
        .prepare(
          "INSERT INTO kategoris (id, nama, slug) VALUES (99, 'Kategori Baru', 'kategori-baru')"
        )
        .run()

      const event = createMockEvent('http://localhost/api/categories/kategori-baru', {
        slug: 'kategori-baru'
      })
      const result = await (
        categoryDetailHandler as unknown as (e: unknown) => Promise<CategoryDetailResponse>
      )(event)

      expect(result.kategori.slug).toBe('kategori-baru')
      expect(result.sessions.length).toBe(0)
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })

    it('melempar 404 jika slug kategori tidak ditemukan', async () => {
      const event = createMockEvent('http://localhost/api/categories/non-existent', {
        slug: 'non-existent'
      })
      await expect(
        (categoryDetailHandler as unknown as (e: unknown) => Promise<unknown>)(event)
      ).rejects.toThrowError(
        expect.objectContaining({
          statusCode: 404
        })
      )
    })

    it('melempar 400 jika format slug tidak valid', async () => {
      const event = createMockEvent('http://localhost/api/categories/bad_slug!', {
        slug: 'bad_slug!'
      })
      await expect(
        (categoryDetailHandler as unknown as (e: unknown) => Promise<unknown>)(event)
      ).rejects.toThrowError(
        expect.objectContaining({
          statusCode: 400
        })
      )
    })
  })
})
