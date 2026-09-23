import { and, desc, eq, sql } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam, getValidatedQuery } from 'h3'
import { useDb } from '~~/server/db'
import { kategoris, sessionKategoris, sharingSessions } from '~~/server/db/schema'
import { sessionListQuerySchema } from '~~/shared/schemas/session'
import type { CategoryDetailResponse } from '~~/shared/types/session'

export default defineEventHandler(async (event): Promise<CategoryDetailResponse> => {
  const slug = getRouterParam(event, 'slug')

  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Slug kategori tidak valid'
    })
  }

  const query = await getValidatedQuery(event, (data) => sessionListQuerySchema.parse(data))
  const db = useDb(event)

  const kategori = await db.query.kategoris.findFirst({
    where: eq(kategoris.slug, slug),
    columns: {
      id: true,
      nama: true,
      slug: true
    }
  })

  if (!kategori) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Kategori tidak ditemukan'
    })
  }

  const offset = (query.page - 1) * query.limit

  const totalRows = await db
    .select({ count: sql<number>`count(distinct ${sharingSessions.id})` })
    .from(sharingSessions)
    .innerJoin(sessionKategoris, eq(sharingSessions.id, sessionKategoris.sessionId))
    .where(
      and(eq(sessionKategoris.kategoriId, kategori.id), eq(sharingSessions.status, 'published'))
    )

  const total = Number(totalRows[0]?.count ?? 0)

  const rows = await db
    .select({
      id: sharingSessions.id
    })
    .from(sharingSessions)
    .innerJoin(sessionKategoris, eq(sharingSessions.id, sessionKategoris.sessionId))
    .where(
      and(eq(sessionKategoris.kategoriId, kategori.id), eq(sharingSessions.status, 'published'))
    )
    .orderBy(desc(sharingSessions.tanggal), desc(sharingSessions.id))
    .limit(query.limit)
    .offset(offset)

  const targetIds = rows.map((r) => r.id)

  const items =
    targetIds.length > 0
      ? await db.query.sharingSessions.findMany({
          where: and(
            eq(sharingSessions.status, 'published'),
            sql`${sharingSessions.id} IN (${sql.join(
              targetIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          ),
          orderBy: [desc(sharingSessions.tanggal), desc(sharingSessions.id)],
          columns: {
            id: true,
            slug: true,
            judul: true,
            tanggal: true,
            deskripsi: true,
            youtubeVideoId: true,
            linkMateri: true
          },
          with: {
            pembicara: {
              columns: {
                id: true,
                nama: true,
                slug: true
              }
            },
            sessionKategoris: {
              with: {
                kategori: {
                  columns: {
                    id: true,
                    nama: true,
                    slug: true
                  }
                }
              }
            }
          }
        })
      : []

  const sessions = items.map((it) => ({
    id: it.id,
    slug: it.slug,
    judul: it.judul,
    tanggal: it.tanggal,
    deskripsi: it.deskripsi,
    youtubeVideoId: it.youtubeVideoId,
    linkMateri: it.linkMateri,
    pembicara: {
      id: it.pembicara.id,
      nama: it.pembicara.nama,
      slug: it.pembicara.slug
    },
    kategoris: it.sessionKategoris.map((sk) => ({
      id: sk.kategori.id,
      nama: sk.kategori.nama,
      slug: sk.kategori.slug
    }))
  }))

  return {
    kategori,
    sessions,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  }
})
