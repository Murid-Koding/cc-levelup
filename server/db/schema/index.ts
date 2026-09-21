import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core'

export const sharingSessions = sqliteTable(
  'sharing_sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull(),
    judul: text('judul').notNull(),
    pembicaraId: integer('pembicara_id')
      .notNull()
      .references(() => pembicaras.id),
    tanggal: integer('tanggal', { mode: 'timestamp' }).notNull(),
    deskripsi: text('deskripsi').notNull(),
    ringkasan: text('ringkasan').notNull(),
    youtubeVideoId: text('youtube_video_id').notNull(),
    linkMateri: text('link_materi'),
    status: text('status', { enum: ['draft', 'published'] })
      .notNull()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`)
  },
  (table) => [
    uniqueIndex('sharing_sessions_slug_idx').on(table.slug),
    index('sharing_sessions_status_tanggal_idx').on(table.status, table.tanggal)
  ]
)

export const pembicaras = sqliteTable(
  'pembicaras',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nama: text('nama').notNull(),
    slug: text('slug').notNull(),
    bio: text('bio')
  },
  (table) => [uniqueIndex('pembicaras_slug_idx').on(table.slug)]
)

export const kategoris = sqliteTable(
  'kategoris',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nama: text('nama').notNull(),
    slug: text('slug').notNull()
  },
  (table) => [uniqueIndex('kategoris_slug_idx').on(table.slug)]
)

export const sessionKategoris = sqliteTable(
  'session_kategoris',
  {
    sessionId: integer('session_id')
      .notNull()
      .references(() => sharingSessions.id),
    kategoriId: integer('kategori_id')
      .notNull()
      .references(() => kategoris.id)
  },
  (table) => [
    index('session_kategoris_session_id_idx').on(table.sessionId),
    index('session_kategoris_kategori_id_idx').on(table.kategoriId)
  ]
)

export const sessionEvents = sqliteTable(
  'session_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionId: integer('session_id')
      .notNull()
      .references(() => sharingSessions.id),
    eventType: text('event_type', { enum: ['page_view', 'video_play'] }).notNull(),
    timestamp: integer('timestamp', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    referrer: text('referrer')
  },
  (table) => [index('session_events_session_id_idx').on(table.sessionId)]
)

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
})
