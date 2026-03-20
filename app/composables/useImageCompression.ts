import { MAX_FILE_SIZE, ACCEPTED_TYPES } from '~/utils/constants'

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

export class FileTooLargeError extends Error {
  constructor(name: string, size: number) {
    super(`${name} is too large (${formatSizeStatic(size)}). Maximum file size is ${formatSizeStatic(MAX_FILE_SIZE)}.`)
    this.name = 'FileTooLargeError'
  }
}

export class UnsupportedTypeError extends Error {
  constructor(name: string, type: string) {
    super(`${name} has unsupported type "${type}". Use PNG, JPG, or WebP.`)
    this.name = 'UnsupportedTypeError'
  }
}

/** Standalone formatSize (used inside error constructors before composable is available) */
function formatSizeStatic(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

/** Check whether OffscreenCanvas + createImageBitmap are available (browser, not SSR) */
function canUseWorker(): boolean {
  return (
    typeof window !== 'undefined'
    && typeof OffscreenCanvas !== 'undefined'
    && typeof createImageBitmap === 'function'
  )
}

/** Compress a single image inside a dedicated Web Worker (off the main thread). */
function compressInWorker(
  file: File,
  compressionQuality: number,
  format: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const workerCode = `
      self.onmessage = async (e) => {
        const { file, quality, format } = e.data;
        try {
          const bitmap = await createImageBitmap(file);
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');
          ctx.drawImage(bitmap, 0, 0);
          const q = format === 'image/png' ? undefined : quality / 100;
          const blob = await canvas.convertToBlob({ type: format, quality: q });
          self.postMessage({ blob });
          bitmap.close();
        } catch (err) {
          self.postMessage({ error: err.message });
        }
      };
    `
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)
    const worker = new Worker(workerUrl)

    worker.onmessage = (e: MessageEvent) => {
      worker.terminate()
      URL.revokeObjectURL(workerUrl)
      if (e.data.error) {
        reject(new Error(e.data.error))
      }
      else {
        resolve(e.data.blob as Blob)
      }
    }

    worker.onerror = (e: ErrorEvent) => {
      worker.terminate()
      URL.revokeObjectURL(workerUrl)
      reject(new Error(e.message || 'Worker error'))
    }

    worker.postMessage({ file, quality: compressionQuality, format })
  })
}

/** Compress using main-thread Canvas (fallback when Worker / OffscreenCanvas unavailable). */
function compressOnMainThread(
  file: File,
  compressionQuality: number,
  format: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      URL.revokeObjectURL(img.src)

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

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
      reject(new Error('Could not load image'))
    }
    img.src = URL.createObjectURL(file)
  })
}

export const useImageCompression = () => {
  const getOutputFormat = (file: File, preferredFormat?: string): string => {
    if (preferredFormat) return preferredFormat

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
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase() as typeof ACCEPTED_TYPES[number])) {
      throw new UnsupportedTypeError(file.name, file.type)
    }
  }

  const compressImage = async (
    file: File,
    compressionQuality: number,
    outputFormat?: string,
  ): Promise<{ blob: Blob, url: string, format: string }> => {
    validateFile(file)

    const format = getOutputFormat(file, outputFormat)

    // Prefer off-main-thread compression via Web Worker + OffscreenCanvas
    if (canUseWorker()) {
      try {
        const blob = await compressInWorker(file, compressionQuality, format)
        const url = URL.createObjectURL(blob)
        return { blob, url, format }
      }
      catch {
        // Fall through to main-thread canvas approach
      }
    }

    const blob = await compressOnMainThread(file, compressionQuality, format)
    const url = URL.createObjectURL(blob)
    return { blob, url, format }
  }

  const formatSize = formatSizeStatic

  const getSavings = (original: number, compressed: number): number => {
    if (original === 0) return 0
    return Math.round(((original - compressed) / original) * 100)
  }

  return {
    compressImage,
    formatSize,
    getSavings,
    getFileExtension,
    validateFile,
  }
}
