import { defineEventHandler } from 'h3'
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

  const [allSessions, allPembicaras, allKategoris, allSessionKategoris, allSettings, allEvents] =
    await Promise.all([
      db.select().from(sharingSessions),
      db.select().from(pembicaras),
      db.select().from(kategoris),
      db.select().from(sessionKategoris),
      db.select().from(settings),
      db.select().from(sessionEvents)
    ])

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
