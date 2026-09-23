import { and, eq, ne } from 'drizzle-orm'
import { defineEventHandler, createError, getRouterParam, readValidatedBody } from 'h3'
import { useDb } from '~~/server/db'
import { sessionKategoris, sharingSessions } from '~~/server/db/schema'
import { adminSessionSchema } from '~~/shared/schemas/admin'
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

  const body = await readValidatedBody(event, (data) => adminSessionSchema.parse(data))
  const db = useDb(event)

  const existing = await db.query.sharingSessions.findFirst({
    where: eq(sharingSessions.id, id)
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found'
    })
  }

  const slugConflict = await db.query.sharingSessions.findFirst({
    where: and(eq(sharingSessions.slug, body.slug), ne(sharingSessions.id, id))
  })

  if (slugConflict) {
    throw createError({
      statusCode: 409,
      statusMessage: `Session dengan slug "${body.slug}" sudah ada`
    })
  }

  const [updated] = await db
    .update(sharingSessions)
    .set({
      slug: body.slug,
      judul: body.judul,
      pembicaraId: body.pembicaraId,
      tanggal: body.tanggal,
      deskripsi: body.deskripsi,
      ringkasan: body.ringkasan,
      youtubeVideoId: body.youtubeVideoId,
      linkMateri: body.linkMateri || null,
      status: body.status,
      updatedAt: new Date()
    })
    .where(eq(sharingSessions.id, id))
    .returning()

  await db.delete(sessionKategoris).where(eq(sessionKategoris.sessionId, id))

  if (body.kategoriIds.length > 0) {
    await db.insert(sessionKategoris).values(
      body.kategoriIds.map((kategoriId) => ({
        sessionId: id,
        kategoriId
      }))
    )
  }

  return updated
})
