import { and, eq, inArray, ne } from 'drizzle-orm'
import { defineEventHandler, createError, getRouterParam, readValidatedBody } from 'h3'
import { useDb } from '~~/server/db'
import { kategoris, pembicaras, sessionKategoris, sharingSessions } from '~~/server/db/schema'
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
  const slugConflict = await db.query.sharingSessions.findFirst({
    where: and(eq(sharingSessions.slug, body.slug), ne(sharingSessions.id, id))
  })

  if (slugConflict) {
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
      // In D1, update session, delete old categories, insert new categories in single native batch
      const updateSessionStmt = db
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

      const deleteCategoriesStmt = db
        .delete(sessionKategoris)
        .where(eq(sessionKategoris.sessionId, id))

      const insertCategoryStmts = uniqueCategoryIds.map((kategoriId) =>
        db.insert(sessionKategoris).values({
          sessionId: id,
          kategoriId
        })
      )

      const batchResults = (await (
        db as unknown as { batch: (stmts: unknown[]) => Promise<unknown[][]> }
      ).batch([updateSessionStmt, deleteCategoriesStmt, ...insertCategoryStmts])) as [
        (typeof sharingSessions.$inferSelect)[],
        ...unknown[]
      ]

      const updated = batchResults[0]?.[0]
      if (!updated) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Session not found or update failed'
        })
      }

      return updated
    }

    // Fallback for local development using synchronous better-sqlite3 transaction
    let updatedSession: typeof sharingSessions.$inferSelect | undefined
    interface SqliteTx {
      update: (table: unknown) => {
        set: (val: unknown) => {
          where: (cond: unknown) => {
            returning: () => { all: () => (typeof sharingSessions.$inferSelect)[] }
          }
        }
      }
      delete: (table: unknown) => { where: (cond: unknown) => { run: () => void } }
      insert: (table: unknown) => { values: (val: unknown) => { run: () => void } }
    }

    ;(db as unknown as { transaction: (cb: (tx: SqliteTx) => void) => void }).transaction((tx) => {
      const updated = tx
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
        .all()

      updatedSession = updated[0]
      if (!updatedSession) {
        throw new Error('NOT_FOUND_OR_FAILED')
      }

      tx.delete(sessionKategoris).where(eq(sessionKategoris.sessionId, id)).run()

      if (uniqueCategoryIds.length > 0) {
        for (const catId of uniqueCategoryIds) {
          tx.insert(sessionKategoris)
            .values({
              sessionId: id,
              kategoriId: catId
            })
            .run()
        }
      }
    })

    if (!updatedSession) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Session not found or update failed'
      })
    }

    return updatedSession
  } catch (err: unknown) {
    const errorStr = (err as Error)?.message || String(err)
    if (errorStr.includes('NOT_FOUND_OR_FAILED')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Session not found or update failed'
      })
    }
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
