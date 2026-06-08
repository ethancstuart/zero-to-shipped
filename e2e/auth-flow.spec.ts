import { test, expect } from '@playwright/test'

test.describe('Auth flow', () => {
  test('Unauthenticated user sees "Get started" in nav', async ({ page }) => {
    await page.goto('/')

    // Get started button should be visible in nav for logged-out users
    const getStarted = page.getByRole('button', { name: /get started/i }).first()
    await expect(getStarted).toBeVisible()
  })

  test('Protected dashboard route redirects when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to home or auth page
    await page.waitForLoadState('networkidle')
    const url = page.url()

    // Either redirected to / or to a login page
    expect(url).not.toContain('/dashboard')
  })

  test('Protected profile route redirects when unauthenticated', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    const url = page.url()
    expect(url).not.toContain('/profile')
  })

  test('Public routes do not redirect', async ({ page }) => {
    const publicRoutes = ['/', '/pulse', '/build', '/learn', '/system', '/tools', '/showcase', '/pricing']

    for (const route of publicRoutes) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      // URL should match (possibly with trailing slash)
      const url = new URL(page.url())
      expect(url.pathname).toBe(route)
    }
  })
})
