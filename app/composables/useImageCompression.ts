export interface CompressedImage {
  id: string
  originalFile: File
  originalSize: number
  compressedBlob: Blob | null
  compressedSize: number
  previewUrl: string
  compressedUrl: string | null
}

export const useImageCompression = () => {
  const compressImage = async (
    file: File,
    compressionQuality: number,
  ): Promise<{ blob: Blob, url: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve({ blob, url })
            }
            else {
              reject(new Error('Could not compress image'))
            }
          },
          'image/jpeg',
          compressionQuality / 100,
        )
      }

      img.onerror = () => reject(new Error('Could not load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
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
  }
}
