import { test, expect } from '@playwright/test'
import { addFiles } from './helpers'

test.describe('offline', () => {
  test('keeps working with no connection after the first visit', async ({ page, context }) => {
    await page.goto('/')
    // Wait until the service worker has stored the site and taken control.
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }))
      }
    })

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Squish', level: 1 })).toBeVisible()

    // The compression worker and the comparison slider are fetched on demand,
    // so this only passes if both came from the offline store.
    await addFiles(page, ['photo.jpg'])
    await expect(page.getByText(/\(\d+% smaller\)/)).toBeVisible()
    await expect(page.getByRole('slider', { name: 'Comparison divider' })).toBeVisible()

    await page.goto('/technical-details')
    await expect(page.getByText(/^\d+% smaller$/)).toBeVisible()
  })
})
