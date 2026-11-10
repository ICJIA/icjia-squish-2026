<template>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
    <div class="space-y-6 rounded-lg border border-border bg-card p-6">
      <div>
        <div class="flex items-baseline justify-between gap-4">
          <label
            for="lt-count"
            class="font-medium text-foreground"
          >Pictures on the page</label>
          <span class="font-mono text-xl font-bold tabular-nums text-primary">{{ count }}</span>
        </div>
        <input
          id="lt-count"
          v-model.number="count"
          type="range"
          min="1"
          max="20"
          step="1"
          class="tech-range mt-2"
        >
      </div>
      <div>
        <div class="flex items-baseline justify-between gap-4">
          <label
            for="lt-size"
            class="font-medium text-foreground"
          >Size of each picture</label>
          <span class="font-mono text-xl font-bold tabular-nums text-primary">{{ sizeMb }} MB</span>
        </div>
        <input
          id="lt-size"
          v-model.number="sizeMb"
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          class="tech-range mt-2"
        >
        <p class="mt-1 text-sm text-muted-foreground">
          A phone photo is usually 2 to 6 MB.
        </p>
      </div>
      <div>
        <div class="flex items-baseline justify-between gap-4">
          <label
            for="lt-saving"
            class="font-medium text-foreground"
          >How much Squish removes</label>
          <span class="font-mono text-xl font-bold tabular-nums text-primary">{{ saving }}%</span>
        </div>
        <input
          id="lt-saving"
          v-model.number="saving"
          type="range"
          min="10"
          max="90"
          step="5"
          class="tech-range mt-2"
        >
        <p class="mt-1 text-sm text-muted-foreground">
          Photos often lose half to four fifths of their size. Yours will vary.
        </p>
      </div>
      <fieldset>
        <legend class="font-medium text-foreground">
          The reader's connection
        </legend>
        <div class="mt-2 flex flex-wrap gap-2">
          <label
            v-for="c in CONNECTIONS"
            :key="c.id"
            class="tech-choice"
          >
            <input
              v-model="connectionId"
              type="radio"
              name="lt-connection"
              :value="c.id"
              class="sr-only"
            >
            <span>{{ c.label }}</span>
          </label>
        </div>
      </fieldset>
    </div>

    <div
      class="flex flex-col justify-center gap-8"
      aria-live="polite"
    >
      <div>
        <p class="text-lg text-muted-foreground">
          Before, the reader waits
        </p>
        <p class="text-5xl font-black tracking-tighter text-foreground sm:text-6xl">
          {{ formatWait(before) }}
        </p>
        <div class="mt-3 h-4 rounded-sm bg-muted-foreground/40" />
        <p class="mt-1 font-mono text-sm text-muted-foreground">
          {{ formatMb(totalMb) }} to download
        </p>
      </div>
      <div>
        <p class="text-lg text-muted-foreground">
          After Squish, the reader waits
        </p>
        <p class="text-5xl font-black tracking-tighter text-primary sm:text-6xl">
          {{ formatWait(after) }}
        </p>
        <div class="mt-3 h-4 rounded-sm bg-muted">
          <div
            class="h-full rounded-sm bg-primary transition-[width] duration-200"
            :style="{ width: `${100 - saving}%` }"
          />
        </div>
        <p class="mt-1 font-mono text-sm text-muted-foreground">
          {{ formatMb(totalMb * (1 - saving / 100)) }} to download
        </p>
      </div>
      <p class="max-w-prose text-sm leading-relaxed text-muted-foreground">
        A simple estimate: total size divided by connection speed
        ({{ connection.mbps }} megabits per second for {{ connection.label.toLowerCase() }}).
        Real pages vary, but the proportion holds.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CONNECTIONS, secondsToDownload, formatWait } from '~/utils/explainers'

const count = ref(6)
const sizeMb = ref(4)
const saving = ref(70)
const connectionId = ref('mobile')

const connection = computed(() => CONNECTIONS.find(c => c.id === connectionId.value) ?? CONNECTIONS[1]!)
const totalMb = computed(() => count.value * sizeMb.value)
const before = computed(() => secondsToDownload(totalMb.value * 1_000_000, connection.value.mbps))
const after = computed(() => before.value * (1 - saving.value / 100))

const formatMb = (mb: number) => `${Number(mb.toFixed(1))} MB`
</script>
