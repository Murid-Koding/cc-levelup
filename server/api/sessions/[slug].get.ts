import { and, desc, eq, inArray, ne } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { useDb } from '~~/server/db'
import { sessionKategoris, sharingSessions } from '~~/server/db/schema'
import type { SessionDetail, SessionSummary } from '~~/shared/types/session'

function sanitizeGoogleDriveLink(url: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return null
    const allowedHosts = ['drive.google.com', 'docs.google.com']
    if (!allowedHosts.includes(parsed.hostname.toLowerCase())) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

export default defineEventHandler(async (event): Promise<SessionDetail> => {
  const slug = getRouterParam(event, 'slug')

  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Slug tidak valid'
    })
  }

  const db = useDb(event)

  // 1. Ambil session utama - WAJIB status = published
  const session = await db.query.sharingSessions.findFirst({
    where: and(eq(sharingSessions.slug, slug), eq(sharingSessions.status, 'published')),
    columns: {
      id: true,
      slug: true,
      judul: true,
      tanggal: true,
      deskripsi: true,
      ringkasan: true,
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

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Sesi tidak ditemukan atau belum dipublikasikan'
    })
  }

  // 2. Ambil sesi terkait: kategori yang sama, status published, bukan sesi ini, limit 3
  const categoryIds = session.sessionKategoris.map((sk) => sk.kategoriId)
  let relatedSessions: SessionSummary[] = []

  if (categoryIds.length > 0) {
    const relatedLinks = await db
      .select({ sessionId: sessionKategoris.sessionId })
      .from(sessionKategoris)
      .innerJoin(sharingSessions, eq(sessionKategoris.sessionId, sharingSessions.id))
      .where(
        and(
          inArray(sessionKategoris.kategoriId, categoryIds),
          ne(sessionKategoris.sessionId, session.id),
          eq(sharingSessions.status, 'published')
        )
      )
      .groupBy(sessionKategoris.sessionId)
      .orderBy(desc(sharingSessions.tanggal), desc(sharingSessions.id))
      .limit(3)

    const targetSessionIds = relatedLinks.map((r) => r.sessionId)

    if (targetSessionIds.length > 0) {
      const relatedItems = await db.query.sharingSessions.findMany({
        where: inArray(sharingSessions.id, targetSessionIds),
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

      relatedSessions = relatedItems.map((item) => ({
        id: item.id,
        slug: item.slug,
        judul: item.judul,
        tanggal: item.tanggal,
        deskripsi: item.deskripsi,
        youtubeVideoId: item.youtubeVideoId,
        linkMateri: sanitizeGoogleDriveLink(item.linkMateri),
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
    }
  }

  return {
    id: session.id,
    slug: session.slug,
    judul: session.judul,
    tanggal: session.tanggal,
    deskripsi: session.deskripsi,
    ringkasan: session.ringkasan,
    youtubeVideoId: session.youtubeVideoId,
    linkMateri: sanitizeGoogleDriveLink(session.linkMateri),
    pembicara: {
      id: session.pembicara.id,
      nama: session.pembicara.nama,
      slug: session.pembicara.slug
    },
    kategoris: session.sessionKategoris.map((sk) => ({
      id: sk.kategori.id,
      nama: sk.kategori.nama,
      slug: sk.kategori.slug
    })),
    relatedSessions
  }
})
