<template>
  <div>
    <div
      class="inline-flex flex-wrap gap-2 rounded-lg border border-border bg-card p-1.5"
      role="group"
      aria-label="Compare where a picture travels"
    >
      <button
        type="button"
        class="tech-tab"
        :aria-pressed="mode === 'squish'"
        @click="mode = 'squish'"
      >
        With Squish
      </button>
      <button
        type="button"
        class="tech-tab"
        :aria-pressed="mode === 'upload'"
        @click="mode = 'upload'"
      >
        With a typical upload site
      </button>
    </div>

    <div
      class="route mt-8"
      :class="`route--${mode}`"
    >
      <div class="route__track">
        <div
          v-for="station in stations"
          :key="station.name"
          class="route__station"
          :class="{ 'route__station--idle': !station.used }"
        >
          <p class="text-xl font-bold text-foreground sm:text-2xl">
            {{ station.name }}
          </p>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
            {{ station.note }}
          </p>
        </div>
        <div
          class="route__dot"
          aria-hidden="true"
        />
      </div>
    </div>

    <ol
      class="mt-8 grid gap-x-10 gap-y-4 md:grid-cols-3"
      aria-live="polite"
    >
      <li
        v-for="(step, i) in steps"
        :key="step"
        class="flex gap-3 text-foreground"
      >
        <span class="font-mono text-lg font-bold text-primary">{{ i + 1 }}</span>
        <span class="leading-relaxed">{{ step }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
const mode = ref<'squish' | 'upload'>('squish')

const stations = computed(() => mode.value === 'squish'
  ? [
      { name: 'Your device', note: 'The picture is opened, squished and saved here.', used: true },
      { name: 'The internet', note: 'Not used. Nothing is sent.', used: false },
      { name: 'Someone else\'s computer', note: 'Not used. There isn\'t one.', used: false },
    ]
  : [
      { name: 'Your device', note: 'You choose a picture and wait for the upload.', used: true },
      { name: 'The internet', note: 'The whole picture travels out, and later back.', used: true },
      { name: 'Someone else\'s computer', note: 'Opens your picture and processes it.', used: true },
    ])

const steps = computed(() => mode.value === 'squish'
  ? [
      'You drop a picture onto the page.',
      'Your own browser does the work, on your own device.',
      'You download the result. No copy exists anywhere else.',
    ]
  : [
      'Your picture is uploaded to a company\'s server.',
      'The server processes it. What else happens to it depends on that company\'s policy.',
      'The result is sent back. A copy may remain behind.',
    ])
</script>

<style scoped>
.route__track {
  position: relative;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
}

.route__station {
  border: 2px solid var(--color-primary);
  border-radius: 0.5rem;
  padding: 1.25rem 1.25rem 3rem;
  background: var(--color-card);
  transition: background-color 0.25s, border-color 0.25s;
}

.route__station--idle {
  border-style: dashed;
  border-color: var(--color-border);
  background: transparent;
}

.route__station--idle p:first-child {
  color: var(--color-muted-foreground);
}

.route--upload .route__station {
  border-color: oklch(0.8 0.15 80);
}

/* The travelling picture. Its positions are fractions of the track. On narrow
   screens the three stations stack, so it travels down instead of across. */
.route__dot {
  position: absolute;
  left: 1.25rem;
  top: calc(33.333% - 2.25rem);
  width: 1.5rem;
  height: 1.125rem;
  border-radius: 0.2rem;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px oklch(0.8 0.18 152 / 0.25);
}

.route--squish .route__dot {
  animation: stay 2.4s ease-in-out infinite;
}

.route--upload .route__dot {
  background: oklch(0.8 0.15 80);
  box-shadow: 0 0 0 4px oklch(0.8 0.15 80 / 0.25);
  animation: travel-down 5s ease-in-out infinite;
}

@keyframes stay {
  0%, 100% { left: 1.25rem; }
  50% { left: 4rem; }
}

@keyframes travel-down {
  0%, 8%, 92%, 100% { top: calc(33.333% - 2.25rem); }
  42%, 58% { top: calc(100% - 2rem); }
}

@keyframes travel-across {
  0%, 8%, 92%, 100% { left: 1.25rem; }
  42%, 58% { left: calc(66.666% + 1.5rem); }
}

@media (min-width: 768px) {
  .route__track {
    grid-template-columns: repeat(3, 1fr);
  }

  .route__dot {
    top: calc(100% - 2rem);
  }

  .route--upload .route__dot {
    animation-name: travel-across;
  }
}

@media (prefers-reduced-motion: reduce) {
  .route__dot {
    animation: none !important;
  }
}
</style>
