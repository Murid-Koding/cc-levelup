import { test, expect } from '@playwright/test'

test.describe('public session archive', () => {
  test('displays published sessions and excludes drafts', async ({ page }) => {
    await page.goto('/sesi')

    await expect(page.getByRole('heading', { level: 1, name: 'Arsip Sesi' })).toBeVisible()

    // Verifikasi sesi published muncul
    await expect(page.getByText('Mengembangkan Kebiasaan Menulis Teknis')).toBeVisible()
    await expect(page.getByText('Budi Santoso').first()).toBeVisible()

    // Verifikasi sesi draft tidak boleh tampil di halaman publik (sesuai PRD & Sprint 2)
    await expect(page.getByText('Draft Sesi Belum Tayang')).not.toBeVisible()
  })

  test('navigates from header to archive', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Sesi' }).click()
    await expect(page).toHaveURL(/\/sesi/)
    await expect(page.getByRole('heading', { level: 1, name: 'Arsip Sesi' })).toBeVisible()
  })

  test('paginates between page 1 and page 2', async ({ page }) => {
    await page.goto('/sesi', { waitUntil: 'networkidle' })

    // Page 1 memiliki 9 sesi (limit default ViewModel = 9, total published = 12)
    await expect(page.getByText(/Halaman 1 dari 2/)).toBeVisible()
    await expect(page.getByText('Mengembangkan Kebiasaan Menulis Teknis')).toBeVisible()

    const nextButton = page.getByRole('button', { name: 'Selanjutnya' })
    await expect(nextButton).toBeVisible()
    await nextButton.click()

    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByText(/Halaman 2 dari 2/)).toBeVisible()
    await expect(page.getByText('Membangun API dengan Nuxt')).toBeVisible()

    const prevButton = page.getByRole('button', { name: 'Sebelumnya' })
    await expect(prevButton).toBeVisible()
    await prevButton.click()

    await expect(page).toHaveURL(
      (url) => !url.searchParams.has('page') || url.searchParams.get('page') === '1'
    )
    await expect(page.getByText(/Halaman 1 dari 2/)).toBeVisible()
  })

  test('displays out-of-range message and returns to page 1', async ({ page }) => {
    await page.goto('/sesi?page=999')

    await expect(
      page.getByRole('heading', { level: 2, name: 'Halaman tidak tersedia' })
    ).toBeVisible()
    await expect(page.getByText(/Total halaman yang tersedia adalah 2/)).toBeVisible()

    const resetLink = page.getByRole('link', { name: 'Kembali ke Halaman Pertama' })
    await expect(resetLink).toBeVisible()
    await resetLink.click()

    await expect(page).toHaveURL(/\/sesi/)
    await expect(page.getByText('Mengembangkan Kebiasaan Menulis Teknis')).toBeVisible()
  })
})
