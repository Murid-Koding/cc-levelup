import { eq } from 'drizzle-orm'
import { defineEventHandler, setHeader } from 'h3'
import { useDb } from '~~/server/db'
import { settings } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const db = useDb(event)

  // Public cache header for edge performance (short TTL with revalidation)
  setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=30')

  const setting = await db.query.settings.findFirst({
    where: eq(settings.key, 'luma_embed_url')
  })

  return {
    lumaEmbedUrl: setting?.value || ''
  }
})
