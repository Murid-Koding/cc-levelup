#!/usr/bin/env node

import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'

const DATA_DIR = join(process.cwd(), '.data')
const DB_PATH = join(DATA_DIR, 'local.sqlite')
const MIGRATIONS_DIR = join(process.cwd(), 'migrations')
const SEED_FILE = join(process.cwd(), 'server/db/seed.sql')

function getDb() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
  const db = new Database(DB_PATH)
  db.pragma('foreign_keys = ON')
  return db
}

function runMigrations() {
  console.log(`[db-local] Menjalankan migrasi ke ${DB_PATH}...`)
  const db = getDb()

  // Track applied migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS __drizzle_local_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const appliedRows = db.prepare('SELECT name FROM __drizzle_local_migrations').all()
  const appliedSet = new Set(appliedRows.map((r) => r.name))

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  let count = 0
  for (const file of files) {
    if (appliedSet.has(file)) {
      continue
    }

    console.log(`  -> Menerapkan migrasi: ${file}`)
    const content = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')
    const statements = content
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean)

    db.transaction(() => {
      for (const stmt of statements) {
        db.exec(stmt)
      }
      db.prepare('INSERT INTO __drizzle_local_migrations (name) VALUES (?)').run(file)
    })()

    count++
  }

  if (count === 0) {
    console.log('[db-local] Database lokal sudah up-to-date.')
  } else {
    console.log(`[db-local] Berhasil menerapkan ${count} file migrasi.`)
  }
}

function runSeed() {
  console.log(`[db-local] Mengisi seed data ke ${DB_PATH}...`)
  const db = getDb()

  if (!existsSync(SEED_FILE)) {
    console.error(`[db-local] Error: File seed tidak ditemukan di ${SEED_FILE}`)
    process.exit(1)
  }

  const sql = readFileSync(SEED_FILE, 'utf-8')

  // Execute seeding statements inside a single transaction to guarantee atomic execution
  db.transaction(() => {
    db.exec(sql)
  })()

  const sessionCount = db.prepare('SELECT count(*) as count FROM sharing_sessions').get()
  const speakerCount = db.prepare('SELECT count(*) as count FROM pembicaras').get()
  const categoryCount = db.prepare('SELECT count(*) as count FROM kategoris').get()

  console.log('[db-local] Berhasil mengisi seed data:')
  console.log(`  - Pembicara : ${speakerCount.count}`)
  console.log(`  - Kategori  : ${categoryCount.count}`)
  console.log(`  - Sesi      : ${sessionCount.count}`)
}

const command = process.argv[2]
if (command === 'migrate') {
  runMigrations()
} else if (command === 'seed') {
  runSeed()
} else {
  console.log('Penggunaan: node scripts/db-local.mjs [migrate|seed]')
  process.exit(1)
}
