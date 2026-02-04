<template>
  <div class="min-h-screen bg-background">
    <header class="border-b border-border">
      <div class="mx-auto flex h-32 max-w-[2000px] items-center justify-between px-6 py-8 lg:px-10">
        <h1 class="text-6xl font-black tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
          Squish
        </h1>
        <span class="hidden text-sm tracking-wide text-muted-foreground sm:block">image compression for writers and designers</span>
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
              accept="image/png,image/jpeg,image/jpg"
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
                  or click to browse — PNG and JPG supported
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="selectedImage && selectedImage.compressedUrl"
            class="space-y-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold text-foreground">
                  Preview Comparison
                </h2>
                <span class="text-sm text-muted-foreground">Drag slider to compare</span>
              </div>
              <button
                class="text-sm text-primary transition-colors hover:text-primary/80"
                @click="downloadImage(selectedImage)"
              >
                Download this image
              </button>
            </div>
            <ComparisonSlider
              :key="`${selectedImage.id}-${selectedImage.compressedUrl}`"
              :original-url="selectedImage.previewUrl"
              :compressed-url="selectedImage.compressedUrl"
              :original-size="selectedImage.originalSize"
              :compressed-size="selectedImage.compressedSize"
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
                :class="['group relative cursor-pointer overflow-hidden rounded border-2 transition-all', selectedImageId === img.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground']"
                role="button"
                tabindex="0"
                @click="selectedImageId = img.id"
              >
                <div class="aspect-square bg-muted">
                  <img
                    :src="img.previewUrl"
                    :alt="img.originalFile.name"
                    class="h-full w-full object-cover"
                  >
                </div>
                <div
                  v-if="getSavings(img.originalSize, img.compressedSize) > 0"
                  class="absolute top-2 left-2 rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground"
                >
                  -{{ getSavings(img.originalSize, img.compressedSize) }}%
                </div>
                <div class="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    class="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
                    aria-label="Download"
                    @click.stop="downloadImage(img)"
                  >
                    <UIcon
                      name="i-lucide-download"
                      class="h-5 w-5"
                    />
                  </button>
                  <button
                    class="rounded-full bg-destructive p-2 text-destructive-foreground transition-colors hover:bg-destructive/90"
                    aria-label="Remove"
                    @click.stop="removeImage(img.id)"
                  >
                    <UIcon
                      name="i-lucide-x"
                      class="h-5 w-5"
                    />
                  </button>
                </div>
                <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 to-transparent p-2 pt-6">
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
              <h3 class="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Quality
              </h3>
              <span class="text-4xl font-black tabular-nums text-primary">{{ quality }}%</span>
            </div>
            <USlider
              v-model="quality"
              :min="10"
              :max="100"
              :step="5"
              color="primary"
              size="lg"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
            <QualityIndicator
              :quality="quality"
              :savings="totalSavings"
            />
          </div>
          <div
            v-if="images.length > 0"
            class="space-y-6 rounded border border-border bg-card p-6"
          >
            <h3 class="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Summary
            </h3>
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
              />Download all
            </button>
          </div>
          <div
            v-if="isCompressing"
            class="flex items-center justify-center gap-3 rounded border border-border bg-card p-4"
          >
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
            <span class="text-sm text-muted-foreground">Compressing...</span>
          </div>
        </div>
      </div>
    </main>
    <footer class="mt-16 border-t border-border">
      <div class="mx-auto max-w-[2000px] px-6 py-8 lg:px-10">
        <div class="flex flex-col items-center gap-4 text-center">
          <p class="text-lg font-semibold tracking-wide" style="color: #45d87a;">
            Privacy-focused • Real-time preview • Instant compression
          </p>
          <p class="text-sm text-muted-foreground">
            All processing happens locally in your browser. Your images never leave your device.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { CompressedImage } from '~/composables/useImageCompression'

const { compressImage, formatSize, getSavings } = useImageCompression()

const images = ref<CompressedImage[]>([])
const quality = ref(75)
const isDragging = ref(false)
const selectedImageId = ref<string | null>(null)
const isCompressing = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const selectedImage = computed(() => images.value.find(img => img.id === selectedImageId.value) || null)
const totalOriginalSize = computed(() => images.value.reduce((sum, img) => sum + img.originalSize, 0))
const totalCompressedSize = computed(() => images.value.reduce((sum, img) => sum + img.compressedSize, 0))
const totalSavings = computed(() => getSavings(totalOriginalSize.value, totalCompressedSize.value))

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
  const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'))
  if (files.length > 0) await processFiles(files)
}

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length > 0) await processFiles(files)
  input.value = ''
}

const processFiles = async (files: File[]) => {
  isCompressing.value = true
  for (const file of files) {
    const id = crypto.randomUUID()
    const previewUrl = URL.createObjectURL(file)
    const newImage: CompressedImage = { id, originalFile: file, originalSize: file.size, compressedBlob: null, compressedSize: file.size, previewUrl, compressedUrl: null }
    images.value.push(newImage)
    if (!selectedImageId.value) selectedImageId.value = id
    try {
      const { blob, url } = await compressImage(file, quality.value)
      const idx = images.value.findIndex(img => img.id === id)
      if (idx !== -1) { images.value[idx].compressedBlob = blob; images.value[idx].compressedSize = blob.size; images.value[idx].compressedUrl = url }
    }
    catch (error) { console.error('Compression failed:', error) }
  }
  isCompressing.value = false
}

const recompressAll = async () => {
  isCompressing.value = true
  for (const img of images.value) {
    if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
    try {
      const { blob, url } = await compressImage(img.originalFile, quality.value)
      img.compressedBlob = blob; img.compressedSize = blob.size; img.compressedUrl = url
    }
    catch (error) { console.error('Recompression failed:', error) }
  }
  isCompressing.value = false
}

const downloadImage = (img: CompressedImage) => {
  if (!img.compressedBlob) return
  const a = document.createElement('a')
  a.href = URL.createObjectURL(img.compressedBlob)
  a.download = img.originalFile.name.replace(/\.[^.]+$/, '') + '_compressed.jpg'
  a.click()
  URL.revokeObjectURL(a.href)
}

const downloadAll = async () => {
  for (const img of images.value) { if (img.compressedBlob) downloadImage(img) }
}

const removeImage = (id: string) => {
  const img = images.value.find(i => i.id === id)
  if (img) { URL.revokeObjectURL(img.previewUrl); if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl) }
  images.value = images.value.filter(i => i.id !== id)
  if (selectedImageId.value === id) selectedImageId.value = images.value[0]?.id || null
}

const clearAll = () => {
  images.value.forEach((img) => { URL.revokeObjectURL(img.previewUrl); if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl) })
  images.value = []; selectedImageId.value = null
}

watch(quality, async () => {
  if (images.value.length === 0) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    await recompressAll()
  }, 150)
}, { immediate: false })

onUnmounted(() => {
  images.value.forEach((img) => { URL.revokeObjectURL(img.previewUrl); if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl) })
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
