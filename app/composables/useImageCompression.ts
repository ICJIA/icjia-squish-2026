import { MAX_FILE_SIZE, MAX_PIXELS, WORKER_TIMEOUT_MS, BITMAP_CACHE_PIXELS, ACCEPTED_TYPES, ACCEPTED_EXTENSIONS } from '~/utils/constants'

export interface CompressedImage {
  id: string
  originalFile: File
  originalSize: number
  compressedBlob: Blob | null
  compressedSize: number
  previewUrl: string
  compressedUrl: string | null
  outputFormat: string
}

export interface CompressOptions {
  /** Longest side of the result in pixels; 0 or undefined keeps the dimensions. */
  maxDimension?: number
}

export class FileTooLargeError extends Error {
  constructor(name: string, size: number) {
    super(`${name} is too large (${formatSizeStatic(size)}). Maximum file size is ${formatSizeStatic(MAX_FILE_SIZE)}.`)
    this.name = 'FileTooLargeError'
  }
}

export class UnsupportedTypeError extends Error {
  constructor(name: string, type: string) {
    super(`${name} has unsupported type "${type || 'unknown'}". Use PNG, JPG, WebP, AVIF or HEIC.`)
    this.name = 'UnsupportedTypeError'
  }
}

export class DimensionsTooLargeError extends Error {
  constructor(name: string, width: number, height: number) {
    super(`${name} is ${width.toLocaleString('en-US')} × ${height.toLocaleString('en-US')} pixels, which is too large to process safely. Maximum is ${(MAX_PIXELS / 1_000_000).toLocaleString('en-US')} megapixels.`)
    this.name = 'DimensionsTooLargeError'
  }
}

/** The file is an accepted format, but this particular browser cannot open it. */
export class CannotDecodeError extends Error {
  constructor(name: string, heic: boolean) {
    super(heic
      ? `This browser cannot open HEIC photos, so ${name} was not added. Safari can open them, or export the photo as JPG first.`
      : `This browser could not open ${name}. The file may be damaged or in a format it does not support.`)
    this.name = 'CannotDecodeError'
  }
}

/** Standalone formatSize (used inside error constructors before composable is available) */
function formatSizeStatic(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(Math.abs(bytes)) / Math.log(k)), sizes.length - 1)
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

function extensionOf(name: string): string {
  const match = /\.([^.]+)$/.exec(name)
  return match ? match[1]!.toLowerCase() : ''
}

function isHeic(file: File): boolean {
  const type = file.type.toLowerCase()
  const ext = extensionOf(file.name)
  return type === 'image/heic' || type === 'image/heif' || ext === 'heic' || ext === 'heif'
}

/** Check whether OffscreenCanvas + createImageBitmap are available (browser, not SSR) */
function canUseWorker(): boolean {
  return (
    typeof window !== 'undefined'
    && typeof Worker !== 'undefined'
    && typeof OffscreenCanvas !== 'undefined'
    && typeof createImageBitmap === 'function'
  )
}

// One worker serves the whole page and keeps opened pictures ready for the next
// quality change (see public/compression-worker.js).
interface PendingJob {
  resolve: (blob: Blob) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
  fileName: string
}

let sharedWorker: Worker | null = null
const pending = new Map<number, PendingJob>()
let nextJobId = 0

/** Each File gets a stable key so the worker can recognise a picture it has already opened. */
const fileKeys = new WeakMap<File, string>()
let nextFileKey = 0

function keyFor(file: File): string {
  let key = fileKeys.get(file)
  if (!key) {
    key = `f${++nextFileKey}`
    fileKeys.set(file, key)
  }
  return key
}

/** Stop the worker and fail whatever it was doing; the next job starts a fresh one. */
function resetWorker(reason: string) {
  if (sharedWorker) {
    sharedWorker.terminate()
    sharedWorker = null
  }
  for (const job of pending.values()) {
    clearTimeout(job.timer)
    job.reject(new Error(reason))
  }
  pending.clear()
}

function getWorker(): Worker {
  if (sharedWorker) return sharedWorker
  const worker = new Worker('/compression-worker.js')

  worker.onmessage = (e: MessageEvent) => {
    const job = pending.get(e.data.id)
    if (!job) return
    pending.delete(e.data.id)
    clearTimeout(job.timer)
    if (e.data.code === 'dimensions') {
      job.reject(new DimensionsTooLargeError(job.fileName, e.data.width, e.data.height))
    }
    else if (e.data.error) {
      job.reject(new Error(e.data.error))
    }
    else {
      job.resolve(e.data.blob as Blob)
    }
  }

  worker.onerror = (e: ErrorEvent) => {
    resetWorker(e.message || 'Worker error')
  }

  sharedWorker = worker
  return worker
}

/** Compress a single image in the shared Web Worker (off the main thread). */
function compressInWorker(
  file: File,
  compressionQuality: number,
  format: string,
  maxDimension: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = getWorker()
    const id = ++nextJobId

    // A worker that never answers would otherwise hold its memory forever.
    const timer = setTimeout(() => {
      if (pending.has(id)) resetWorker('Compression timed out')
    }, WORKER_TIMEOUT_MS)

    pending.set(id, { resolve, reject, timer, fileName: file.name })
    worker.postMessage({
      id,
      key: keyFor(file),
      file,
      quality: compressionQuality,
      format,
      maxPixels: MAX_PIXELS,
      maxDimension,
      cachePixels: BITMAP_CACHE_PIXELS,
    })
  })
}

/** Compress using main-thread Canvas (fallback when Worker / OffscreenCanvas unavailable). */
function compressOnMainThread(
  file: File,
  compressionQuality: number,
  format: string,
  maxDimension: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // No crossOrigin needed: images are always local blob URLs from URL.createObjectURL

    img.onload = () => {
      URL.revokeObjectURL(img.src)

      if (img.width * img.height > MAX_PIXELS) {
        reject(new DimensionsTooLargeError(file.name, img.width, img.height))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      const longest = Math.max(img.width, img.height)
      const scale = maxDimension && longest > maxDimension ? maxDimension / longest : 1
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))

      if (format === 'image/jpeg') {
        // JPEG has no transparency: see-through areas would otherwise turn black.
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const quality = format === 'image/png' ? undefined : compressionQuality / 100

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          }
          else {
            reject(new Error('Could not compress image'))
          }
        },
        format,
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new CannotDecodeError(file.name, isHeic(file)))
    }
    img.src = URL.createObjectURL(file)
  })
}

export const useImageCompression = () => {
  /**
   * The format a picture will be saved in. 'original' (or nothing) keeps PNG,
   * JPEG and WebP as they are; AVIF and HEIC, which browsers cannot save, become JPEG.
   */
  const getOutputFormat = (file: File, preferredFormat?: string): string => {
    if (preferredFormat && preferredFormat !== 'original') return preferredFormat

    const mimeType = file.type.toLowerCase()
    if (mimeType === 'image/png') return 'image/png'
    if (mimeType === 'image/webp') return 'image/webp'
    return 'image/jpeg'
  }

  const getFileExtension = (format: string): string => {
    if (format === 'image/png') return 'png'
    if (format === 'image/webp') return 'webp'
    return 'jpg'
  }

  const validateFile = (file: File): void => {
    if (file.size > MAX_FILE_SIZE) {
      throw new FileTooLargeError(file.name, file.size)
    }
    const type = file.type.toLowerCase()
    const typeOk = (ACCEPTED_TYPES as readonly string[]).includes(type)
    // Some systems report no type at all for HEIC files; fall back to the extension.
    const extensionOk = type === '' && (ACCEPTED_EXTENSIONS as readonly string[]).includes(extensionOf(file.name))
    if (!typeOk && !extensionOk) {
      throw new UnsupportedTypeError(file.name, file.type)
    }
  }

  const compressImage = async (
    file: File,
    compressionQuality: number,
    outputFormat?: string,
    options: CompressOptions = {},
  ): Promise<{ blob: Blob, url: string, format: string }> => {
    validateFile(file)

    const format = getOutputFormat(file, outputFormat)
    const maxDimension = options.maxDimension ?? 0

    // Prefer off-main-thread compression via Web Worker + OffscreenCanvas
    if (canUseWorker()) {
      try {
        const blob = await compressInWorker(file, compressionQuality, format, maxDimension)
        const url = URL.createObjectURL(blob)
        return { blob, url, format }
      }
      catch (error) {
        // An oversized picture is refused outright; anything else falls
        // through to the main-thread canvas approach.
        if (error instanceof DimensionsTooLargeError) throw error
      }
    }

    const blob = await compressOnMainThread(file, compressionQuality, format, maxDimension)
    const url = URL.createObjectURL(blob)
    return { blob, url, format }
  }

  /** Tell the worker it can let go of a picture (or of every picture) it kept open. */
  const releaseImage = (file?: File): void => {
    if (!sharedWorker) return
    if (!file) {
      sharedWorker.postMessage({ type: 'release' })
      return
    }
    const key = fileKeys.get(file)
    if (key) sharedWorker.postMessage({ type: 'release', key })
  }

  const formatSize = formatSizeStatic

  const getSavings = (original: number, compressed: number): number => {
    if (original === 0) return 0
    return Math.round(((original - compressed) / original) * 100)
  }

  return {
    compressImage,
    releaseImage,
    formatSize,
    getSavings,
    getFileExtension,
    getOutputFormat,
    validateFile,
  }
}
