import { eq } from 'drizzle-orm'
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { useDb } from '~~/server/db'
import { sessionEvents, sessionKategoris, sharingSessions } from '~~/server/db/schema'
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

  const existing = await db.query.sharingSessions.findFirst({
    where: eq(sharingSessions.id, id)
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found'
    })
  }

  // 1. D1 native atomic batch execution
  if (typeof (db as { batch?: (statements: unknown[]) => Promise<unknown> }).batch === 'function') {
    const deleteEventsStmt = db.delete(sessionEvents).where(eq(sessionEvents.sessionId, id))
    const deleteCategoriesStmt = db
      .delete(sessionKategoris)
      .where(eq(sessionKategoris.sessionId, id))
    const deleteSessionStmt = db.delete(sharingSessions).where(eq(sharingSessions.id, id))

    await (db as { batch: (statements: unknown[]) => Promise<unknown> }).batch([
      deleteEventsStmt,
      deleteCategoriesStmt,
      deleteSessionStmt
    ])
  } else if (
    typeof (db as unknown as { transaction?: (cb: (tx: unknown) => unknown) => unknown })
      .transaction === 'function'
  ) {
    // 2. SQLite local fallback using synchronous transaction (better-sqlite3)
    interface SqliteTx {
      delete: (table: unknown) => { where: (condition: unknown) => { run: () => void } }
    }
    ;(db as unknown as { transaction: (cb: (tx: SqliteTx) => void) => void }).transaction((tx) => {
      tx.delete(sessionEvents).where(eq(sessionEvents.sessionId, id)).run()
      tx.delete(sessionKategoris).where(eq(sessionKategoris.sessionId, id)).run()
      tx.delete(sharingSessions).where(eq(sharingSessions.id, id)).run()
    })
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Atomic transaction support is required'
    })
  }

  return { success: true }
})
