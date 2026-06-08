import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES_TO_AUDIT = [
  { name: 'homepage', url: '/' },
  { name: 'pulse hub', url: '/pulse' },
  { name: 'learn hub', url: '/learn' },
  { name: 'tools directory', url: '/tools' },
]

test.describe('Accessibility (axe-core)', () => {
  for (const { name, url } of PAGES_TO_AUDIT) {
    test(`${name} has no critical or serious a11y violations`, async ({ page }) => {
      await page.goto(url)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const blocking = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )

      if (blocking.length > 0) {
        console.log('\nViolations found:')
        for (const v of blocking) {
          console.log(`  ${v.impact}: ${v.id} — ${v.description}`)
          console.log(`    Nodes: ${v.nodes.length}`)
        }
      }

      expect(blocking).toHaveLength(0)
    })
  }

  test('content detail page has no critical or serious violations', async ({ page }) => {
    await page.goto('/learn')
    const firstCard = page.locator('main a[href^="/learn/"]').first()

    if (await firstCard.count() === 0) {
      test.skip(true, 'No learn content available')
      return
    }

    await firstCard.click()
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const blocking = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(blocking).toHaveLength(0)
  })
})
