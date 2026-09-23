import { asc } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { useDb } from '~~/server/db'
import { pembicaras } from '~~/server/db/schema'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const db = useDb(event)
  return await db.select().from(pembicaras).orderBy(asc(pembicaras.nama))
})
