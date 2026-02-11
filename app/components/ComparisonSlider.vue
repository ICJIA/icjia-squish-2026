<template>
  <div class="space-y-3">
    <!-- Zoom and Quality Controls -->
    <div class="space-y-3 rounded-lg border border-border bg-card px-4 py-3">
      <!-- Zoom Controls Row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-muted-foreground">Zoom:</span>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              :disabled="zoom === 100"
              aria-label="Reset zoom to 100%"
              @click="resetZoom"
            >
              Reset
            </button>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              :disabled="zoom >= 800"
              aria-label="Zoom in"
              @click="zoomIn"
            >
              <UIcon name="i-lucide-zoom-in" class="h-4 w-4" aria-hidden="true" />
            </button>
            <span class="min-w-[3.5rem] text-center text-sm font-bold text-primary tabular-nums">{{ zoom }}%</span>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              :disabled="zoom <= 100"
              aria-label="Zoom out"
              @click="zoomOut"
            >
              <UIcon name="i-lucide-zoom-out" class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div v-if="zoom > 100" class="text-xs text-muted-foreground">
          Click and drag to pan
        </div>
      </div>
      
      <!-- Quality Slider Row -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <span id="preview-quality-label" class="text-sm font-medium text-muted-foreground">Quality:</span>
          <span class="min-w-[3.5rem] text-center text-sm font-bold text-primary tabular-nums">{{ localQuality }}%</span>
        </div>
        <div ref="previewQualitySliderContainer" class="flex-1">
          <USlider
            v-model="localQuality"
            :min="10"
            :max="100"
            :step="5"
            color="primary"
            size="md"
            class="w-full"
            aria-labelledby="preview-quality-label"
            aria-label="Image compression quality"
          />
        </div>
        <div class="flex gap-2 text-[10px] text-muted-foreground">
          <span>Smaller</span>
          <span>•</span>
          <span>Better</span>
        </div>
      </div>
    </div>

    <!-- Comparison Container -->
    <div
      ref="containerRef"
      class="relative w-full select-none overflow-hidden rounded-lg bg-muted"
      :class="zoom > 100 ? 'cursor-grab active:cursor-grabbing' : 'cursor-ew-resize'"
      style="aspect-ratio: 3/2; min-height: 700px; max-height: 900px;"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Original Image (full, underneath) -->
      <div class="absolute inset-0 overflow-hidden">
        <img
          :src="originalUrl || '/placeholder.svg'"
          alt="Original"
          class="h-full w-full object-contain"
          :style="imageTransformStyle"
          draggable="false"
        >
      </div>

      <!-- Compressed Image (clipped at container level, on top) -->
      <div
        class="absolute inset-0 overflow-hidden"
        :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }"
      >
        <img
          :src="compressedUrl || '/placeholder.svg'"
          alt="Compressed"
          class="h-full w-full object-contain"
          :style="imageTransformStyle"
          draggable="false"
        >
      </div>

      <!-- Divider Line -->
      <div
        class="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg"
        :style="{ left: `${position}%`, transform: 'translateX(-50%)', cursor: 'ew-resize' }"
        @mousedown.stop="handleSliderMouseDown"
        @touchstart.stop="handleSliderTouchStart"
      >
        <!-- Handle -->
        <div class="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background shadow-lg">
          <UIcon
            name="i-lucide-chevron-left"
            class="h-4 w-4 -mr-1 text-primary"
          />
          <UIcon
            name="i-lucide-chevron-right"
            class="h-4 w-4 -ml-1 text-primary"
          />
        </div>
      </div>

      <!-- Labels -->
      <div class="absolute top-3 left-3 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
        Compressed: {{ formatSize(compressedSize) }}
      </div>
      <div class="absolute top-3 right-3 rounded border border-border bg-background/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
        Original: {{ formatSize(originalSize) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  originalUrl: string
  compressedUrl: string
  originalSize: number
  compressedSize: number
  quality: number
}>()

const emit = defineEmits<{
  'update:quality': [value: number]
}>()

const { formatSize } = useImageCompression()

// Slider state
const position = ref(50)
const containerRef = ref<HTMLDivElement | null>(null)
const isDraggingSlider = ref(false)
const previewQualitySliderContainer = ref<HTMLElement | null>(null)

// Quality state (local copy synced with parent)
const localQuality = ref(props.quality)

// Zoom and pan state
const zoom = ref(100)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPanPosition = ref({ x: 0, y: 0 })

// Computed styles
const imageTransformStyle = computed(() => ({
  transform: `scale(${zoom.value / 100}) translate(${panX.value}px, ${panY.value}px)`,
  transformOrigin: 'center center',
  willChange: 'transform',
}))

const ensurePreviewSliderThumbHasName = () => {
  const container = previewQualitySliderContainer.value
  if (!container) return
  const thumb = container.querySelector('[role="slider"]')
  if (thumb) {
    thumb.setAttribute('aria-label', 'Image compression quality')
  }
}


// Zoom controls
const zoomIn = () => {
  zoom.value = Math.min(800, zoom.value + 50)
}

const zoomOut = () => {
  if (zoom.value <= 100) {
    resetZoom()
  } else {
    zoom.value = Math.max(100, zoom.value - 50)
  }
}

const resetZoom = () => {
  zoom.value = 100
  panX.value = 0
  panY.value = 0
}

// Slider movement
const handleSliderMove = (clientX: number) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
  position.value = percentage
}

const handleSliderMouseDown = () => {
  isDraggingSlider.value = true
}

const handleSliderTouchStart = () => {
  isDraggingSlider.value = true
}

// Pan movement
const startPan = (clientX: number, clientY: number) => {
  if (zoom.value <= 100) return
  isPanning.value = true
  lastPanPosition.value = { x: clientX, y: clientY }
}

const handlePanMove = (clientX: number, clientY: number) => {
  if (!isPanning.value || zoom.value <= 100) return
  
  const deltaX = clientX - lastPanPosition.value.x
  const deltaY = clientY - lastPanPosition.value.y
  
  // Scale the delta by zoom level for more natural panning
  const scaleFactor = zoom.value / 100
  panX.value += deltaX / scaleFactor
  panY.value += deltaY / scaleFactor
  
  lastPanPosition.value = { x: clientX, y: clientY }
}

const stopPan = () => {
  isPanning.value = false
}

// Unified mouse handlers
const handleMouseDown = (e: MouseEvent) => {
  if (zoom.value > 100) {
    startPan(e.clientX, e.clientY)
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDraggingSlider.value) {
    handleSliderMove(e.clientX)
  } else if (isPanning.value) {
    handlePanMove(e.clientX, e.clientY)
  }
}

const handleMouseUp = () => {
  isDraggingSlider.value = false
  stopPan()
}

// Touch handlers
const handleTouchStart = (e: TouchEvent) => {
  if (e.touches[0] && zoom.value > 100) {
    startPan(e.touches[0].clientX, e.touches[0].clientY)
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!e.touches[0]) return
  
  if (isDraggingSlider.value) {
    handleSliderMove(e.touches[0].clientX)
  } else if (isPanning.value) {
    handlePanMove(e.touches[0].clientX, e.touches[0].clientY)
  }
}

const handleTouchEnd = () => {
  isDraggingSlider.value = false
  stopPan()
}

// Reset pan when zoom is reset
watch(zoom, (newZoom) => {
  if (newZoom === 100) {
    panX.value = 0
    panY.value = 0
  }
})

// Sync quality with parent
watch(() => props.quality, (newQuality) => {
  localQuality.value = newQuality
})

// Emit quality changes to parent
watch(localQuality, (newQuality) => {
  emit('update:quality', newQuality)
})

onMounted(async () => {
  await nextTick()
  ensurePreviewSliderThumbHasName()
})

watch(localQuality, async () => {
  await nextTick()
  ensurePreviewSliderThumbHasName()
})
</script>
