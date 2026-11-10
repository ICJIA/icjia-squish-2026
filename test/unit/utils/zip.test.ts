import { describe, it, expect } from 'vitest'
import { crc32, createZip, uniqueNames, safeEntryName } from '~/utils/zip'

const bytes = (text: string) => new TextEncoder().encode(text)

describe('zip', () => {
  describe('crc32', () => {
    it('matches the published check values', () => {
      expect(crc32(bytes('123456789'))).toBe(0xCBF43926)
      expect(crc32(bytes('hello'))).toBe(0x3610A686)
      expect(crc32(new Uint8Array(0))).toBe(0)
    })
  })

  describe('uniqueNames', () => {
    it('leaves distinct names alone', () => {
      expect(uniqueNames(['a.jpg', 'b.jpg'])).toEqual(['a.jpg', 'b.jpg'])
    })

    it('numbers repeated names before the extension', () => {
      expect(uniqueNames(['a.jpg', 'a.jpg', 'a.jpg'])).toEqual(['a.jpg', 'a (2).jpg', 'a (3).jpg'])
    })

    it('does not collide with a name that already carries a number', () => {
      const names = uniqueNames(['a.jpg', 'a (2).jpg', 'a.jpg'])
      expect(new Set(names).size).toBe(3)
    })
  })

  describe('safeEntryName', () => {
    it('removes folders so an entry cannot escape the extraction folder', () => {
      expect(safeEntryName('../../etc/passwd')).toBe('passwd')
      expect(safeEntryName('C:\\Users\\me\\photo.jpg')).toBe('photo.jpg')
    })

    it('removes leading dots and falls back to a default', () => {
      expect(safeEntryName('..hidden.jpg')).toBe('hidden.jpg')
      expect(safeEntryName('')).toBe('image')
    })
  })

  describe('createZip', () => {
    const zip = createZip(
      [{ name: 'one.txt', data: bytes('hello') }, { name: 'two.txt', data: bytes('world!') }],
      new Date(2026, 10, 10, 12, 30, 0),
    )
    const view = new DataView(zip.buffer)

    it('starts with a local file header and ends with the end-of-directory record', () => {
      expect(view.getUint32(0, true)).toBe(0x04034B50)
      expect(view.getUint32(zip.length - 22, true)).toBe(0x06054B50)
    })

    it('records the number of entries', () => {
      expect(view.getUint16(zip.length - 22 + 10, true)).toBe(2)
    })

    it('stores each entry uncompressed with its CRC and size', () => {
      expect(view.getUint16(8, true)).toBe(0) // method: stored
      expect(view.getUint32(14, true)).toBe(0x3610A686)
      expect(view.getUint32(18, true)).toBe(5)
      const name = new TextDecoder().decode(zip.slice(30, 37))
      expect(name).toBe('one.txt')
      expect(new TextDecoder().decode(zip.slice(37, 42))).toBe('hello')
    })

    it('points the directory at each entry', () => {
      const directoryStart = view.getUint32(zip.length - 22 + 16, true)
      expect(view.getUint32(directoryStart, true)).toBe(0x02014B50)
      expect(view.getUint32(directoryStart + 42, true)).toBe(0) // first entry at offset 0
      const second = directoryStart + 46 + 7
      expect(view.getUint32(second + 42, true)).toBe(30 + 7 + 5)
    })

    it('has exactly the expected length', () => {
      expect(zip.length).toBe(5 + 6 + 7 * 4 + 2 * (30 + 46) + 22)
    })

    it('builds a valid empty archive', () => {
      const empty = createZip([])
      expect(empty.length).toBe(22)
    })
  })
})
