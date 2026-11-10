import type { Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

export const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url))

export interface Watch {
  /** Console errors, including Content Security Policy violations. */
  errors: string[]
  /** Requests to any host other than the site itself. */
  foreign: string[]
}

/** Record everything that would contradict "nothing leaves, nothing is blocked". */
export function watch(page: Page): Watch {
  const seen: Watch = { errors: [], foreign: [] }
  page.on('console', (msg) => {
    if (msg.type() === 'error') seen.errors.push(msg.text())
  })
  page.on('pageerror', error => seen.errors.push(error.message))
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') seen.foreign.push(request.url())
  })
  return seen
}

/** Add files through the file picker and wait until the last one is compressed. */
export async function addFiles(page: Page, names: string[]) {
  await page.getByLabel('Select images to compress').setInputFiles(names.map(fixture))
  await page.getByRole('heading', { name: names.length === 1 ? '1 image' : `${names.length} images` }).waitFor()
  await page.locator('img[alt="Compressed"]').waitFor()
  await page.getByText(/^Compressing/).waitFor({ state: 'hidden' })
}
