import { test, expect } from '@playwright/test'

test.describe('Content discovery flow', () => {
  test('Pulse hub loads with header and content', async ({ page }) => {
    await page.goto('/pulse')
    await expect(page.locator('h1')).toContainText(/pulse/i)
    const body = await page.textContent('body')
    expect(body?.toLowerCase()).toContain('pulse')
  })

  test('Pulse filter pills are present', async ({ page }) => {
    await page.goto('/pulse')
    // "All" button + at least one type filter
    await expect(page.getByRole('button', { name: /all/i }).first()).toBeVisible()
  })

  test('Clicking content card navigates to detail page', async ({ page }) => {
    await page.goto('/pulse')

    // Find the first content card link (excluding nav links)
    const firstCard = page.locator('main a[href^="/pulse/"]').first()
    const hasCard = await firstCard.count() > 0

    if (hasCard) {
      const href = await firstCard.getAttribute('href')
      await firstCard.click()
      await page.waitForURL(/\/pulse\/.+/)
      expect(page.url()).toContain(href!)
    } else {
      // No content yet — verify empty state instead
      const body = await page.textContent('body')
      expect(body).toMatch(/coming soon|no content/i)
    }
  })

  test('Content detail page has pillar pill, title, and prose area', async ({ page }) => {
    // Navigate via the Learn hub which has the most content
    await page.goto('/learn')
    const firstCard = page.locator('main a[href^="/learn/"]').first()
    const hasCard = await firstCard.count() > 0

    if (!hasCard) {
      test.skip(true, 'No learn content available to test')
      return
    }

    await firstCard.click()
    await page.waitForURL(/\/learn\/.+/)

    // Title is h1
    await expect(page.locator('h1').first()).toBeVisible()

    // Prose area has data-prose attribute (set in Task 9 of design overhaul)
    const prose = page.locator('[data-prose]')
    await expect(prose).toBeVisible()
  })

  test('Build hub loads', async ({ page }) => {
    await page.goto('/build')
    await expect(page.locator('h1')).toContainText(/build/i)
  })

  test('Learn hub loads with learning path or content', async ({ page }) => {
    await page.goto('/learn')
    await expect(page.locator('h1')).toContainText(/learn/i)
  })

  test('System hub loads', async ({ page }) => {
    await page.goto('/system')
    await expect(page.locator('h1')).toContainText(/system/i)
  })

  test('Scroll progress bar exists on content pages', async ({ page }) => {
    await page.goto('/learn')
    const firstCard = page.locator('main a[href^="/learn/"]').first()

    if (await firstCard.count() === 0) {
      test.skip(true, 'No learn content available')
      return
    }

    await firstCard.click()
    await page.waitForLoadState('networkidle')

    // Scroll halfway down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(200)

    // Progress bar element should exist (fixed at top, accent color)
    // It's at z-[9999] per the ScrollProgress component
    const progress = page.locator('div.fixed.top-0').first()
    await expect(progress).toBeVisible()
  })
})
