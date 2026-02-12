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

export const useImageCompression = () => {
  const getOutputFormat = (file: File, preferredFormat?: string): string => {
    if (preferredFormat) return preferredFormat

    // Preserve original format by default
    const mimeType = file.type.toLowerCase()
    if (mimeType === 'image/png') return 'image/png'
    if (mimeType === 'image/webp') return 'image/webp'
    // Default to JPEG for all other formats (including JPG/JPEG)
    return 'image/jpeg'
  }

  const getFileExtension = (format: string): string => {
    if (format === 'image/png') return 'png'
    if (format === 'image/webp') return 'webp'
    return 'jpg'
  }

  const compressImage = async (
    file: File,
    compressionQuality: number,
    outputFormat?: string,
  ): Promise<{ blob: Blob, url: string, format: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        // Clean up the temporary blob URL
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

        const format = getOutputFormat(file, outputFormat)
        const quality = format === 'image/png' ? undefined : compressionQuality / 100

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve({ blob, url, format })
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
        // Clean up the temporary blob URL even on error
        URL.revokeObjectURL(img.src)
        reject(new Error('Could not load image'))
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
  }

  const getSavings = (original: number, compressed: number): number => {
    if (original === 0) return 0
    return Math.round(((original - compressed) / original) * 100)
  }

  return {
    compressImage,
    formatSize,
    getSavings,
    getFileExtension,
  }
}
