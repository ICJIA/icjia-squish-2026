/**
 * Create a mock File object for testing
 */
export function createMockFile(
  name: string,
  type: string,
  size: number = 1024,
): File {
  const content = 'x'.repeat(size)
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

/**
 * Create a mock PNG file
 */
export function mockPngFile(name = 'test.png', size = 2048): File {
  return createMockFile(name, 'image/png', size)
}

/**
 * Create a mock JPEG file
 */
export function mockJpgFile(name = 'test.jpg', size = 1536): File {
  return createMockFile(name, 'image/jpeg', size)
}

/**
 * Create a mock WebP file
 */
export function mockWebPFile(name = 'test.webp', size = 1024): File {
  return createMockFile(name, 'image/webp', size)
}

/**
 * Create a mock Blob for compressed images
 */
export function createMockBlob(size: number, type: string = 'image/jpeg'): Blob {
  const content = 'x'.repeat(size)
  return new Blob([content], { type })
}
