import { test, expect } from '@playwright/test'

test('renders the homepage shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /CC Level Up!/ })).toBeVisible()
})
