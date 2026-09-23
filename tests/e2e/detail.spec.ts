import { test, expect } from '@playwright/test'

test.describe('public session detail page', () => {
  test('displays session details, speaker info, and Google Drive material link', async ({
    page
  }) => {
    const res = await page.goto('/sesi/membangun-api-dengan-nuxt', { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(200)

    // Validasi Judul Sesi
    await expect(
      page.getByRole('heading', { level: 1, name: 'Membangun API dengan Nuxt' })
    ).toBeVisible()

    // Validasi Pembicara
    await expect(page.getByText('Budi Santoso').first()).toBeVisible()

    // Verifikasi bio pembicara TIDAK diekspos di MVP publik
    await expect(page.getByText('Tentang Pembicara')).not.toBeVisible()

    // Validasi Deskripsi & Ringkasan
    await expect(
      page.getByText('Pengantar merancang API sederhana di Nuxt untuk kebutuhan komunitas.')
    ).toBeVisible()
    await expect(page.getByText('Ringkasan Materi')).toBeVisible()

    // Validasi Tautan Materi Google Drive
    const materialLink = page.getByRole('link', { name: 'Akses Materi Presentasi' })
    await expect(materialLink).toBeVisible()
    await expect(materialLink).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/folders/membangun-api-dengan-nuxt-test'
    )
  })

  test('loads YouTube iframe only after user clicks or activates facade via keyboard', async ({
    page
  }) => {
    await page.goto('/sesi/membangun-api-dengan-nuxt', { waitUntil: 'networkidle' })

    // Awalnya iframe YouTube TIDAK boleh ada di DOM
    await expect(page.locator('iframe[title*="Video player"]')).not.toBeAttached()

    // Aktivasi via tombol play facade
    const playButton = page.getByRole('button', { name: /Putar rekaman video/i })
    await expect(playButton).toBeVisible()

    // Tekan tombol (klik)
    await playButton.click()

    // Setelah interaksi, iframe YouTube harus dimuat
    const iframe = page.locator('iframe[title*="Video player"]')
    await expect(iframe).toBeVisible()
    await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/devVideo001/)
  })

  test('displays related sessions with the same category', async ({ page }) => {
    await page.goto('/sesi/membangun-api-dengan-nuxt', { waitUntil: 'networkidle' })

    await expect(page.getByRole('heading', { level: 2, name: 'Sesi Terkait' })).toBeVisible()

    // Sesi ini sendiri (id: 1) tidak boleh muncul di daftar related sessions
    const relatedSection = page.locator('section:has(h2:text("Sesi Terkait"))')
    await expect(relatedSection.getByText('Membangun API dengan Nuxt')).not.toBeVisible()
  })

  test('returns HTTP 404 response status and prevents access to draft sessions', async ({
    page
  }) => {
    const res = await page.goto('/sesi/draft-sesi-belum-tayang', { waitUntil: 'networkidle' })

    // Harus berstatus HTTP 404 (bukan soft 404 status 200)
    expect(res?.status()).toBe(404)

    // Harus menampilkan state tidak ditemukan, bukan detail sesi
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sesi Tidak Ditemukan' })
    ).toBeVisible()
    await expect(page.getByText('Sesi yang Anda tuju mungkin belum dipublikasikan')).toBeVisible()

    // Memiliki tag noindex untuk mencegah indexing
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

    // Ada tombol kembali ke arsip
    const backLink = page.getByRole('link', { name: 'Lihat Semua Sesi Tersedia' })
    await expect(backLink).toBeVisible()
    await backLink.click()

    await expect(page).toHaveURL(/\/sesi$/)
  })

  test('returns HTTP 404 response status for non-existent session slug', async ({ page }) => {
    const res = await page.goto('/sesi/sesi-yang-tidak-pernah-ada', { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sesi Tidak Ditemukan' })
    ).toBeVisible()
  })
})
