import { test, expect } from '@playwright/test'
import { watch } from './helpers'

test.describe('the technical details page', () => {
  test('runs the live demo under the production security policy', async ({ page }) => {
    const seen = watch(page)
    await page.goto('/technical-details')
    await expect(page.getByText(/^\d+% smaller$/)).toBeVisible()
    const before = await page.getByText(/^\d+% smaller$/).textContent()
    await page.getByLabel('Quality').fill('20')
    await expect(page.getByText(/^\d+% smaller$/)).not.toHaveText(before!)
    expect(seen.foreign).toEqual([])
    expect(seen.errors).toEqual([])
  })

  test('grows the file above the original quality and says so', async ({ page }) => {
    await page.goto('/technical-details')
    await expect(page.getByText(/^\d+% smaller$/)).toBeVisible()
    await page.getByLabel('Quality').fill('100')
    await expect(page.getByText(/^\d+% larger$/)).toBeVisible()
  })

  test('recalculates the waiting time', async ({ page }) => {
    await page.goto('/technical-details')
    await expect(page.getByText('19 seconds')).toBeVisible()
    await page.getByText('Slow mobile').click()
    await expect(page.getByText('2 min 8 s')).toBeVisible()
  })

  test('switches the privacy diagram', async ({ page }) => {
    await page.goto('/technical-details')
    await expect(page.getByText('Not used. Nothing is sent.')).toBeVisible()
    await page.getByRole('button', { name: 'With a typical upload site' }).click()
    await expect(page.getByText('The whole picture travels out, and later back.')).toBeVisible()
  })

  test('walks through the five steps', async ({ page }) => {
    await page.goto('/technical-details')
    await page.locator('h1').waitFor()
    const next = page.getByRole('button', { name: 'Next step' })
    await next.scrollIntoViewIfNeeded()
    for (let i = 0; i < 4; i++) await next.click()
    await expect(next).toBeDisabled()
    await expect(page.getByRole('heading', { name: 'You compare the two, then download' })).toBeVisible()
  })

  test('collapses neighbours as rounding increases', async ({ page }) => {
    await page.goto('/technical-details')
    await page.locator('h1').waitFor()
    await expect(page.getByText('24 entries')).toBeVisible()
    await page.getByRole('slider', { name: 'Rounding' }).fill('5')
    await expect(page.getByText(/^\d+ × 64, \d+ × 128$/)).toBeVisible()
    await expect(page.getByText('2 entries')).toBeVisible()
  })

  for (const width of [320, 375, 1366]) {
    test(`does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/technical-details')
      await expect(page.getByText(/^\d+% smaller$/)).toBeVisible()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})
