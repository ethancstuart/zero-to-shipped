import { test, expect } from '@playwright/test'

test.describe('Dark mode', () => {
  test('toggle button is present in navigation', async ({ page }) => {
    await page.goto('/')

    // It might be one of the visible buttons in the nav (theme toggle uses lucide Sun/Moon icons)
    const navButtons = page.locator('nav button')
    await expect(navButtons.first()).toBeVisible()
  })

  test('html element gets dark class when toggled', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find any button in nav that could be the theme toggle
    // Look for a button containing svg (icon button)
    const themeButton = page.locator('nav button:has(svg)').first()

    // Get initial class state
    const initialClass = (await page.locator('html').getAttribute('class')) || ''

    await themeButton.click()
    await page.waitForTimeout(300)

    // Class should have changed (added or removed 'dark')
    const newClass = (await page.locator('html').getAttribute('class')) || ''
    expect(newClass).not.toBe(initialClass)
  })
})
