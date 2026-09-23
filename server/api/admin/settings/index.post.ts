import { eq } from 'drizzle-orm'
import { defineEventHandler, readValidatedBody } from 'h3'
import { useDb } from '~~/server/db'
import { settings } from '~~/server/db/schema'
import { adminSettingSchema } from '~~/shared/schemas/admin'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const body = await readValidatedBody(event, (data) => adminSettingSchema.parse(data))
  const db = useDb(event)

  const existing = await db.query.settings.findFirst({
    where: eq(settings.key, body.key)
  })

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set({ value: body.value })
      .where(eq(settings.key, body.key))
      .returning()
    return updated
  }

  const [created] = await db.insert(settings).values(body).returning()
  return created
})
