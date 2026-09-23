import { desc, eq } from 'drizzle-orm'
import { defineEventHandler, setHeader } from 'h3'
import { useDb } from '~~/server/db'
import { sharingSessions } from '~~/server/db/schema'
import { SITE_URL } from '~~/shared/utils/seo'
import { buildSitemapXml, type SitemapItem } from '~~/shared/utils/sitemap'

export default defineEventHandler(async (event) => {
  const db = useDb(event)

  // Only published sessions must appear in sitemap (PRD invariant)
  const publishedSessions = await db.query.sharingSessions.findMany({
    where: eq(sharingSessions.status, 'published'),
    orderBy: [desc(sharingSessions.updatedAt), desc(sharingSessions.tanggal)],
    columns: {
      slug: true,
      updatedAt: true,
      tanggal: true
    }
  })

  const allCategories = await db.query.kategoris.findMany({
    columns: {
      slug: true
    }
  })

  const sitemapItems: SitemapItem[] = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/sesi', changefreq: 'daily', priority: 0.9 },
    { loc: '/tentang', changefreq: 'monthly', priority: 0.5 }
  ]

  for (const session of publishedSessions) {
    const lastmodDate = session.updatedAt
      ? new Date(session.updatedAt).toISOString().split('T')[0]
      : session.tanggal
    sitemapItems.push({
      loc: `/sesi/${session.slug}`,
      lastmod: lastmodDate,
      changefreq: 'weekly',
      priority: 0.8
    })
  }

  for (const category of allCategories) {
    sitemapItems.push({
      loc: `/kategori/${category.slug}`,
      changefreq: 'weekly',
      priority: 0.7
    })
  }

  const xml = buildSitemapXml(SITE_URL, sitemapItems)

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  // Use short cache with must-revalidate to avoid stale sitemaps during content unpublish
  setHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=60')

  return xml
})
