<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <div class="space-y-3">
      <div
        ref="frameRef"
        class="relative overflow-hidden rounded-lg bg-muted"
        style="aspect-ratio: 3 / 2;"
        @pointerdown="moveLoupe"
        @pointermove="moveLoupe"
      >
        <img
          v-if="shownUrl"
          :src="shownUrl"
          :alt="showOriginal ? 'Demo picture, original: a dusk landscape with hills, wires and the word squish' : `Demo picture squished at quality ${quality}`"
          class="h-full w-full select-none object-cover"
          draggable="false"
        >
        <p
          v-else
          class="absolute inset-0 flex items-center justify-center px-6 text-center text-foreground"
        >
          {{ status === 'failed' ? 'This browser could not run the live demo. The tool itself may still work.' : 'Drawing a picture in your browser…' }}
        </p>
        <div
          v-if="shownUrl"
          class="pointer-events-none absolute rounded-sm border-2 border-primary"
          :style="loupeMarkerStyle"
          aria-hidden="true"
        />
        <span
          v-if="shownUrl"
          class="absolute top-3 left-3 rounded bg-background px-2 py-1 text-sm font-semibold text-foreground"
        >{{ showOriginal ? 'Original' : `Squished at ${quality}` }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="text-muted-foreground">Look closely at</span>
        <button
          v-for="spot in SPOTS"
          :key="spot.label"
          type="button"
          class="tech-chip"
          :aria-pressed="focus.x === spot.x && focus.y === spot.y"
          @click="focus = { x: spot.x, y: spot.y }"
        >
          {{ spot.label }}
        </button>
        <button
          type="button"
          class="tech-chip ml-auto"
          :aria-pressed="showOriginal"
          @click="showOriginal = !showOriginal"
        >
          {{ showOriginal ? 'Showing the original' : 'Show the original' }}
        </button>
      </div>
    </div>

    <div class="space-y-5">
      <div>
        <div
          class="overflow-hidden rounded-lg border border-border bg-muted"
          style="aspect-ratio: 3 / 2;"
        >
          <div
            v-if="shownUrl"
            class="h-full w-full"
            :style="loupeStyle"
            role="img"
            :aria-label="`The marked part of the picture, magnified ${ZOOM} times`"
          />
        </div>
        <p class="mt-2 text-sm text-muted-foreground">
          The marked area, magnified {{ ZOOM }} times. Move over the picture to look elsewhere.
        </p>
      </div>

      <div class="rounded-lg border border-border bg-card p-5">
        <div class="flex items-baseline justify-between gap-4">
          <label
            for="lab-quality"
            class="text-lg font-semibold text-foreground"
          >Quality</label>
          <span class="font-mono text-4xl font-black tabular-nums text-primary">{{ quality }}</span>
        </div>
        <input
          id="lab-quality"
          v-model.number="quality"
          type="range"
          :min="QUALITY_MIN"
          :max="QUALITY_MAX"
          :step="QUALITY_STEP"
          class="tech-range mt-3"
        >
        <div class="mt-1 flex justify-between text-sm text-muted-foreground">
          <span>Smaller file</span>
          <span>Better picture</span>
        </div>

        <div
          class="mt-5 space-y-3"
          aria-live="polite"
        >
          <div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">
                Original
              </span>
              <span class="font-mono text-foreground">
                {{ originalSize ? formatSize(originalSize) : '…' }}
              </span>
            </div>
            <div class="mt-1 h-3 rounded-sm bg-muted-foreground/40" />
          </div>
          <div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">
                Squished
              </span>
              <span class="font-mono text-foreground">
                {{ compressedSize ? formatSize(compressedSize) : '…' }}
              </span>
            </div>
            <div class="mt-1 h-3 rounded-sm bg-muted">
              <div
                class="h-full rounded-sm bg-primary transition-[width] duration-200"
                :style="{ width: `${barPercent}%` }"
              />
            </div>
          </div>
          <div class="flex items-baseline justify-between border-t border-border pt-3">
            <span class="font-medium text-foreground">
              Result
            </span>
            <span
              class="font-mono text-2xl font-bold"
              :class="savings >= 0 ? 'text-primary' : 'text-yellow-400'"
            >
              {{ resultText }}
            </span>
          </div>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
          {{ verdict }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QUALITY_MIN, QUALITY_MAX, QUALITY_STEP, QUALITY_DEFAULT } from '~/utils/constants'
import { drawDemoScene } from '~/utils/demoScene'

/** How much the loupe magnifies. */
const ZOOM = 8

/** Places worth inspecting: hard edges and smooth gradients show compression first. */
const SPOTS = [
  { label: 'the lettering', x: 0.2, y: 0.9 },
  { label: 'the wires', x: 0.55, y: 0.45 },
  { label: 'the sky', x: 0.78, y: 0.12 },
]

const { compressImage, formatSize, getSavings } = useImageCompression()

const quality = ref(QUALITY_DEFAULT)
const status = ref<'loading' | 'ready' | 'failed'>('loading')
const showOriginal = ref(false)
const focus = ref({ x: SPOTS[0]!.x, y: SPOTS[0]!.y })
const frameRef = ref<HTMLElement | null>(null)

const originalUrl = ref<string | null>(null)
const originalSize = ref(0)
const compressedUrl = ref<string | null>(null)
const compressedSize = ref(0)

let originalFile: File | null = null
let run = 0

const shownUrl = computed(() => (showOriginal.value ? originalUrl.value : compressedUrl.value))
const savings = computed(() => getSavings(originalSize.value, compressedSize.value))
const barPercent = computed(() => {
  if (!originalSize.value || !compressedSize.value) return 0
  return Math.min(100, (compressedSize.value / originalSize.value) * 100)
})

const resultText = computed(() => {
  if (!compressedSize.value) return '…'
  if (savings.value > 0) return `${savings.value}% smaller`
  if (savings.value < 0) return `${Math.abs(savings.value)}% larger`
  return 'Same size'
})

const verdict = computed(() => {
  if (savings.value < 0) return 'Above the quality the picture was first saved at, the file grows and looks no better. There is nothing to gain up here.'
  if (quality.value >= 85) return 'Hard to tell from the original even magnified. Good for print.'
  if (quality.value >= 70) return 'The usual sweet spot: a much smaller file, and the difference is hard to find.'
  if (quality.value >= 50) return 'Fine at normal size. Magnified, the edges of the lettering start to look smudged.'
  if (quality.value >= 25) return 'Now it shows: blocky patches in the sky and a halo around the lettering.'
  return 'Very small, and visibly damaged. The picture has broken into square blocks.'
})

const loupeStyle = computed(() => ({
  backgroundImage: `url("${shownUrl.value}")`,
  backgroundSize: `${ZOOM * 100}% ${ZOOM * 100}%`,
  backgroundPosition: `${focus.value.x * 100}% ${focus.value.y * 100}%`,
  backgroundRepeat: 'no-repeat',
  imageRendering: 'pixelated' as const,
}))

const loupeMarkerStyle = computed(() => {
  const size = 100 / ZOOM
  return {
    width: `${size}%`,
    height: `${size}%`,
    left: `${focus.value.x * (100 - size)}%`,
    top: `${focus.value.y * (100 - size)}%`,
  }
})

const moveLoupe = (e: PointerEvent) => {
  const frame = frameRef.value
  if (!frame) return
  const rect = frame.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  focus.value = {
    x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
    y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
  }
}

/** Compress the demo picture with the same code path the tool itself uses. */
const squish = async () => {
  if (!originalFile) return
  const current = ++run
  try {
    const { blob, url } = await compressImage(originalFile, quality.value, 'image/jpeg')
    if (current !== run) {
      URL.revokeObjectURL(url)
      return
    }
    if (compressedUrl.value) URL.revokeObjectURL(compressedUrl.value)
    compressedUrl.value = url
    compressedSize.value = blob.size
    status.value = 'ready'
  }
  catch {
    if (current === run) status.value = 'failed'
  }
}

const { debounced: squishSoon } = useDebounce(squish, 120)

watch(quality, () => {
  showOriginal.value = false
  squishSoon()
})

onMounted(async () => {
  const canvas = document.createElement('canvas')
  if (!drawDemoScene(canvas)) {
    status.value = 'failed'
    return
  }
  // Saved the way a camera would save it: high quality, not lossless.
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95))
  if (!blob) {
    status.value = 'failed'
    return
  }
  originalFile = new File([blob], 'demo-picture.jpg', { type: 'image/jpeg' })
  originalSize.value = blob.size
  originalUrl.value = URL.createObjectURL(blob)
  await squish()
})

onUnmounted(() => {
  run++
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value)
  if (compressedUrl.value) URL.revokeObjectURL(compressedUrl.value)
})
</script>
