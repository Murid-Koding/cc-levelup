import { asc } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { useDb } from '~~/server/db'
import { kategoris } from '~~/server/db/schema'
import type { CategorySummary } from '~~/shared/types/session'

export default defineEventHandler(async (event): Promise<CategorySummary[]> => {
  const db = useDb(event)

  const items = await db
    .select({
      id: kategoris.id,
      nama: kategoris.nama,
      slug: kategoris.slug
    })
    .from(kategoris)
    .orderBy(asc(kategoris.nama))

  return items
})
