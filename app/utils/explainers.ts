/**
 * Small pure helpers behind the interactive explainers on /technical-details.
 * Kept free of Vue and the DOM so they can be unit-tested directly.
 */

export interface Connection {
  id: string
  label: string
  /** Download speed in megabits per second. */
  mbps: number
}

/** Illustrative download speeds, not measurements of any particular network. */
export const CONNECTIONS: Connection[] = [
  { id: 'slow', label: 'Slow mobile', mbps: 1.5 },
  { id: 'mobile', label: 'Typical mobile', mbps: 10 },
  { id: 'home', label: 'Home broadband', mbps: 100 },
]

/** Seconds needed to download `bytes` at `mbps` megabits per second. */
export function secondsToDownload(bytes: number, mbps: number): number {
  if (bytes <= 0 || mbps <= 0) return 0
  return (bytes * 8) / (mbps * 1_000_000)
}

/** A waiting time in words a reader would use: "0.4 seconds", "38 seconds", "2 min 8 s". */
export function formatWait(seconds: number): string {
  if (seconds < 0.05) return 'no time at all'
  if (seconds < 10) {
    const value = Number(seconds.toFixed(1))
    return `${value} ${value === 1 ? 'second' : 'seconds'}`
  }
  const whole = Math.round(seconds)
  if (whole < 60) return `${whole} seconds`
  const minutes = Math.floor(whole / 60)
  const rest = whole % 60
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`
}

/** Round every value to the nearest multiple of `step`, staying within 0–255. */
export function roundValues(values: number[], step: number): number[] {
  if (step <= 1) return [...values]
  return values.map(v => Math.min(255, Math.round(v / step) * step))
}

export interface Run {
  value: number
  count: number
}

/** Collapse neighbours that share a value: [5, 5, 5, 9] becomes 3 × 5, 1 × 9. */
export function toRuns(values: number[]): Run[] {
  const runs: Run[] = []
  for (const value of values) {
    const last = runs[runs.length - 1]
    if (last && last.value === value) last.count++
    else runs.push({ value, count: 1 })
  }
  return runs
}
