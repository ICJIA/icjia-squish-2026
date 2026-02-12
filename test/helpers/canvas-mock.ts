import { vi } from 'vitest'

/**
 * Mock canvas context with drawImage method
 */
export function mockCanvasContext() {
  const mockContext = {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  }

  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext) as any

  return mockContext
}

/**
 * Mock canvas toBlob method to simulate successful blob creation
 * Note: Call mockCanvasContext() before this if you need to test drawImage
 */
export function mockCanvasToBlob(blob: Blob, ensureContext = true) {
  // Ensure context is available by default
  if (ensureContext) {
    mockCanvasContext()
  }

  HTMLCanvasElement.prototype.toBlob = vi.fn(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
  ) {
    setTimeout(() => callback(blob), 0)
  }) as any
}

/**
 * Mock canvas toBlob method to simulate failure (null blob)
 * Note: Call mockCanvasContext() before this if you need to test drawImage
 */
export function mockCanvasToBlobFailure(ensureContext = true) {
  // Ensure context is available by default
  if (ensureContext) {
    mockCanvasContext()
  }

  HTMLCanvasElement.prototype.toBlob = vi.fn(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
  ) {
    setTimeout(() => callback(null), 0)
  }) as any
}

/**
 * Mock canvas.getContext to return null (simulating failure)
 */
export function mockCanvasContextFailure() {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any
}

/**
 * Create a mock Image that triggers onload immediately
 */
export function createMockImage(width = 100, height = 100): HTMLImageElement {
  const img = new Image()

  Object.defineProperty(img, 'width', {
    value: width,
    writable: true,
    configurable: true
  })
  Object.defineProperty(img, 'height', {
    value: height,
    writable: true,
    configurable: true
  })

  // Override src setter to trigger onload
  let srcValue = ''
  Object.defineProperty(img, 'src', {
    get: () => srcValue,
    set: (value: string) => {
      srcValue = value
      setTimeout(() => {
        if (img.onload) {
          img.onload(new Event('load'))
        }
      }, 0)
    },
    configurable: true,
  })

  return img
}

/**
 * Create a mock Image that triggers onerror
 */
export function createMockImageWithError(): HTMLImageElement {
  const img = new Image()

  // Override src setter to trigger onerror
  let srcValue = ''
  Object.defineProperty(img, 'src', {
    get: () => srcValue,
    set: (value: string) => {
      srcValue = value
      setTimeout(() => {
        if (img.onerror) {
          img.onerror(new Event('error'))
        }
      }, 0)
    },
    configurable: true,
  })

  return img
}

/**
 * Mock the Image constructor
 */
export function mockImageConstructor(mockImage: HTMLImageElement) {
  global.Image = vi.fn(() => mockImage) as any
}
