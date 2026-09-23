import { desc, eq, sql } from 'drizzle-orm'
import { defineEventHandler, getValidatedQuery } from 'h3'
import { sessionListQuerySchema } from '~~/shared/schemas/session'
import { useDb } from '~~/server/db'
import { sharingSessions } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (data) => sessionListQuerySchema.parse(data))
  const db = useDb(event)

  const offset = (query.page - 1) * query.limit

  const totalRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(sharingSessions)
    .where(eq(sharingSessions.status, 'published'))

  const total = Number(totalRows[0]?.count ?? 0)

  const items = await db.query.sharingSessions.findMany({
    where: eq(sharingSessions.status, 'published'),
    orderBy: [desc(sharingSessions.tanggal), desc(sharingSessions.id)],
    limit: query.limit,
    offset,
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
        columns: {
          sessionId: true,
          kategoriId: true
        },
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

  const sessions = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    judul: item.judul,
    tanggal: item.tanggal,
    deskripsi: item.deskripsi,
    youtubeVideoId: item.youtubeVideoId,
    linkMateri: item.linkMateri,
    pembicara: {
      id: item.pembicara.id,
      nama: item.pembicara.nama,
      slug: item.pembicara.slug
    },
    kategoris: item.sessionKategoris.map((sk) => ({
      id: sk.kategori.id,
      nama: sk.kategori.nama,
      slug: sk.kategori.slug
    }))
  }))

  return {
    sessions,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  }
})
