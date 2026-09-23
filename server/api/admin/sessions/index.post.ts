import { inArray, eq, sql } from 'drizzle-orm'
import { defineEventHandler, createError, readValidatedBody } from 'h3'
import { useDb } from '~~/server/db'
import { kategoris, pembicaras, sessionKategoris, sharingSessions } from '~~/server/db/schema'
import { adminSessionSchema } from '~~/shared/schemas/admin'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const body = await readValidatedBody(event, (data) => adminSessionSchema.parse(data))
  const db = useDb(event)

  // 1. Verify speaker exists
  const speaker = await db.query.pembicaras.findFirst({
    where: eq(pembicaras.id, body.pembicaraId),
    columns: { id: true }
  })
  if (!speaker) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pembicara tidak ditemukan'
    })
  }

  // 2. Verify categories exist if provided
  const uniqueCategoryIds = [...new Set(body.kategoriIds)]
  if (uniqueCategoryIds.length > 0) {
    const existingCategories = await db.query.kategoris.findMany({
      where: inArray(kategoris.id, uniqueCategoryIds),
      columns: { id: true }
    })
    if (existingCategories.length !== uniqueCategoryIds.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Satu atau lebih kategori tidak valid'
      })
    }
  }

  // 3. Verify slug uniqueness
  const existingSlug = await db.query.sharingSessions.findFirst({
    where: eq(sharingSessions.slug, body.slug)
  })

  if (existingSlug) {
    throw createError({
      statusCode: 409,
      statusMessage: `Session dengan slug "${body.slug}" sudah ada`
    })
  }

  // 4. Execution based on detected driver capability
  const isD1 =
    typeof (db as unknown as { batch?: (statements: unknown[]) => Promise<unknown> }).batch ===
    'function'

  try {
    if (isD1) {
      // In D1, execute parent insert and category inserts via native batch
      const insertSessionStmt = db
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

      const categoryStmts = uniqueCategoryIds.map((kategoriId) =>
        db.insert(sessionKategoris).values({
          sessionId: sql`(SELECT id FROM sharing_sessions WHERE slug = ${body.slug})`,
          kategoriId
        })
      )

      const batchResults = (await (
        db as unknown as { batch: (stmts: unknown[]) => Promise<unknown[][]> }
      ).batch([insertSessionStmt, ...categoryStmts])) as [
        (typeof sharingSessions.$inferSelect)[],
        ...unknown[]
      ]

      const created = batchResults[0]?.[0]
      if (!created) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Gagal membuat sesi sharing'
        })
      }

      return created
    }

    // Fallback for local development using synchronous better-sqlite3 transaction
    let createdSession: typeof sharingSessions.$inferSelect | undefined
    interface SqliteTx {
      insert: (table: unknown) => {
        values: (val: unknown) => {
          returning: () => { all: () => (typeof sharingSessions.$inferSelect)[] }
          run: () => void
        }
      }
    }

    ;(db as unknown as { transaction: (cb: (tx: SqliteTx) => void) => void }).transaction((tx) => {
      const inserted = tx
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
        .all()

      createdSession = inserted[0]
      if (!createdSession) {
        throw new Error('Gagal mengeksekusi insert sesi')
      }

      if (uniqueCategoryIds.length > 0) {
        for (const catId of uniqueCategoryIds) {
          tx.insert(sessionKategoris)
            .values({
              sessionId: createdSession.id,
              kategoriId: catId
            })
            .run()
        }
      }
    })

    if (!createdSession) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Gagal membuat sesi sharing'
      })
    }

    return createdSession
  } catch (err: unknown) {
    const errorStr = (err as Error)?.message || String(err)
    if (
      errorStr.includes('UNIQUE constraint failed') &&
      errorStr.includes('sharing_sessions.slug')
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: `Session dengan slug "${body.slug}" sudah ada`
      })
    }
    throw err
  }
})
