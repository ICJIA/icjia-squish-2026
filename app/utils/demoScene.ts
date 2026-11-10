/**
 * Draws the picture used by the live demo on /technical-details.
 *
 * The picture is painted by the visitor's own browser, so the demo needs no
 * download and no third party. It is deliberately a mix of what real photos
 * contain: smooth gradients, fine grain, and hard edges (lettering, wires),
 * which is where heavy compression shows first.
 */

export const DEMO_WIDTH = 1200
export const DEMO_HEIGHT = 800

/** Small seeded random-number generator, so the picture is identical every visit. */
function seededRandom(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function drawDemoScene(canvas: HTMLCanvasElement): boolean {
  canvas.width = DEMO_WIDTH
  canvas.height = DEMO_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  const w = DEMO_WIDTH
  const h = DEMO_HEIGHT
  const random = seededRandom(20260204)

  // Dusk sky
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.78)
  sky.addColorStop(0, '#141038')
  sky.addColorStop(0.42, '#5a2a72')
  sky.addColorStop(0.72, '#e8663c')
  sky.addColorStop(1, '#ffd27a')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  // Stars
  for (let i = 0; i < 170; i++) {
    const size = random() < 0.85 ? 1 : 2
    ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + random() * 0.7})`
    ctx.fillRect(Math.floor(random() * w), Math.floor(random() * h * 0.42), size, size)
  }

  // Sun
  const sunX = w * 0.7
  const sunY = h * 0.6
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 96)
  sun.addColorStop(0, '#fff6d6')
  sun.addColorStop(0.9, '#ffb84d')
  sun.addColorStop(1, 'rgba(255, 184, 77, 0)')
  ctx.fillStyle = sun
  ctx.beginPath()
  ctx.arc(sunX, sunY, 96, 0, Math.PI * 2)
  ctx.fill()

  // Four ranges of hills, nearest darkest
  const hills = ['#6b2f63', '#43204f', '#27143b', '#130a22']
  hills.forEach((color, i) => {
    const base = h * (0.6 + i * 0.085)
    const phase = random() * Math.PI * 2
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 4) {
      const y = base
        + Math.sin(x * (0.004 + i * 0.0015) + phase) * (34 - i * 4)
        + Math.sin(x * (0.013 + i * 0.004) + phase * 2) * (12 - i * 2)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
  })

  // Poles and sagging wires: thin, hard-edged detail
  ctx.strokeStyle = 'rgba(12, 6, 22, 0.95)'
  ctx.lineWidth = 5
  const poles = [90, 470, 850, 1230]
  for (const x of poles) {
    ctx.beginPath()
    ctx.moveTo(x, h * 0.36)
    ctx.lineTo(x, h * 0.74)
    ctx.stroke()
  }
  ctx.lineWidth = 1.5
  for (let wire = 0; wire < 3; wire++) {
    for (let p = 0; p < poles.length - 1; p++) {
      const x1 = poles[p]!
      const x2 = poles[p + 1]!
      const y = h * 0.37 + wire * 14
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.quadraticCurveTo((x1 + x2) / 2, y + 46, x2, y)
      ctx.stroke()
    }
  }

  // Lettering: the crispest edges in the picture
  ctx.fillStyle = '#f5efff'
  ctx.font = '900 132px system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('squish', 56, h - 64)

  // Fine grain over everything, as a camera sensor would add
  const image = ctx.getImageData(0, 0, w, h)
  const data = image.data
  for (let i = 0; i < data.length; i += 4) {
    const grain = (random() - 0.5) * 16
    data[i] = data[i]! + grain
    data[i + 1] = data[i + 1]! + grain
    data[i + 2] = data[i + 2]! + grain
  }
  ctx.putImageData(image, 0, 0)

  return true
}
