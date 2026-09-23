import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import * as schema from './schema'

const MIGRATIONS_DIR = join(process.cwd(), 'migrations')

function applyMigrations(sqlite: Database.Database) {
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
}

describe('core data model', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle<typeof schema>>

  beforeEach(() => {
    sqlite = new Database(':memory:')
    applyMigrations(sqlite)
    db = drizzle(sqlite, { schema })
  })

  afterEach(() => {
    sqlite.close()
  })

  it('writes and reads a session with speaker, categories, and events', async () => {
    await db.insert(schema.pembicaras).values({
      nama: 'Budi Santoso',
      slug: 'budi-santoso'
    })
    await db.insert(schema.kategoris).values([
      { nama: 'Teknologi', slug: 'teknologi' },
      { nama: 'Bisnis', slug: 'bisnis' }
    ])
    await db.insert(schema.sharingSessions).values({
      slug: 'membangun-api-dengan-nuxt',
      judul: 'Membangun API dengan Nuxt',
      pembicaraId: 1,
      tanggal: '2025-09-01',
      deskripsi: 'Pengantar merancang API sederhana di Nuxt.',
      ringkasan: 'Pembahasan route server, validasi, dan status publikasi.',
      youtubeVideoId: 'devVideo001',
      status: 'published'
    })
    await db.insert(schema.sessionKategoris).values([
      { sessionId: 1, kategoriId: 1 },
      { sessionId: 1, kategoriId: 2 }
    ])
    await db.insert(schema.sessionEvents).values({
      sessionId: 1,
      eventType: 'page_view',
      referrer: 'https://example.com'
    })
    await db.insert(schema.settings).values({
      key: 'luma_embed_url',
      value: ''
    })

    const session = await db.query.sharingSessions.findFirst({
      where: eq(schema.sharingSessions.slug, 'membangun-api-dengan-nuxt'),
      with: {
        pembicara: true,
        sessionKategoris: { with: { kategori: true } },
        events: true
      }
    })

    expect(session?.judul).toBe('Membangun API dengan Nuxt')
    expect(session?.status).toBe('published')
    expect(session?.pembicara.nama).toBe('Budi Santoso')
    expect(session?.sessionKategoris.map((row) => row.kategori.slug).sort()).toEqual([
      'bisnis',
      'teknologi'
    ])
    expect(session?.events).toHaveLength(1)
    expect(session?.events[0]?.eventType).toBe('page_view')

    const setting = await db.query.settings.findFirst({
      where: eq(schema.settings.key, 'luma_embed_url')
    })
    expect(setting?.value).toBe('')
  })

  it('rejects duplicate session-category pairs', async () => {
    await db.insert(schema.pembicaras).values({ nama: 'Siti Rahma', slug: 'siti-rahma' })
    await db.insert(schema.kategoris).values({ nama: 'Desain', slug: 'desain' })
    await db.insert(schema.sharingSessions).values({
      slug: 'desain-slide-yang-jelas',
      judul: 'Desain Slide yang Jelas',
      pembicaraId: 1,
      tanggal: '2025-10-15',
      deskripsi: 'Praktik merancang slide sharing session.',
      ringkasan: 'Hierarki visual dan durasi per slide.',
      youtubeVideoId: 'devVideo002',
      status: 'published'
    })
    await db.insert(schema.sessionKategoris).values({ sessionId: 1, kategoriId: 1 })

    await expect(
      db.insert(schema.sessionKategoris).values({ sessionId: 1, kategoriId: 1 })
    ).rejects.toThrow()
  })

  it('enforces unique slugs and speaker foreign keys', async () => {
    await db.insert(schema.pembicaras).values({ nama: 'Andi Wijaya', slug: 'andi-wijaya' })
    await db.insert(schema.sharingSessions).values({
      slug: 'produk-komunitas-yang-bertahan',
      judul: 'Produk Komunitas yang Bertahan',
      pembicaraId: 1,
      tanggal: '2025-11-20',
      deskripsi: 'Menjaga produk komunitas tanpa tim besar.',
      ringkasan: 'Scope MVP dan operasional harian.',
      youtubeVideoId: 'devVideo003',
      status: 'draft'
    })

    await expect(
      db.insert(schema.sharingSessions).values({
        slug: 'produk-komunitas-yang-bertahan',
        judul: 'Duplikat',
        pembicaraId: 1,
        tanggal: '2026-01-10',
        deskripsi: 'Tidak boleh tersimpan.',
        ringkasan: 'Slug harus unik.',
        youtubeVideoId: 'devVideo000',
        status: 'draft'
      })
    ).rejects.toThrow()

    await expect(
      db.insert(schema.sharingSessions).values({
        slug: 'sesi-tanpa-pembicara',
        judul: 'Sesi Tanpa Pembicara',
        pembicaraId: 99,
        tanggal: '2026-03-01',
        deskripsi: 'Tidak boleh tersimpan.',
        ringkasan: 'pembicara_id harus valid.',
        youtubeVideoId: 'devVideo000',
        status: 'draft'
      })
    ).rejects.toThrow()
  })
})
