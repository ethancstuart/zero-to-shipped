import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads with hero section visible', async ({ page }) => {
    await page.goto('/')

    // Wait for body to be visible
    await expect(page.locator('body')).toBeVisible()

    // Hero comment syntax
    await expect(page.getByText('// prototype.studio')).toBeVisible()

    // Hero headline contains the brand statement
    await expect(page.locator('h1')).toContainText('Build')

    // Two CTA buttons
    await expect(page.getByRole('link', { name: /start building/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /explore the platform/i })).toBeVisible()
  })

  test('generative mesh canvas exists on desktop', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Canvas should exist in the DOM
    const canvas = page.locator('canvas').first()
    await expect(canvas).toHaveCount(1)
  })

  test('scroll reveals pinned pillars section', async ({ page }) => {
    await page.goto('/')

    // Scroll past the hero
    await page.evaluate(() => window.scrollTo(0, window.innerHeight))
    await page.waitForTimeout(500)

    // Check that pillar labels are present somewhere on the page
    const body = await page.textContent('body')
    expect(body).toContain('Pulse')
    expect(body).toContain('Build')
    expect(body).toContain('Learn')
    expect(body).toContain('System')
  })

  test('number theater stats section renders', async ({ page }) => {
    await page.goto('/')

    // Scroll to stats area
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2))
    await page.waitForTimeout(800) // wait for counter animation

    const body = await page.textContent('body')
    expect(body).toMatch(/tools tracked/i)
    expect(body).toMatch(/resources/i)
    expect(body).toMatch(/capabilities/i)
  })

  test('bento grid section renders tiles', async ({ page }) => {
    await page.goto('/')

    // Scroll to bento area
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3))
    await page.waitForTimeout(500)

    const body = await page.textContent('body')
    // Bento tile titles from homepage spec
    expect(body).toMatch(/agent replay|tool intelligence|live feed/i)
  })

  test('horizontal showcase section is present', async ({ page }) => {
    await page.goto('/')

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Should show project titles from seeded data
    const body = await page.textContent('body')
    expect(body).toMatch(/meridian|ridgecap|nexuswatch|longtable/i)
  })

  test('footer is reachable', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Footer has the brand tagline
    const body = await page.textContent('body')
    expect(body).toMatch(/build real products with ai/i)
  })

  test('navigation is fixed at top', async ({ page }) => {
    await page.goto('/')

    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()

    // Nav links visible
    await expect(page.getByRole('link', { name: /pulse/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /build/i }).first()).toBeVisible()
  })
})
