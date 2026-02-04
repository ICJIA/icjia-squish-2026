<template>
  <div
    ref="containerRef"
    class="relative w-full cursor-ew-resize select-none overflow-hidden rounded-lg bg-muted"
    style="aspect-ratio: 3/2; min-height: 700px; max-height: 900px;"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @touchmove="handleTouchMove"
  >
    <!-- Original Image (full, underneath) -->
    <img
      :src="originalUrl || '/placeholder.svg'"
      alt="Original"
      class="absolute inset-0 h-full w-full object-contain"
      draggable="false"
    >

    <!-- Compressed Image (clipped, on top) -->
    <img
      :src="compressedUrl || '/placeholder.svg'"
      alt="Compressed"
      class="absolute inset-0 h-full w-full object-contain"
      :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }"
      draggable="false"
    >

    <!-- Divider Line -->
    <div
      class="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg"
      :style="{ left: `${position}%`, transform: 'translateX(-50%)' }"
      @mousedown="handleMouseDown"
      @touchstart="handleMouseDown"
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
</template>

<script setup lang="ts">
const _props = defineProps<{
  originalUrl: string
  compressedUrl: string
  originalSize: number
  compressedSize: number
}>()

const { formatSize } = useImageCompression()

const position = ref(50)
const containerRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)

const handleMove = (clientX: number) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
  position.value = percentage
}

const handleMouseDown = () => {
  isDragging.value = true
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    handleMove(e.clientX)
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleTouchMove = (e: TouchEvent) => {
  handleMove(e.touches[0].clientX)
}
</script>
