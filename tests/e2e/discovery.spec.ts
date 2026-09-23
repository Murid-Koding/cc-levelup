import { test, expect } from '@playwright/test'

test.describe('Discovery & Search Features', () => {
  test('filters sessions via client-side search query without extra API calls per keystroke', async ({
    page
  }) => {
    await page.goto('/sesi', { waitUntil: 'networkidle' })

    const searchInput = page.getByRole('searchbox', { name: 'Cari sharing session' })
    await expect(searchInput).toBeVisible()

    // Pantau request network saat mengetik
    const apiRequests: string[] = []
    page.on('request', (req) => {
      const url = req.url()
      if (url.includes('/api/')) {
        apiRequests.push(url)
      }
    })

    // Ketik per karakter secara bertahap
    await searchInput.pressSequentially('Type', { delay: 100 })
    await searchInput.pressSequentially('Script', { delay: 100 })

    // Verifikasi teks hasil filter muncul
    await expect(page.getByText(/Ditemukan .* sesi sesuai filter/)).toBeVisible()
    await expect(page.getByText('Pengenalan TypeScript Modern')).toBeVisible()

    // Sesi yang tidak relevan tidak boleh tampil
    await expect(page.getByText('Storytelling dalam Presentasi Teknis')).not.toBeVisible()

    // Verifikasi tidak ada panggilan API /api/search atau /api/sessions per keystroke
    const searchApiCalls = apiRequests.filter(
      (url) => url.includes('/api/search-index') || url.includes('/api/sessions?')
    )
    expect(searchApiCalls.length).toBe(0)

    // Clear search dan pastikan kembali ke arsip normal
    await page.getByRole('button', { name: 'Reset Filter' }).click()
    await expect(page.getByText('Storytelling dalam Presentasi Teknis')).toBeVisible()
  })

  test('filters sessions by clicking category pill and provides category page link', async ({
    page
  }) => {
    await page.goto('/sesi', { waitUntil: 'networkidle' })

    // Klik kategori "Desain"
    const desainButton = page.getByRole('button', { name: 'Desain' })
    await expect(desainButton).toBeVisible()
    await desainButton.click()

    await expect(page.getByText(/Ditemukan .* sesi sesuai filter/)).toBeVisible()
    await expect(page.getByText('Desain Slide yang Jelas')).toBeVisible()
    await expect(page.getByText('UX Research Praktis untuk Komunitas')).toBeVisible()

    // Sesi bukan kategori Desain tidak boleh tampil
    await expect(page.getByText('Membangun API dengan Nuxt')).not.toBeVisible()

    // Tautan ke halaman topik mandiri muncul
    const topicLink = page.getByRole('link', { name: 'Buka Halaman Topik Ini' })
    await expect(topicLink).toBeVisible()
    await topicLink.click()

    await expect(page).toHaveURL(/\/kategori\/desain/)
    await expect(page.getByRole('heading', { level: 1, name: 'Desain' })).toBeVisible()
  })

  test('navigates to standalone shareable category page /kategori/{slug}', async ({ page }) => {
    const res = await page.goto('/kategori/teknologi', { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(200)

    // Heading nama kategori
    await expect(page.getByRole('heading', { level: 1, name: 'Teknologi' })).toBeVisible()

    // Sesi dengan kategori teknologi muncul
    await expect(page.getByText('Membangun API dengan Nuxt')).toBeVisible()
    await expect(page.getByText('Pengenalan TypeScript Modern')).toBeVisible()

    // Sesi tanpa kategori teknologi tidak boleh ada
    await expect(page.getByText('Desain Slide yang Jelas')).not.toBeVisible()
  })

  test('returns 404 response status for non-existent category page', async ({ page }) => {
    const res = await page.goto('/kategori/kategori-palsu', { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(404)

    await expect(
      page.getByRole('heading', { level: 1, name: 'Kategori Tidak Ditemukan' })
    ).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
})
