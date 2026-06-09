import { test, expect } from '@playwright/test'

test.describe('Tools flow', () => {
  test('Tools directory loads with tool cards', async ({ page }) => {
    await page.goto('/tools')
    await expect(page.locator('main')).toBeVisible()

    // The page should always render its h1, even in empty-state.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Phase 1 restructure: /tools now lists companies. Each card links to
    // /tools/[company]. In CI we run against placeholder Supabase, so the
    // company list may be empty — in that case the empty-state copy renders.
    const companyCards = page.locator('main a[href^="/tools/"]')
    const cardCount = await companyCards.count()
    if (cardCount === 0) {
      await expect(page.locator('main').getByText(/no tools yet/i)).toBeVisible()
    } else {
      expect(cardCount).toBeGreaterThan(0)
    }
  })

  test('Tool detail page loads with tabs', async ({ page }) => {
    await page.goto('/tools')
    const firstTool = page.locator('main a[href^="/tools/"]').first()

    if (await firstTool.count() === 0) {
      test.skip(true, 'No tools available')
      return
    }

    await firstTool.click()
    await page.waitForURL(/\/tools\/.+/)

    // Tool detail has h1 with name
    await expect(page.locator('h1').first()).toBeVisible()

    // Tabs: Overview / Releases / Capabilities
    const body = await page.textContent('body')
    expect(body).toMatch(/overview|releases|capabilities/i)
  })

  test('Compare page loads', async ({ page }) => {
    await page.goto('/compare')
    await expect(page.locator('main')).toBeVisible()
  })
})
