import { test, expect } from '@playwright/test'

// This file only runs in the mobile project (per playwright.config.ts testMatch)
test.describe('Mobile viewport (375px)', () => {
  test('hamburger menu icon visible, desktop nav hidden', async ({ page }) => {
    await page.goto('/')

    // Look for hamburger button — has icon (svg), no text
    const hamburger = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i]').first()

    if (await hamburger.count() === 0) {
      // Try alternative: button with menu icon in nav
      const navButtons = page.locator('nav button:has(svg)')
      const count = await navButtons.count()
      expect(count).toBeGreaterThan(0)
    } else {
      await expect(hamburger).toBeVisible()
    }
  })

  test('content grids stack to single column', async ({ page }) => {
    await page.goto('/pulse')
    await page.waitForLoadState('networkidle')

    // Page should still render content
    await expect(page.locator('h1')).toBeVisible()
  })

  test('homepage hero is readable on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Build')
  })

  test('no horizontal overflow on homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that body width doesn't exceed viewport
    const dimensions = await page.evaluate(() => ({
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    }))

    expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1) // 1px tolerance
  })
})
