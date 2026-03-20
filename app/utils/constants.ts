export const QUALITY_MIN = 10
export const QUALITY_MAX = 100
export const QUALITY_STEP = 5
export const QUALITY_DEFAULT = 75

/** 50 MB — prevent browser tab crashes on huge files */
export const MAX_FILE_SIZE = 50 * 1024 * 1024

export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

export const DEBOUNCE_DELAY_MS = 150

/** Sample image from Unsplash — horizontal, detailed cityscape for good slider demo */
export const SAMPLE_IMAGE_URL = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=2400&q=100'
export const SAMPLE_IMAGE_FILENAME = 'sample-cityscape.jpg'
export const SAMPLE_DEMO_QUALITY = 30
