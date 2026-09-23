import { describe, expect, it } from 'vitest'
import { buildSitemapXml, type SitemapItem } from './sitemap'

describe('buildSitemapXml XML validity and rules', () => {
  it('generates valid parseable XML structure', () => {
    const items: SitemapItem[] = [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/sesi/vue-3-deep-dive', lastmod: '2026-09-23', changefreq: 'weekly', priority: 0.8 },
      { loc: '/kategori/frontend', changefreq: 'weekly', priority: 0.7 }
    ]

    const xml = buildSitemapXml('https://cclevelup.web.id', items)

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml.endsWith('</urlset>')).toBe(true)
    expect(xml).toContain('<loc>https://cclevelup.web.id/</loc>')
    expect(xml).toContain('<loc>https://cclevelup.web.id/sesi/vue-3-deep-dive</loc>')
    expect(xml).toContain('<lastmod>2026-09-23</lastmod>')
    expect(xml).toContain('<loc>https://cclevelup.web.id/kategori/frontend</loc>')
  })

  it('escapes XML reserved characters properly in loc string', () => {
    const items: SitemapItem[] = [{ loc: '/kategori/web-&-mobile' }]
    const xml = buildSitemapXml('https://cclevelup.web.id', items)
    expect(xml).toContain('<loc>https://cclevelup.web.id/kategori/web-&amp;-mobile</loc>')
    expect(xml).not.toContain('<loc>https://cclevelup.web.id/kategori/web-&-mobile</loc>')
  })
})
