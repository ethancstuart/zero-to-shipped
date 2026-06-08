import { test, expect } from '@playwright/test'

test.describe('Showcase and Arena', () => {
  test('Showcase page loads with header and submit CTA', async ({ page }) => {
    await page.goto('/showcase')
    await expect(page.locator('h1').first()).toBeVisible()

    // "Submit your build" CTA
    const submitLink = page.getByRole('link', { name: /submit/i })
    await expect(submitLink.first()).toBeVisible()
  })

  test('Showcase displays seeded projects', async ({ page }) => {
    await page.goto('/showcase')
    const body = await page.textContent('body')

    // At least one of the seeded projects should be visible (from Task 10 of design overhaul)
    // Meridian, RidgeCap, NexusWatch, LongTable
    expect(body).toMatch(/meridian|ridgecap|nexuswatch|longtable/i)
  })

  test('Arena page loads', async ({ page }) => {
    await page.goto('/build/arena')
    await expect(page.locator('main')).toBeVisible()
  })
})
