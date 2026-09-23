import { eq } from 'drizzle-orm'
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { useDb } from '~~/server/db'
import { sharingSessions } from '~~/server/db/schema'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!idParam || !Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid session ID'
    })
  }

  const db = useDb(event)
  const session = await db.query.sharingSessions.findFirst({
    where: eq(sharingSessions.id, id),
    with: {
      pembicara: true,
      sessionKategoris: {
        with: {
          kategori: true
        }
      }
    }
  })

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found'
    })
  }

  return {
    ...session,
    kategoris: session.sessionKategoris.map((sk) => sk.kategori)
  }
})
