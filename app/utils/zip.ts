/**
 * A minimal ZIP writer, so that "Download all" can hand over one file instead of
 * starting a download per picture. Entries are stored, not deflated: JPEG, WebP
 * and PNG are already compressed, so deflating them again saves almost nothing.
 *
 * Pure and dependency-free. Limits: no ZIP64, so under 4 GB and 65,535 entries,
 * far above anything a browser tab will hold.
 */

export interface ZipEntry {
  name: string
  data: Uint8Array
}

let crcTable: Uint32Array | null = null

/** CRC-32 as used by ZIP (polynomial 0xEDB88320). */
export function crc32(data: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]!) & 0xFF]! ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

/** Give repeated names a numeric suffix: photo.jpg, photo (2).jpg, photo (3).jpg. */
export function uniqueNames(names: string[]): string[] {
  const seen = new Map<string, number>()
  const taken = new Set<string>()
  return names.map((name) => {
    let candidate = name
    let count = seen.get(name) ?? 1
    while (taken.has(candidate)) {
      count++
      const dot = name.lastIndexOf('.')
      candidate = dot > 0 ? `${name.slice(0, dot)} (${count})${name.slice(dot)}` : `${name} (${count})`
    }
    seen.set(name, count)
    taken.add(candidate)
    return candidate
  })
}

/** Strip anything path-like from a name so an entry can only land in the folder it is extracted to. */
export function safeEntryName(name: string): string {
  const base = name.replace(/\\/g, '/').split('/').pop() ?? ''
  // eslint-disable-next-line no-control-regex
  const cleaned = base.replace(/[\u0000-\u001F<>:"|?*]/g, '_').replace(/^\.+/, '')
  return cleaned || 'image'
}

function dosDateTime(date: Date): { time: number, date: number } {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((Math.max(1980, date.getFullYear()) - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

/** Build a ZIP archive and return its bytes. */
export function createZip(entries: ZipEntry[], modified: Date = new Date()): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder()
  const names = uniqueNames(entries.map(e => safeEntryName(e.name))).map(n => encoder.encode(n))
  const stamp = dosDateTime(modified)

  const dataSize = entries.reduce((sum, e) => sum + e.data.length, 0)
  const nameSize = names.reduce((sum, n) => sum + n.length, 0)
  const total = dataSize + nameSize * 2 + entries.length * (30 + 46) + 22

  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)
  const offsets: number[] = []
  const crcs: number[] = []
  let p = 0

  // Local file headers, each followed by its data
  entries.forEach((entry, i) => {
    const name = names[i]!
    const crc = crc32(entry.data)
    offsets.push(p)
    crcs.push(crc)
    view.setUint32(p, 0x04034B50, true)
    view.setUint16(p + 4, 20, true) // version needed
    view.setUint16(p + 6, 0x0800, true) // names are UTF-8
    view.setUint16(p + 8, 0, true) // stored
    view.setUint16(p + 10, stamp.time, true)
    view.setUint16(p + 12, stamp.date, true)
    view.setUint32(p + 14, crc, true)
    view.setUint32(p + 18, entry.data.length, true)
    view.setUint32(p + 22, entry.data.length, true)
    view.setUint16(p + 26, name.length, true)
    view.setUint16(p + 28, 0, true)
    out.set(name, p + 30)
    out.set(entry.data, p + 30 + name.length)
    p += 30 + name.length + entry.data.length
  })

  // Central directory
  const directoryStart = p
  entries.forEach((entry, i) => {
    const name = names[i]!
    view.setUint32(p, 0x02014B50, true)
    view.setUint16(p + 4, 20, true) // version made by
    view.setUint16(p + 6, 20, true) // version needed
    view.setUint16(p + 8, 0x0800, true)
    view.setUint16(p + 10, 0, true)
    view.setUint16(p + 12, stamp.time, true)
    view.setUint16(p + 14, stamp.date, true)
    view.setUint32(p + 16, crcs[i]!, true)
    view.setUint32(p + 20, entry.data.length, true)
    view.setUint32(p + 24, entry.data.length, true)
    view.setUint16(p + 28, name.length, true)
    // extra, comment, disk, internal and external attributes stay 0
    view.setUint32(p + 42, offsets[i]!, true)
    out.set(name, p + 46)
    p += 46 + name.length
  })

  // End of central directory
  view.setUint32(p, 0x06054B50, true)
  view.setUint16(p + 8, entries.length, true)
  view.setUint16(p + 10, entries.length, true)
  view.setUint32(p + 12, p - directoryStart, true)
  view.setUint32(p + 16, directoryStart, true)

  return out
}
