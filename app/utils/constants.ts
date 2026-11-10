export const QUALITY_MIN = 10
export const QUALITY_MAX = 100
export const QUALITY_STEP = 5
export const QUALITY_DEFAULT = 75

/** 50 MB — prevent browser tab crashes on huge files */
export const MAX_FILE_SIZE = 50 * 1024 * 1024

/**
 * Formats Squish will try to open. PNG, JPEG and WebP open in every modern
 * browser and AVIF in nearly all. HEIC and HEIF (iPhone photos) open only where
 * the browser can decode them, which today means Safari; elsewhere the picture
 * is refused with a message that says so.
 */
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/heic', 'image/heif'] as const

/** File extensions for the same formats, used when the browser reports no type. */
export const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'heic', 'heif'] as const

/** The value of the file picker's `accept` attribute. */
export const ACCEPT_ATTRIBUTE = 'image/png,image/jpeg,image/webp,image/avif,image/heic,image/heif,.heic,.heif'

/** Formats the browser can save. 'original' keeps PNG, JPEG and WebP as they are. */
export const OUTPUT_FORMATS = [
  { value: 'original', label: 'Same as the original' },
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/webp', label: 'WebP' },
] as const

export type OutputFormatChoice = typeof OUTPUT_FORMATS[number]['value']

/** Longest-side limits offered for resizing; 0 leaves the dimensions alone. */
export const RESIZE_OPTIONS = [
  { value: 0, label: 'Original dimensions' },
  { value: 2560, label: '2,560 px' },
  { value: 1920, label: '1,920 px' },
  { value: 1600, label: '1,600 px' },
  { value: 1280, label: '1,280 px' },
  { value: 800, label: '800 px' },
] as const

/**
 * The compression worker keeps opened pictures ready so that moving the quality
 * slider does not reopen them. It holds at most this many pixels (4 bytes each).
 */
export const BITMAP_CACHE_PIXELS = 80_000_000

export const DEBOUNCE_DELAY_MS = 150

/**
 * 100 megapixels — a small file can still describe an enormous picture (a
 * "decompression bomb"), and unpacking it needs 4 bytes per pixel of memory.
 */
export const MAX_PIXELS = 100_000_000

/** Give up on a compression that has not finished after this long. */
export const WORKER_TIMEOUT_MS = 60_000

/**
 * Sample image, served from this site so that trying the demo contacts no third
 * party. From Unsplash (photo-1477959858617-67f85cf4f1df), Unsplash License.
 */
export const SAMPLE_IMAGE_URL = '/sample-cityscape.jpg'
export const SAMPLE_IMAGE_FILENAME = 'sample-cityscape.jpg'
export const SAMPLE_DEMO_QUALITY = 30
