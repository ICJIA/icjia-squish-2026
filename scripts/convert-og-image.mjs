import { readFileSync } from 'node:fs'

import sharp from 'sharp'

const svg = readFileSync('./public/og-image.svg')

await sharp(svg)
  .resize(1200, 630)
  .png()
  .toFile('./public/og-image.png')

console.warn('✅ OG image converted to PNG: og-image.png (1200x630)')
