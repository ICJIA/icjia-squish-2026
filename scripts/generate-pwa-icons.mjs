// Renders the install icons listed in the web app manifest from public/favicon.svg.
// Run with: node scripts/generate-pwa-icons.mjs
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url))
const out = name => new URL(`../public/${name}`, import.meta.url).pathname

await sharp(svg, { density: 1200 }).resize(192, 192).png().toFile(out('pwa-192.png'))
await sharp(svg, { density: 1200 }).resize(512, 512).png().toFile(out('pwa-512.png'))

// A maskable icon may be cropped to a circle, so the artwork sits inside the
// central 80% on a full-bleed background.
const inner = await sharp(svg, { density: 1200 }).resize(360, 360).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#0d0d0d' } })
  .composite([{ input: inner, gravity: 'centre' }])
  .png()
  .toFile(out('pwa-maskable-512.png'))

console.warn('Wrote pwa-192.png, pwa-512.png and pwa-maskable-512.png')
