import { test, expect } from '@playwright/test'

test.describe('Tools flow', () => {
  test('Tools directory loads with tool cards', async ({ page }) => {
    await page.goto('/tools')
    await expect(page.locator('main')).toBeVisible()

    // Should have at least one tool card linking to /tools/[slug]
    const toolCards = page.locator('main a[href^="/tools/"]')
    const count = await toolCards.count()
    expect(count).toBeGreaterThan(0)
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
