export interface SitemapItem {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export function buildSitemapXml(baseUrl: string, items: SitemapItem[]): string {
  const cleanBase = baseUrl.replace(/\/+$/, '')
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ]

  for (const item of items) {
    const loc = item.loc.startsWith('http')
      ? item.loc
      : `${cleanBase}${item.loc.startsWith('/') ? '' : '/'}${item.loc}`
    xmlLines.push('  <url>')
    xmlLines.push(`    <loc>${escapeXml(loc)}</loc>`)
    if (item.lastmod) {
      xmlLines.push(`    <lastmod>${escapeXml(item.lastmod)}</lastmod>`)
    }
    if (item.changefreq) {
      xmlLines.push(`    <changefreq>${item.changefreq}</changefreq>`)
    }
    if (typeof item.priority === 'number') {
      xmlLines.push(`    <priority>${item.priority.toFixed(1)}</priority>`)
    }
    xmlLines.push('  </url>')
  }

  xmlLines.push('</urlset>')
  return xmlLines.join('\n')
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
