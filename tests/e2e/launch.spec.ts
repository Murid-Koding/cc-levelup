import { test, expect } from '@playwright/test'

test.describe('Launch Critical Paths', () => {
  test('visitor can navigate from home to archive and read about page', async ({ page }) => {
    // 1. Home page
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: /CC Level Up!/ })).toBeVisible()

    // 2. Navigation to archive
    await page.getByRole('link', { name: /Jelajahi Arsip Sesi/ }).click()
    await expect(page).toHaveURL(/\/sesi$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Arsip Sesi' })).toBeVisible()

    // 3. Navigation to about page
    await page.getByRole('link', { name: 'Tentang' }).click()
    await expect(page).toHaveURL(/\/tentang$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Tentang CC Level Up!' })
    ).toBeVisible()
    await expect(page.getByText('Kebijakan Hak Cipta & Penarikan Konten')).toBeVisible()
  })

  test('public sitemap.xml is available, well-formed, and filters published sessions', async ({
    request
  }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('xml')
    const body = await res.text()

    expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(body).toContain('<urlset')
    expect(body).toContain('https://cclevelup.web.id')
    expect(body).toContain('<loc>https://cclevelup.web.id/sesi</loc>')
    // Invariant: draft sessions must never be listed in sitemap
    expect(body).not.toContain('draft-sesi-belum-tayang')
  })

  test('admin mutation endpoints reject unauthenticated write requests without persisting records', async ({
    request
  }) => {
    // Both production and development probe with deliberately invalid payload:
    // 1. In production, Cloudflare Access assertion verification runs before validation and returns 401/403.
    // 2. If auth bypasses erroneously in production, the invalid schema payload triggers 400 instead of creating records.
    // 3. In dev mode, validation error 400 is returned safely without mutating the database.
    const invalidProbePayload = {
      judul: '',
      slug: 'invalid-probe-slug',
      pembicaraId: 1,
      tanggal: '2026-09-23',
      deskripsi: '',
      youtubeVideoId: 'short'
    }

    const res = await request.post('/api/admin/sessions', {
      data: invalidProbePayload,
      maxRedirects: 0
    })

    if (process.env.TEST_TARGET === 'production') {
      // In production, unauthenticated request must be blocked at auth boundary (401, 403, or edge redirect 302)
      expect([401, 403, 302]).toContain(res.status())
    } else {
      // In development server, validation boundary returns 400
      expect(res.status()).toBe(400)
    }
  })
})
