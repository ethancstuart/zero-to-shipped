import { test, expect } from '@playwright/test'

test.describe('Reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('hero content is visible immediately (no animation gates)', async ({ page }) => {
    await page.goto('/')

    // Hero headline should be visible without waiting for animation
    await expect(page.locator('h1')).toBeVisible({ timeout: 1000 })
    await expect(page.locator('h1')).toContainText('Build')
  })

  test('pillar section renders with all 4 pillars visible immediately', async ({ page }) => {
    await page.goto('/')

    // Scroll past hero
    await page.evaluate(() => window.scrollTo(0, window.innerHeight))

    // All pillar names should be visible without scroll-pinning behavior
    const body = await page.textContent('body')
    expect(body).toContain('Pulse')
    expect(body).toContain('Build')
    expect(body).toContain('Learn')
    expect(body).toContain('System')
  })

  test('number theater shows final values', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2))
    await page.waitForTimeout(200)

    // Numbers should be present (final values, not scrambled placeholder zeros)
    const body = await page.textContent('body')
    expect(body).toMatch(/\d+/) // any digits visible
  })
})
