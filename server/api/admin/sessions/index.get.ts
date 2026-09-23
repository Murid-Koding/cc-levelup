import { desc } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { useDb } from '~~/server/db'
import { sharingSessions } from '~~/server/db/schema'
import { verifyAdminAccess } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyAdminAccess(event)
  const db = useDb(event)

  const items = await db.query.sharingSessions.findMany({
    orderBy: [desc(sharingSessions.tanggal), desc(sharingSessions.id)],
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

  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    judul: item.judul,
    tanggal: item.tanggal,
    status: item.status,
    deskripsi: item.deskripsi,
    ringkasan: item.ringkasan,
    youtubeVideoId: item.youtubeVideoId,
    linkMateri: item.linkMateri,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    pembicara: item.pembicara,
    kategoris: item.sessionKategoris.map((sk) => sk.kategori)
  }))
})
