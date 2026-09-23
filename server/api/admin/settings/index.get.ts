import { defineEventHandler } from 'h3'
import { useDb } from '~~/server/db'
import { settings } from '~~/server/db/schema'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const db = useDb(event)
  const list = await db.select().from(settings)
  return list
})
