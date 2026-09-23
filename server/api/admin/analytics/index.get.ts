import { eq, sql } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { useDb } from '~~/server/db'
import { sessionEvents, sharingSessions } from '~~/server/db/schema'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const db = useDb(event)

  const stats = await db
    .select({
      sessionId: sessionEvents.sessionId,
      judul: sharingSessions.judul,
      pageViews: sql<number>`sum(case when ${sessionEvents.eventType} = 'page_view' then 1 else 0 end)`,
      videoPlays: sql<number>`sum(case when ${sessionEvents.eventType} = 'video_play' then 1 else 0 end)`
    })
    .from(sessionEvents)
    .innerJoin(sharingSessions, eq(sessionEvents.sessionId, sharingSessions.id))
    .groupBy(sessionEvents.sessionId, sharingSessions.judul)

  return stats.map((row) => ({
    sessionId: row.sessionId,
    judul: row.judul,
    pageViews: Number(row.pageViews || 0),
    videoPlays: Number(row.videoPlays || 0),
    playRatio:
      Number(row.pageViews) > 0
        ? Math.round((Number(row.videoPlays || 0) / Number(row.pageViews)) * 100) / 100
        : 0
  }))
})
