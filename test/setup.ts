import { vi } from 'vitest'
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import 'vitest-canvas-mock'
import { QUALITY_DEFAULT, QUALITY_MIN, QUALITY_MAX, QUALITY_STEP, MAX_FILE_SIZE, DEBOUNCE_DELAY_MS } from '~/utils/constants'

// Make Vue functions globally available
globalThis.computed = computed
globalThis.ref = ref
globalThis.onMounted = onMounted
globalThis.onUnmounted = onUnmounted
globalThis.watch = watch
globalThis.nextTick = nextTick

// Make constants globally available (simulating Nuxt auto-import from utils/)
globalThis.QUALITY_DEFAULT = QUALITY_DEFAULT
globalThis.QUALITY_MIN = QUALITY_MIN
globalThis.QUALITY_MAX = QUALITY_MAX
globalThis.QUALITY_STEP = QUALITY_STEP
globalThis.MAX_FILE_SIZE = MAX_FILE_SIZE
globalThis.DEBOUNCE_DELAY_MS = DEBOUNCE_DELAY_MS

// Make useDebounce globally available (simulating Nuxt auto-import from composables/)
globalThis.useDebounce = (fn: (...args: never[]) => unknown, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<typeof fn>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(cancel)

  return { debounced, cancel }
}

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

// Mock factory for validateFile
const mockValidateFile = vi.fn()

// Also mock the module for explicit imports
vi.mock('~/composables/useImageCompression', () => ({
  useImageCompression: mockUseImageCompression,
  FileTooLargeError: class FileTooLargeError extends Error {
    constructor(name: string, size: number) {
      super(`${name} is too large. Maximum file size is 50 MB.`)
      this.name = 'FileTooLargeError'
    }
  },
  UnsupportedTypeError: class UnsupportedTypeError extends Error {
    constructor(name: string, type: string) {
      super(`${name} has unsupported type "${type}". Use PNG, JPG, or WebP.`)
      this.name = 'UnsupportedTypeError'
    }
  },
}))
