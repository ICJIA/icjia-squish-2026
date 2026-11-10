<template>
  <div class="min-h-screen bg-background">
    <header class="border-b border-border">
      <div class="mx-auto flex h-32 max-w-[2000px] items-center justify-between px-6 py-8 lg:px-10">
        <h1 class="text-6xl font-black tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
          Squish
        </h1>
        <div class="flex items-center gap-6">
          <span class="hidden text-sm tracking-wide text-muted-foreground sm:block">image compression for writers and developers</span>
          <NuxtLink
            to="/technical-details"
            class="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            How it works
          </NuxtLink>
          <a
            href="https://github.com/ICJIA/icjia-squish-2026"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
            aria-label="View source on GitHub"
          >
            <UIcon
              name="i-lucide-github"
              class="h-6 w-6"
            />
            <span class="hidden text-sm lg:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-[2000px] px-6 py-12 lg:px-10 lg:py-16">
      <div class="mb-16 max-w-xl">
        <p class="text-xl leading-relaxed text-muted-foreground">
          Drop your images below to compress them instantly. Drag the slider on the preview to compare original and compressed versions side by side.
        </p>
      </div>
      <div class="grid gap-10 xl:grid-cols-[1fr_360px]">
        <div class="space-y-10">
          <div
            :class="['relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition-all duration-200', isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground']"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            <input
              type="file"
              :accept="ACCEPT_ATTRIBUTE"
              multiple
              class="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Select images to compress"
              @change="handleFileSelect"
            >
            <div class="flex flex-col items-center gap-4 px-8 text-center">
              <UIcon
                name="i-lucide-image"
                :class="['h-8 w-8 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground']"
              />
              <div>
                <p :class="['text-lg font-medium transition-colors', isDragging ? 'text-primary' : 'text-foreground']">
                  {{ isDragging ? 'Release to squish' : 'Drop images here' }}
                </p>
                <p class="mt-1 text-sm text-muted-foreground">
                  or click to browse, or paste from the clipboard. PNG, JPG, WebP and AVIF; HEIC in Safari.
                </p>
              </div>
              <button
                v-if="!isSampleImage && !isSampleLoading"
                class="relative z-10 mt-2 rounded border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                @click.stop.prevent="loadSampleImage"
              >
                Load Sample Image
              </button>
              <div
                v-if="isSampleLoading"
                class="mt-2 flex items-center gap-2"
              >
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
                <span class="text-sm text-muted-foreground">Loading sample...</span>
              </div>
            </div>
          </div>
          <div
            v-if="isSampleImage && selectedImage"
            class="flex items-center justify-between rounded border border-primary/30 bg-primary/5 px-4 py-3"
          >
            <p class="text-sm text-muted-foreground">
              This is a <span class="font-medium text-primary">sample image</span> — drag and drop your own image to see the impact on your files.
            </p>
          </div>
          <div
            v-if="selectedImage && selectedImage.compressedUrl"
            class="space-y-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold text-foreground">
                  Preview Comparison
                </h2>
                <span class="text-sm text-muted-foreground">Drag slider to compare</span>
              </div>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span class="text-sm text-muted-foreground">
                  {{ formatSize(selectedImage.originalSize) }} → {{ formatSize(selectedImage.compressedSize) }}
                  <span
                    class="font-medium"
                    :class="{
                      'text-green-400': qualityTier === 'good',
                      'text-yellow-400': qualityTier === 'caution',
                      'text-red-400': qualityTier === 'warning',
                    }"
                  >({{ getSavings(selectedImage.originalSize, selectedImage.compressedSize) }}% smaller)</span>
                </span>
                <span
                  v-if="qualityTier === 'caution'"
                  class="text-xs text-yellow-400"
                >Low quality — may look blurry</span>
                <span
                  v-if="qualityTier === 'warning'"
                  class="text-xs text-red-400"
                >Very low quality — expect visible artifacts</span>
                <button
                  class="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  @click="downloadImage(selectedImage)"
                >
                  Download
                </button>
              </div>
            </div>
            <LazyComparisonSlider
              :key="selectedImage.id"
              :original-url="selectedImage.previewUrl"
              :compressed-url="selectedImage.compressedUrl"
              :original-size="selectedImage.originalSize"
              :compressed-size="selectedImage.compressedSize"
              :quality="quality"
              :default-zoom="isSampleImage ? 200 : 100"
              @update:quality="quality = $event"
            />
          </div>
          <div
            v-if="images.length > 0"
            class="space-y-4"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-foreground">
                {{ images.length }} {{ images.length === 1 ? 'image' : 'images' }}
              </h2>
              <button
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                @click="clearAll"
              >
                Clear all
              </button>
            </div>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <div
                v-for="img in images"
                :key="img.id"
                :class="['group relative overflow-hidden rounded border-2 transition-all', selectedImageId === img.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground']"
              >
                <!-- Selecting is its own button, a sibling of Download and Remove:
                     a button may not contain other buttons. -->
                <button
                  type="button"
                  class="block aspect-square w-full cursor-pointer bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  :aria-label="`Preview ${img.originalFile.name}`"
                  :aria-pressed="selectedImageId === img.id"
                  @click="selectedImageId = img.id"
                >
                  <img
                    :src="img.previewUrl"
                    alt=""
                    class="h-full w-full object-cover"
                  >
                </button>
                <div
                  v-if="getSavings(img.originalSize, img.compressedSize) > 0"
                  class="pointer-events-none absolute top-2 left-2 rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground"
                >
                  -{{ getSavings(img.originalSize, img.compressedSize) }}%
                </div>
                <div class="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    class="pointer-events-auto rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
                    :aria-label="`Download ${img.originalFile.name}`"
                    @click.stop="downloadImage(img)"
                  >
                    <UIcon
                      name="i-lucide-download"
                      class="h-5 w-5"
                    />
                  </button>
                  <button
                    class="pointer-events-auto rounded-full bg-destructive p-2 text-destructive-foreground transition-colors hover:bg-destructive/90"
                    :aria-label="`Remove ${img.originalFile.name}`"
                    @click.stop="removeImage(img.id)"
                  >
                    <UIcon
                      name="i-lucide-x"
                      class="h-5 w-5"
                    />
                  </button>
                </div>
                <div class="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 to-transparent p-2 pt-6">
                  <p class="truncate text-xs text-foreground">
                    {{ formatSize(img.compressedSize) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="space-y-8">
          <div class="space-y-6 rounded border border-border bg-card p-6">
            <div class="flex items-baseline justify-between">
              <h2
                id="quality-heading"
                class="text-sm font-medium uppercase tracking-widest text-muted-foreground"
              >
                Quality
              </h2>
              <span class="text-4xl font-black tabular-nums text-primary">{{ quality }}%</span>
            </div>
            <div ref="qualitySliderContainer">
              <USlider
                v-model="quality"
                :min="QUALITY_MIN"
                :max="QUALITY_MAX"
                :step="QUALITY_STEP"
                color="primary"
                size="lg"
                class="w-full"
              />
            </div>
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
            <QualityIndicator
              :quality="quality"
              :savings="totalSavings"
            />
            <div class="space-y-4 border-t border-border pt-5">
              <div>
                <label
                  for="output-format"
                  class="block text-sm font-medium text-foreground"
                >Save as</label>
                <select
                  id="output-format"
                  v-model="outputFormat"
                  class="squish-select mt-1.5"
                >
                  <option
                    v-for="option in OUTPUT_FORMATS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div>
                <label
                  for="max-dimension"
                  class="block text-sm font-medium text-foreground"
                >Longest side</label>
                <select
                  id="max-dimension"
                  v-model.number="maxDimension"
                  class="squish-select mt-1.5"
                >
                  <option
                    v-for="option in RESIZE_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <p class="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Pictures larger than this are scaled down. Smaller ones are left alone.
                </p>
              </div>
              <p
                v-if="hasLosslessOutput"
                class="rounded border border-yellow-400/40 bg-yellow-400/5 p-3 text-xs leading-relaxed text-foreground"
              >
                PNG never throws detail away, so the quality slider does not change PNG files. Choose JPG or WebP under "Save as" to make them much smaller.
              </p>
            </div>
          </div>
          <div
            v-if="images.length > 0"
            class="space-y-6 rounded border border-border bg-card p-6"
          >
            <h2 class="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Summary
            </h2>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Original</span>
                <span class="font-mono text-foreground">{{ formatSize(totalOriginalSize) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Compressed</span>
                <span class="font-mono text-foreground">{{ formatSize(totalCompressedSize) }}</span>
              </div>
              <div class="border-t border-border pt-4">
                <div class="flex justify-between items-start">
                  <span class="font-medium text-foreground">Saved</span>
                  <div class="flex flex-col items-end gap-1">
                    <span class="font-mono text-2xl font-bold text-primary">{{ totalSavings }}%</span>
                    <span class="font-mono text-sm text-foreground">{{ formatSize(totalOriginalSize - totalCompressedSize) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="images.length > 1"
            class="space-y-4"
          >
            <button
              class="flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              @click="downloadAll"
            >
              <UIcon
                name="i-lucide-download"
                class="h-5 w-5"
              />Download all as a ZIP
            </button>
          </div>
          <div
            v-if="isCompressing"
            class="flex items-center justify-center gap-3 rounded border border-border bg-card p-4"
          >
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
            <span class="text-sm text-muted-foreground">{{ compressionProgressText }}</span>
          </div>
          <div
            v-if="errorMessage"
            role="alert"
            class="rounded border border-destructive bg-destructive/10 p-4"
          >
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-circle-alert"
                class="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              />
              <p class="text-sm text-destructive">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="mt-16 border-t border-border">
      <div class="mx-auto max-w-[2000px] px-6 py-8 lg:px-10">
        <div class="flex flex-col items-center gap-4 text-center">
          <p
            class="text-lg font-semibold tracking-wide text-primary"
          >
            Privacy-focused • Real-time preview • Instant compression
          </p>
          <p class="text-sm text-muted-foreground">
            All processing happens locally in your browser. Your images never leave your device.
          </p>
          <NuxtLink
            to="/technical-details"
            class="text-sm font-medium text-primary underline underline-offset-4"
          >
            How Squish works, in plain words
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { CompressedImage } from '~/composables/useImageCompression'
import { FileTooLargeError, UnsupportedTypeError, DimensionsTooLargeError, CannotDecodeError } from '~/composables/useImageCompression'
import type { OutputFormatChoice } from '~/utils/constants'
import { QUALITY_DEFAULT, QUALITY_MIN, QUALITY_MAX, QUALITY_STEP, DEBOUNCE_DELAY_MS, SAMPLE_IMAGE_URL, SAMPLE_IMAGE_FILENAME, SAMPLE_DEMO_QUALITY, ACCEPT_ATTRIBUTE, OUTPUT_FORMATS, RESIZE_OPTIONS } from '~/utils/constants'
import { createZip } from '~/utils/zip'

const { compressImage, releaseImage, formatSize, getSavings, getFileExtension, validateFile } = useImageCompression()

const images = ref<CompressedImage[]>([])
const quality = ref(QUALITY_DEFAULT)
const outputFormat = ref<OutputFormatChoice>('original')
const maxDimension = ref(0)
const isDragging = ref(false)
const selectedImageId = ref<string | null>(null)
const isCompressing = ref(false)
const isSampleLoading = ref(false)
const isSampleImage = ref(false)
const qualitySliderContainer = ref<HTMLElement | null>(null)
const errorMessage = ref<string | null>(null)
const compressionCurrent = ref(0)
const compressionTotal = ref(0)

const selectedImage = computed(() => images.value.find(img => img.id === selectedImageId.value) || null)
const totalOriginalSize = computed(() => images.value.reduce((sum, img) => sum + img.originalSize, 0))
const totalCompressedSize = computed(() => images.value.reduce((sum, img) => sum + img.compressedSize, 0))
const totalSavings = computed(() => getSavings(totalOriginalSize.value, totalCompressedSize.value))
const compressionProgressText = computed(() => {
  if (compressionTotal.value <= 1) return 'Compressing...'
  return `Compressing ${compressionCurrent.value} of ${compressionTotal.value}...`
})

/** True when at least one picture is being saved as PNG, which ignores the quality slider. */
const hasLosslessOutput = computed(() => images.value.some(img => img.compressedBlob && img.outputFormat === 'image/png'))

/** Compress with the current quality, format and size settings. */
const compress = (file: File) => compressImage(file, quality.value, outputFormat.value, { maxDimension: maxDimension.value })

const qualityTier = computed(() => {
  if (quality.value >= 50) return 'good'
  if (quality.value >= 25) return 'caution'
  return 'warning'
})

const ensureSliderThumbHasName = () => {
  const container = qualitySliderContainer.value
  if (!container) return
  const thumb = container.querySelector('[role="slider"]')
  if (thumb) {
    thumb.setAttribute('aria-label', 'Image compression quality')
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  // Every dropped file goes through validation, so an unsupported one gets a
  // message instead of being silently ignored.
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length > 0) {
    if (isSampleImage.value) clearAll()
    isSampleImage.value = false
    quality.value = QUALITY_DEFAULT
    await processFiles(files)
  }
}

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length > 0) {
    if (isSampleImage.value) clearAll()
    isSampleImage.value = false
    quality.value = QUALITY_DEFAULT
    await processFiles(files)
  }
  input.value = ''
}

let errorTimer: ReturnType<typeof setTimeout> | null = null

const showError = (message: string) => {
  errorMessage.value = message
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => {
    errorMessage.value = null
  }, 5000)
}

const processFiles = async (files: File[]) => {
  isCompressing.value = true
  compressionTotal.value = files.length
  compressionCurrent.value = 0

  for (const file of files) {
    compressionCurrent.value++

    // Refuse a file that is too large or of an unsupported type before it is
    // added to the list, so a rejected file never lingers as a broken thumbnail.
    try {
      validateFile(file)
    }
    catch (error) {
      showError(error instanceof Error ? error.message : `${file.name} could not be added.`)
      continue
    }

    const id = crypto.randomUUID()
    const previewUrl = URL.createObjectURL(file)
    const newImage: CompressedImage = {
      id,
      originalFile: file,
      originalSize: file.size,
      compressedBlob: null,
      compressedSize: file.size,
      previewUrl,
      compressedUrl: null,
      outputFormat: 'image/jpeg',
    }
    images.value.push(newImage)
    if (!selectedImageId.value)
      selectedImageId.value = id
    try {
      const { blob, url, format } = await compress(file)
      const idx = images.value.findIndex(img => img.id === id)
      if (idx !== -1) {
        const image = images.value[idx]
        if (image) {
          image.compressedBlob = blob
          image.compressedSize = blob.size
          image.compressedUrl = url
          image.outputFormat = format
        }
      }
    }
    catch (error) {
      console.error('Compression failed:', error)
      const msg = error instanceof FileTooLargeError || error instanceof UnsupportedTypeError || error instanceof DimensionsTooLargeError || error instanceof CannotDecodeError
        ? error.message
        : `Failed to compress ${file.name}. Please try again.`
      showError(msg)
      // A picture that could not be compressed has nothing to preview or download.
      removeImage(id)
    }
  }
  isCompressing.value = false
  compressionCurrent.value = 0
  compressionTotal.value = 0
}

// Each run gets a number. Moving the slider again starts a newer run, and an
// older run that is still working must not overwrite the newer run's results.
let recompressRun = 0

const recompressAll = async () => {
  const run = ++recompressRun
  isCompressing.value = true
  for (const img of [...images.value]) {
    try {
      const { blob, url, format } = await compress(img.originalFile)
      if (run !== recompressRun || !images.value.some(i => i.id === img.id)) {
        URL.revokeObjectURL(url)
        if (run !== recompressRun) return
        continue
      }
      // Release the previous result only once its replacement is ready.
      if (img.compressedUrl)
        URL.revokeObjectURL(img.compressedUrl)
      img.compressedBlob = blob
      img.compressedSize = blob.size
      img.compressedUrl = url
      img.outputFormat = format
    }
    catch (error) {
      console.error('Recompression failed:', error)
      showError('Failed to recompress images. Please try again.')
    }
  }
  if (run === recompressRun) isCompressing.value = false
}

const downloadName = (img: CompressedImage) =>
  img.originalFile.name.replace(/\.[^.]+$/, '') + `_compressed.${getFileExtension(img.outputFormat)}`

const saveBlob = (blob: Blob, name: string) => {
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = name
  a.click()
  // Delay revocation to ensure download initiates
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

const downloadImage = (img: CompressedImage) => {
  if (!img.compressedBlob) return
  saveBlob(img.compressedBlob, downloadName(img))
}

/** One ZIP rather than one download per picture, which browsers tend to block. */
const downloadAll = async () => {
  const ready = images.value.filter(img => img.compressedBlob)
  if (ready.length === 0) return
  if (ready.length === 1) {
    downloadImage(ready[0]!)
    return
  }
  try {
    const entries = await Promise.all(ready.map(async img => ({
      name: downloadName(img),
      data: new Uint8Array(await img.compressedBlob!.arrayBuffer()),
    })))
    saveBlob(new Blob([createZip(entries)], { type: 'application/zip' }), 'squish-images.zip')
  }
  catch (error) {
    console.error('Could not build ZIP:', error)
    showError('Could not build the ZIP file. Try downloading the pictures one at a time.')
  }
}

/** Pasting a copied picture or screenshot works like dropping it. */
const handlePaste = async (e: ClipboardEvent) => {
  const files = Array.from(e.clipboardData?.files || []).filter(f => f.type.startsWith('image/'))
  if (files.length === 0) return
  e.preventDefault()
  if (isSampleImage.value) clearAll()
  isSampleImage.value = false
  await processFiles(files)
}

const removeImage = (id: string) => {
  const img = images.value.find(i => i.id === id)
  if (img) {
    releaseImage(img.originalFile)
    URL.revokeObjectURL(img.previewUrl)
    if (img.compressedUrl)
      URL.revokeObjectURL(img.compressedUrl)
  }
  images.value = images.value.filter(i => i.id !== id)
  if (selectedImageId.value === id)
    selectedImageId.value = images.value[0]?.id || null
}

const clearAll = () => {
  images.value.forEach((img) => {
    URL.revokeObjectURL(img.previewUrl)
    if (img.compressedUrl)
      URL.revokeObjectURL(img.compressedUrl)
  })
  images.value = []
  selectedImageId.value = null
  isSampleImage.value = false
  releaseImage()
}

const { debounced: debouncedRecompress } = useDebounce(async () => {
  await recompressAll()
}, DEBOUNCE_DELAY_MS)

watch(quality, async () => {
  // Ensure slider accessibility
  await nextTick()
  ensureSliderThumbHasName()

  // Debounced recompression
  if (images.value.length === 0) return
  debouncedRecompress()
}, { immediate: false })

watch([outputFormat, maxDimension], () => {
  if (images.value.length === 0) return
  debouncedRecompress()
})

const loadSampleImage = async () => {
  if (images.value.length > 0) return
  isSampleLoading.value = true
  try {
    const response = await fetch(SAMPLE_IMAGE_URL)
    if (!response.ok) throw new Error('Failed to fetch sample image')
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) throw new Error('Invalid response content-type')
    const blob = await response.blob()
    const file = new File([blob], SAMPLE_IMAGE_FILENAME, { type: 'image/jpeg' })
    quality.value = SAMPLE_DEMO_QUALITY
    await processFiles([file])
    isSampleImage.value = true
  }
  catch (error) {
    console.warn('Could not load sample image:', error)
  }
  finally {
    isSampleLoading.value = false
  }
}

onMounted(async () => {
  window.addEventListener('paste', handlePaste)
  await nextTick()
  ensureSliderThumbHasName()
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
  releaseImage()
  if (errorTimer) clearTimeout(errorTimer)
  images.value.forEach((img) => {
    URL.revokeObjectURL(img.previewUrl)
    if (img.compressedUrl)
      URL.revokeObjectURL(img.compressedUrl)
  })
})
</script>
