import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockCanvasToBlob,
  mockCanvasToBlobFailure,
  mockCanvasContext,
  mockCanvasContextFailure,
  createMockImage,
  createMockImageWithError,
  mockImageConstructor,
} from '../../helpers/canvas-mock'
import { mockPngFile, mockJpgFile, mockWebPFile, createMockBlob } from '../../fixtures/mock-files'

// Unmock the composable for this test file - we want the real implementation
vi.doUnmock('~/composables/useImageCompression')

// Dynamically import the real implementation after unmocking
const { useImageCompression } = await import('~/composables/useImageCompression')

describe('useImageCompression', () => {
  let composable: ReturnType<typeof useImageCompression>

  beforeEach(() => {
    vi.clearAllMocks()
    composable = useImageCompression()
  })

  describe('compressImage', () => {
    it('should compress a JPEG image successfully', async () => {
      const file = mockJpgFile()
      const mockBlob = createMockBlob(1000, 'image/jpeg')
      const mockImg = createMockImage()

      mockImageConstructor(mockImg)
      mockCanvasToBlob(mockBlob)

      const result = await composable.compressImage(file, 75)

      expect(result.blob).toBe(mockBlob)
      expect(result.url).toBe('blob:mock-url')
      expect(result.format).toBe('image/jpeg')
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
    })

    it('should compress a PNG image and preserve format', async () => {
      const file = mockPngFile()
      const mockBlob = createMockBlob(1500, 'image/png')
      const mockImg = createMockImage()

      mockImageConstructor(mockImg)
      mockCanvasToBlob(mockBlob)

      const result = await composable.compressImage(file, 75)

      expect(result.format).toBe('image/png')
      expect(result.blob).toBe(mockBlob)
    })

    it('should compress a WebP image and preserve format', async () => {
      const file = mockWebPFile()
      const mockBlob = createMockBlob(800, 'image/webp')
      const mockImg = createMockImage()

      mockImageConstructor(mockImg)
      mockCanvasToBlob(mockBlob)

      const result = await composable.compressImage(file, 75)

      expect(result.format).toBe('image/webp')
      expect(result.blob).toBe(mockBlob)
    })

    it('should use custom output format when provided', async () => {
      const file = mockPngFile()
      const mockBlob = createMockBlob(1000, 'image/jpeg')
      const mockImg = createMockImage()

      mockImageConstructor(mockImg)
      mockCanvasToBlob(mockBlob)

      const result = await composable.compressImage(file, 75, 'image/jpeg')

      expect(result.format).toBe('image/jpeg')
    })

    it('should apply compression quality correctly', async () => {
      const file = mockJpgFile()
      const mockBlob = createMockBlob(500, 'image/jpeg')
      const mockImg = createMockImage()
      const toBlobSpy = vi.fn((callback: BlobCallback) => {
        setTimeout(() => callback(mockBlob), 0)
      })

      mockCanvasContext()
      mockImageConstructor(mockImg)
      HTMLCanvasElement.prototype.toBlob = toBlobSpy as any

      await composable.compressImage(file, 80)

      expect(toBlobSpy).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8)
    })

    it('should not apply quality to PNG (use undefined)', async () => {
      const file = mockPngFile()
      const mockBlob = createMockBlob(1500, 'image/png')
      const mockImg = createMockImage()
      const toBlobSpy = vi.fn((callback: BlobCallback) => {
        setTimeout(() => callback(mockBlob), 0)
      })

      mockCanvasContext()
      mockImageConstructor(mockImg)
      HTMLCanvasElement.prototype.toBlob = toBlobSpy as any

      await composable.compressImage(file, 75)

      expect(toBlobSpy).toHaveBeenCalledWith(expect.any(Function), 'image/png', undefined)
    })

    it('should draw image on canvas with correct dimensions', async () => {
      const file = mockJpgFile()
      const mockBlob = createMockBlob(1000, 'image/jpeg')
      const mockImg = createMockImage(800, 600)

      const mockCtx = mockCanvasContext()
      mockImageConstructor(mockImg)
      mockCanvasToBlob(mockBlob, false) // Don't override context

      await composable.compressImage(file, 75)

      expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImg, 0, 0)
    })

    it('should reject when canvas context cannot be created', async () => {
      const file = mockJpgFile()
      const mockImg = createMockImage()

      mockImageConstructor(mockImg)
      mockCanvasContextFailure()

      await expect(composable.compressImage(file, 75)).rejects.toThrow(
        'Could not get canvas context',
      )
    })

    it('should reject when canvas.toBlob returns null', async () => {
      const file = mockJpgFile()
      const mockImg = createMockImage()

      mockImageConstructor(mockImg)
      mockCanvasToBlobFailure()

      await expect(composable.compressImage(file, 75)).rejects.toThrow('Could not compress image')
    })

    it('should reject when image fails to load', async () => {
      const file = mockJpgFile()
      const mockImg = createMockImageWithError()

      mockImageConstructor(mockImg)

      await expect(composable.compressImage(file, 75)).rejects.toThrow('Could not load image')
    })

    it('should revoke blob URL after image loads', async () => {
      const file = mockJpgFile()
      const mockBlob = createMockBlob(1000, 'image/jpeg')
      const mockImg = createMockImage()

      mockImageConstructor(mockImg)
      mockCanvasToBlob(mockBlob)

      await composable.compressImage(file, 75)

      // Wait for the onload to complete
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should revoke blob URL on error', async () => {
      const file = mockJpgFile()
      const mockImg = createMockImageWithError()

      mockImageConstructor(mockImg)

      try {
        await composable.compressImage(file, 75)
      }
      catch {
        // Expected to throw
      }

      // Wait for the onerror to complete
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })
  })

  describe('formatSize', () => {
    it('should format 0 bytes', () => {
      expect(composable.formatSize(0)).toBe('0 B')
    })

    it('should format bytes (< 1KB)', () => {
      expect(composable.formatSize(500)).toBe('500 B')
      expect(composable.formatSize(1023)).toBe('1023 B')
    })

    it('should format kilobytes', () => {
      expect(composable.formatSize(1024)).toBe('1 KB')
      expect(composable.formatSize(5120)).toBe('5 KB')
      expect(composable.formatSize(10240)).toBe('10 KB')
    })

    it('should format megabytes', () => {
      expect(composable.formatSize(1048576)).toBe('1 MB')
      expect(composable.formatSize(5242880)).toBe('5 MB')
      expect(composable.formatSize(10485760)).toBe('10 MB')
    })

    it('should format gigabytes', () => {
      expect(composable.formatSize(1073741824)).toBe('1 GB')
      expect(composable.formatSize(5368709120)).toBe('5 GB')
    })

    it('should handle decimal places correctly', () => {
      expect(composable.formatSize(1536)).toBe('1.5 KB')
      expect(composable.formatSize(2621440)).toBe('2.5 MB')
    })

    it('should not exceed GB unit for very large files', () => {
      const veryLargeSize = 1073741824 * 100 // 100 GB
      const result = composable.formatSize(veryLargeSize)
      expect(result).toContain('GB')
      expect(result).toBe('100 GB')
    })
  })

  describe('getSavings', () => {
    it('should calculate savings percentage correctly', () => {
      expect(composable.getSavings(1000, 750)).toBe(25)
      expect(composable.getSavings(2000, 1000)).toBe(50)
      expect(composable.getSavings(1000, 100)).toBe(90)
    })

    it('should return 0 when original size is 0', () => {
      expect(composable.getSavings(0, 100)).toBe(0)
    })

    it('should return 0 when no savings', () => {
      expect(composable.getSavings(1000, 1000)).toBe(0)
    })

    it('should handle negative savings (compressed larger than original)', () => {
      expect(composable.getSavings(1000, 1500)).toBe(-50)
    })

    it('should round to nearest integer', () => {
      expect(composable.getSavings(1000, 667)).toBe(33) // 33.3% -> 33
      expect(composable.getSavings(1000, 666)).toBe(33) // 33.4% -> 33
      expect(composable.getSavings(1000, 665)).toBe(34) // 33.5% -> 34
    })

    it('should handle very small savings', () => {
      expect(composable.getSavings(10000, 9999)).toBe(0) // 0.01% -> 0
      expect(composable.getSavings(10000, 9950)).toBe(1) // 0.5% -> 1
    })

    it('should handle 100% savings', () => {
      expect(composable.getSavings(1000, 0)).toBe(100)
    })
  })

  describe('getFileExtension', () => {
    it('should return png for image/png', () => {
      expect(composable.getFileExtension('image/png')).toBe('png')
    })

    it('should return webp for image/webp', () => {
      expect(composable.getFileExtension('image/webp')).toBe('webp')
    })

    it('should return jpg for image/jpeg', () => {
      expect(composable.getFileExtension('image/jpeg')).toBe('jpg')
    })

    it('should return jpg for any other format', () => {
      expect(composable.getFileExtension('image/bmp')).toBe('jpg')
      expect(composable.getFileExtension('image/gif')).toBe('jpg')
      expect(composable.getFileExtension('unknown')).toBe('jpg')
    })
  })
})
