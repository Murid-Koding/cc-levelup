import { desc, eq } from 'drizzle-orm'
import { defineEventHandler } from 'h3'
import { useDb } from '~~/server/db'
import { sharingSessions } from '~~/server/db/schema'
import type { SearchIndexItem } from '~~/shared/types/session'

export default defineEventHandler(async (event): Promise<SearchIndexItem[]> => {
  const db = useDb(event)

  const items = await db.query.sharingSessions.findMany({
    where: eq(sharingSessions.status, 'published'),
    orderBy: [desc(sharingSessions.tanggal), desc(sharingSessions.id)],
    columns: {
      id: true,
      slug: true,
      judul: true,
      tanggal: true,
      deskripsi: true,
      ringkasan: true,
      youtubeVideoId: true
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

  return items.map((item) => {
    const rawSnippet = item.ringkasan || item.deskripsi || ''
    const cleanSnippet = rawSnippet.replace(/\s+/g, ' ').trim()
    const snippet = cleanSnippet.length > 150 ? cleanSnippet.slice(0, 150) + '...' : cleanSnippet

    return {
      id: item.id,
      slug: item.slug,
      judul: item.judul,
      pembicara: {
        id: item.pembicara.id,
        nama: item.pembicara.nama,
        slug: item.pembicara.slug
      },
      kategoris: item.sessionKategoris.map((sk) => ({
        id: sk.kategori.id,
        nama: sk.kategori.nama,
        slug: sk.kategori.slug
      })),
      ringkasanSnippet: snippet,
      tanggal: item.tanggal,
      deskripsi: item.deskripsi,
      youtubeVideoId: item.youtubeVideoId
    }
  })
})
