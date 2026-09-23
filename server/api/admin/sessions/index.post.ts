import { eq } from 'drizzle-orm'
import { defineEventHandler, createError, readValidatedBody } from 'h3'
import { useDb } from '~~/server/db'
import { sessionKategoris, sharingSessions } from '~~/server/db/schema'
import { adminSessionSchema } from '~~/shared/schemas/admin'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const body = await readValidatedBody(event, (data) => adminSessionSchema.parse(data))
  const db = useDb(event)

  const existingSlug = await db.query.sharingSessions.findFirst({
    where: eq(sharingSessions.slug, body.slug)
  })

  if (existingSlug) {
    throw createError({
      statusCode: 409,
      statusMessage: `Session dengan slug "${body.slug}" sudah ada`
    })
  }

  const [created] = await db
    .insert(sharingSessions)
    .values({
      slug: body.slug,
      judul: body.judul,
      pembicaraId: body.pembicaraId,
      tanggal: body.tanggal,
      deskripsi: body.deskripsi,
      ringkasan: body.ringkasan,
      youtubeVideoId: body.youtubeVideoId,
      linkMateri: body.linkMateri || null,
      status: body.status
    })
    .returning()

  if (body.kategoriIds.length > 0) {
    await db.insert(sessionKategoris).values(
      body.kategoriIds.map((kategoriId) => ({
        sessionId: created.id,
        kategoriId
      }))
    )
  }

  return created
})
