import { describe, it, expect } from 'vitest'
import { CONNECTIONS, secondsToDownload, formatWait, roundValues, toRuns } from '~/utils/explainers'

describe('explainers', () => {
  describe('secondsToDownload', () => {
    it('converts bytes and megabits per second into seconds', () => {
      // 10 MB (decimal) is 80 megabits: 8 seconds at 10 Mbps
      expect(secondsToDownload(10_000_000, 10)).toBe(8)
    })

    it('returns 0 for nothing to download or no connection', () => {
      expect(secondsToDownload(0, 10)).toBe(0)
      expect(secondsToDownload(1000, 0)).toBe(0)
    })

    it('is faster on every faster connection', () => {
      const times = CONNECTIONS.map(c => secondsToDownload(5_000_000, c.mbps))
      expect(times[0]).toBeGreaterThan(times[1]!)
      expect(times[1]).toBeGreaterThan(times[2]!)
    })
  })

  describe('formatWait', () => {
    it('describes very short waits in words', () => {
      expect(formatWait(0.01)).toBe('no time at all')
    })

    it('keeps one decimal under ten seconds', () => {
      expect(formatWait(0.44)).toBe('0.4 seconds')
      expect(formatWait(1)).toBe('1 second')
    })

    it('uses whole seconds, then minutes', () => {
      expect(formatWait(38.4)).toBe('38 seconds')
      expect(formatWait(128)).toBe('2 min 8 s')
      expect(formatWait(120)).toBe('2 min')
    })
  })

  describe('roundValues', () => {
    it('leaves values alone at step 1', () => {
      expect(roundValues([3, 4, 5], 1)).toEqual([3, 4, 5])
    })

    it('rounds to the nearest multiple of the step', () => {
      expect(roundValues([118, 121, 126, 131], 8)).toEqual([120, 120, 128, 128])
    })

    it('never exceeds 255', () => {
      expect(roundValues([250], 64)).toEqual([255])
    })
  })

  describe('toRuns', () => {
    it('collapses equal neighbours', () => {
      expect(toRuns([5, 5, 5, 9, 5])).toEqual([
        { value: 5, count: 3 },
        { value: 9, count: 1 },
        { value: 5, count: 1 },
      ])
    })

    it('handles an empty list', () => {
      expect(toRuns([])).toEqual([])
    })
  })
})
