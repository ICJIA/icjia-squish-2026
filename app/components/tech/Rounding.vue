<template>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <div>
      <div
        class="grid grid-cols-6 gap-1.5 sm:grid-cols-12"
        role="img"
        :aria-label="`A row of 24 dots. With this much rounding they take ${runs.length} entries to write down.`"
      >
        <div
          v-for="(value, i) in rounded"
          :key="i"
          class="flex aspect-square items-end justify-center rounded-sm pb-1 font-mono text-sm leading-none font-semibold"
          :style="swatchStyle(value)"
        >
          {{ value }}
        </div>
      </div>

      <div class="mt-6">
        <div class="flex items-baseline justify-between gap-4">
          <label
            for="round-step"
            class="text-lg font-semibold text-foreground"
          >Rounding</label>
          <span class="font-mono text-lg font-bold text-primary">{{ stepLabel }}</span>
        </div>
        <input
          id="round-step"
          v-model.number="level"
          type="range"
          min="0"
          :max="LEVELS.length - 1"
          step="1"
          class="tech-range mt-2"
          :aria-valuetext="stepLabel"
        >
        <div class="mt-1 flex justify-between text-sm text-muted-foreground">
          <span>Exact</span>
          <span>Very rough</span>
        </div>
      </div>
    </div>

    <div
      class="rounded-lg border border-border bg-card p-6"
      aria-live="polite"
    >
      <p class="text-muted-foreground">
        To write these 24 dots down you need
      </p>
      <p class="mt-1 text-6xl font-black tracking-tighter text-primary">
        {{ runs.length }} <span class="text-2xl font-bold tracking-normal text-foreground">{{ runs.length === 1 ? 'entry' : 'entries' }}</span>
      </p>
      <p class="mt-4 font-mono text-sm leading-relaxed break-words text-foreground">
        {{ shorthand }}
      </p>
      <p class="mt-4 text-sm leading-relaxed text-muted-foreground">
        {{ comment }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { roundValues, toRuns } from '~/utils/explainers'

/** Brightness of 24 neighbouring dots: a smooth fade with a little natural variation. */
const DOTS = [62, 64, 63, 67, 70, 69, 74, 78, 77, 83, 88, 86, 93, 97, 99, 104, 110, 109, 117, 122, 126, 131, 137, 141]

const LEVELS = [1, 4, 8, 16, 32, 64]

const level = ref(0)
const step = computed(() => LEVELS[level.value] ?? 1)
const rounded = computed(() => roundValues(DOTS, step.value))
const runs = computed(() => toRuns(rounded.value))

/** Stretch the 60–140 range across most of dark-to-light so the fade is easy to see. */
const swatchStyle = (value: number) => {
  const shade = Math.max(0, Math.min(255, Math.round((value - 50) * 2.3 + 25)))
  const rgb = [Math.round(shade * 0.3), shade, Math.round(shade * 0.55)] as const
  // Pick whichever of near-black or near-white reads better on this swatch.
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return {
    backgroundColor: `rgb(${rgb.join(' ')})`,
    color: luminance > 0.18 ? '#0b0b0b' : '#ffffff',
  }
}

const stepLabel = computed(() => (step.value === 1 ? 'none' : `to the nearest ${step.value}`))

const shorthand = computed(() => runs.value
  .map(run => (run.count === 1 ? `${run.value}` : `${run.count} × ${run.value}`))
  .join(', '))

const comment = computed(() => {
  if (step.value === 1) return 'Every dot is slightly different from its neighbour, so each one has to be written out in full.'
  if (step.value <= 8) return 'Neighbours now share values, so they can be written as "three of these, four of those". The fade still looks smooth.'
  if (step.value <= 16) return 'Far fewer entries. Look closely and the smooth fade has become a few distinct bands.'
  return 'Very little to write down, and it shows: the fade is now a couple of flat blocks. This is what a quality of 10 looks like.'
})
</script>
