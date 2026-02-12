import { vi } from 'vitest'
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import 'vitest-canvas-mock'

// Make Vue functions globally available
globalThis.computed = computed
globalThis.ref = ref
globalThis.onMounted = onMounted
globalThis.onUnmounted = onUnmounted
globalThis.watch = watch
globalThis.nextTick = nextTick

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Create shared mock functions (so they're the same instance across all calls)
const mockCompressImage = vi.fn().mockResolvedValue({
  blob: new Blob(['test'], { type: 'image/jpeg' }),
  url: 'blob:compressed-url',
  format: 'image/jpeg',
})

const mockFormatSize = vi.fn().mockImplementation((bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  const value = bytes / k ** i
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${sizes[i]}`
})

const mockGetSavings = vi.fn().mockImplementation((original: number, compressed: number) => {
  if (original === 0) return 0
  return Math.round(((original - compressed) / original) * 100)
})

const mockGetFileExtension = vi.fn().mockImplementation((format: string) => {
  if (format === 'image/png') return 'png'
  if (format === 'image/webp') return 'webp'
  return 'jpg'
})

// Mock factory that returns the same mock instances every time
const mockUseImageCompression = () => ({
  compressImage: mockCompressImage,
  formatSize: mockFormatSize,
  getSavings: mockGetSavings,
  getFileExtension: mockGetFileExtension,
})

// Make it globally available (simulating Nuxt auto-import)
globalThis.useImageCompression = mockUseImageCompression

// Also mock the module for explicit imports
vi.mock('~/composables/useImageCompression', () => ({
  useImageCompression: mockUseImageCompression,
}))
