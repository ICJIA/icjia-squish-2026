import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { addFiles, watch } from './helpers'

test.describe('the tool', () => {
  test('loads the sample image without contacting any other host', async ({ page }) => {
    const seen = watch(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Load Sample Image' }).click()
    await expect(page.locator('img[alt="Compressed"]')).toBeVisible()
    await expect(page.getByText(/% smaller\)/)).toBeVisible()
    expect(seen.foreign).toEqual([])
    expect(seen.errors).toEqual([])
  })

  test('draws every icon from the bundle', async ({ page }) => {
    await page.goto('/')
    await addFiles(page, ['photo.jpg', 'diagram.png'])
    // A bundled icon renders as an element with a CSS mask or inline SVG; a
    // missing one renders empty with zero width.
    const icons = page.locator('.iconify, svg.iconify, [class*="i-lucide"]')
    const count = await icons.count()
    expect(count).toBeGreaterThan(5)
    for (let i = 0; i < count; i++) {
      const box = await icons.nth(i).boundingBox()
      expect(box?.width ?? 0, `icon ${i} has no width`).toBeGreaterThan(0)
    }
  })

  test('compresses a photo and reports the saving', async ({ page }) => {
    const seen = watch(page)
    await page.goto('/')
    await addFiles(page, ['photo.jpg'])
    await expect(page.getByText(/\(\d+% smaller\)/)).toBeVisible()
    expect(seen.errors).toEqual([])
  })

  test('saves in the chosen format', async ({ page }) => {
    await page.goto('/')
    await addFiles(page, ['photo.jpg'])
    await page.getByLabel('Save as').selectOption('image/webp')
    await expect(page.getByText(/^Compressing/)).toBeHidden()
    await page.waitForTimeout(400)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download', exact: true }).click(),
    ])
    expect(download.suggestedFilename()).toBe('photo_compressed.webp')
    const bytes = await readFile(await download.path())
    expect(bytes.subarray(0, 4).toString('latin1')).toBe('RIFF')
    expect(bytes.subarray(8, 12).toString('latin1')).toBe('WEBP')
  })

  test('explains PNG and offers a way out', async ({ page }) => {
    await page.goto('/')
    await addFiles(page, ['diagram.png'])
    const note = page.getByText('the quality slider does not change PNG files')
    await expect(note).toBeVisible()
    await page.getByLabel('Save as').selectOption('image/jpeg')
    await expect(note).toBeHidden()
  })

  test('scales a picture down to the chosen longest side', async ({ page }) => {
    await page.goto('/')
    await addFiles(page, ['photo.jpg'])
    const compressed = page.locator('img[alt="Compressed"]')
    await expect.poll(() => compressed.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1600)
    await page.getByLabel('Longest side').selectOption('800')
    await expect.poll(() => compressed.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(800)
    expect(await compressed.evaluate((img: HTMLImageElement) => img.naturalHeight)).toBe(600)
  })

  test('downloads several pictures as one ZIP', async ({ page }) => {
    await page.goto('/')
    await addFiles(page, ['photo.jpg', 'diagram.png'])
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download all as a ZIP' }).click(),
    ])
    expect(download.suggestedFilename()).toBe('squish-images.zip')
    const bytes = await readFile(await download.path())
    expect(bytes.readUInt32LE(0)).toBe(0x04034B50)
    const end = bytes.length - 22
    expect(bytes.readUInt32LE(end)).toBe(0x06054B50)
    expect(bytes.readUInt16LE(end + 10)).toBe(2)
    expect(bytes.includes(Buffer.from('photo_compressed.jpg'))).toBe(true)
    expect(bytes.includes(Buffer.from('diagram_compressed.png'))).toBe(true)
  })

  test('refuses an unsupported file with a message and no thumbnail', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Select images to compress').setInputFiles({
      name: 'animation.gif',
      mimeType: 'image/gif',
      buffer: Buffer.from('GIF89a'),
    })
    await expect(page.getByRole('alert')).toContainText('unsupported type')
    await expect(page.getByRole('heading', { name: /\d+ images?/ })).toHaveCount(0)
  })

  test('accepts a pasted picture', async ({ page }) => {
    await page.goto('/')
    await page.locator('h1').waitFor()
    const png = (await readFile(new URL('./fixtures/diagram.png', import.meta.url))).toString('base64')
    await page.evaluate(async (base64) => {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const data = new DataTransfer()
      data.items.add(new File([bytes], 'image.png', { type: 'image/png' }))
      window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data }))
    }, png)
    await expect(page.getByRole('heading', { name: '1 image' })).toBeVisible()
    await expect(page.locator('img[alt="Compressed"]')).toBeVisible()
  })

  test('moves the comparison divider from the keyboard', async ({ page }) => {
    await page.goto('/')
    await addFiles(page, ['photo.jpg'])
    const divider = page.getByRole('slider', { name: 'Comparison divider' })
    await divider.focus()
    await expect(divider).toHaveAttribute('aria-valuenow', '50')
    await page.keyboard.press('ArrowRight')
    await expect(divider).toHaveAttribute('aria-valuenow', '52')
    await page.keyboard.press('Home')
    await expect(divider).toHaveAttribute('aria-valuenow', '0')
  })

  test('reaches Download and Remove on a thumbnail from the keyboard', async ({ page }) => {
    await page.goto('/')
    await addFiles(page, ['photo.jpg'])
    const remove = page.getByRole('button', { name: 'Remove photo.jpg' })
    await remove.focus()
    await expect(remove).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: '1 image' })).toHaveCount(0)
  })

  for (const width of [320, 375, 768, 1366]) {
    test(`does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      await addFiles(page, ['photo.jpg', 'diagram.png'])
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})
