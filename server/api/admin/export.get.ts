import { createError, defineEventHandler, setHeader } from 'h3'
import { useDb } from '~~/server/db'
import {
  kategoris,
  pembicaras,
  sessionEvents,
  sessionKategoris,
  settings,
  sharingSessions
} from '~~/server/db/schema'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const db = useDb(event)

  // Ensure export is never cached
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, private')

  const qSessions = db.select().from(sharingSessions)
  const qPembicaras = db.select().from(pembicaras)
  const qKategoris = db.select().from(kategoris)
  const qSessionKategoris = db.select().from(sessionKategoris)
  const qSettings = db.select().from(settings)
  const qSessionEvents = db.select().from(sessionEvents)

  let allSessions: (typeof sharingSessions.$inferSelect)[] | undefined
  let allPembicaras: (typeof pembicaras.$inferSelect)[] | undefined
  let allKategoris: (typeof kategoris.$inferSelect)[] | undefined
  let allSessionKategoris: (typeof sessionKategoris.$inferSelect)[] | undefined
  let allSettings: (typeof settings.$inferSelect)[] | undefined
  let allEvents: (typeof sessionEvents.$inferSelect)[] | undefined

  if (
    typeof (db as unknown as { batch?: (queries: unknown[]) => Promise<unknown[][]> }).batch ===
    'function'
  ) {
    // D1 native atomic batch read
    const results = await (
      db as unknown as { batch: (queries: unknown[]) => Promise<unknown[][]> }
    ).batch([qSessions, qPembicaras, qKategoris, qSessionKategoris, qSettings, qSessionEvents])
    allSessions = results[0] as (typeof sharingSessions.$inferSelect)[]
    allPembicaras = results[1] as (typeof pembicaras.$inferSelect)[]
    allKategoris = results[2] as (typeof kategoris.$inferSelect)[]
    allSessionKategoris = results[3] as (typeof sessionKategoris.$inferSelect)[]
    allSettings = results[4] as (typeof settings.$inferSelect)[]
    allEvents = results[5] as (typeof sessionEvents.$inferSelect)[]
  } else if (
    import.meta.dev &&
    typeof (db as unknown as { transaction?: (cb: () => void) => void }).transaction === 'function'
  ) {
    // SQLite local synchronous transaction read
    interface QuerySync<T> {
      all: () => T[]
    }
    ;(db as unknown as { transaction: (cb: () => void) => void }).transaction(() => {
      allSessions = (qSessions as unknown as QuerySync<typeof sharingSessions.$inferSelect>).all()
      allPembicaras = (qPembicaras as unknown as QuerySync<typeof pembicaras.$inferSelect>).all()
      allKategoris = (qKategoris as unknown as QuerySync<typeof kategoris.$inferSelect>).all()
      allSessionKategoris = (
        qSessionKategoris as unknown as QuerySync<typeof sessionKategoris.$inferSelect>
      ).all()
      allSettings = (qSettings as unknown as QuerySync<typeof settings.$inferSelect>).all()
      allEvents = (qSessionEvents as unknown as QuerySync<typeof sessionEvents.$inferSelect>).all()
    })
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Atomic read transaction support is required'
    })
  }

  if (
    !allSessions ||
    !allPembicaras ||
    !allKategoris ||
    !allSessionKategoris ||
    !allSettings ||
    !allEvents
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal mengambil snapshot arsip data'
    })
  }

  return {
    exportedAt: new Date().toISOString(),
    sharingSessions: allSessions,
    pembicaras: allPembicaras,
    kategoris: allKategoris,
    sessionKategoris: allSessionKategoris,
    settings: allSettings,
    sessionEvents: allEvents
  }
})
