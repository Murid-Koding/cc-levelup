import { and, eq } from 'drizzle-orm'
import { createError, defineEventHandler, readValidatedBody } from 'h3'
import { useDb } from '~~/server/db'
import { sessionEvents, sharingSessions } from '~~/server/db/schema'
import { createEventSchema } from '~~/shared/schemas/event'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (data) => createEventSchema.parse(data))
  const db = useDb(event)

  const session = await db.query.sharingSessions.findFirst({
    where: and(eq(sharingSessions.id, body.sessionId), eq(sharingSessions.status, 'published')),
    columns: { id: true }
  })

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found or not published'
    })
  }

  // Preserve explicit null for direct visits. If referrer is provided, ensure trimmed bounds.
  const referrer =
    body.referrer && typeof body.referrer === 'string'
      ? body.referrer.trim().slice(0, 500) || null
      : null

  await db.insert(sessionEvents).values({
    sessionId: body.sessionId,
    eventType: body.eventType,
    referrer
  })

  return { success: true }
})
