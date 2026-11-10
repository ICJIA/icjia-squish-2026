<template>
  <div>
    <ol class="grid grid-cols-5 gap-1.5 sm:gap-3">
      <li
        v-for="(step, i) in STEPS"
        :key="step.name"
      >
        <button
          type="button"
          class="pipe-step"
          :aria-current="i === active ? 'step' : undefined"
          @click="active = i"
        >
          <span class="font-mono text-2xl font-black sm:text-4xl">{{ i + 1 }}</span>
          <span class="mt-1 block text-xs font-semibold sm:text-base">{{ step.name }}</span>
        </button>
      </li>
    </ol>

    <div
      class="mt-6 grid gap-8 rounded-lg border border-border bg-card p-6 sm:p-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
      aria-live="polite"
    >
      <div>
        <h3 class="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {{ current.title }}
        </h3>
        <p class="mt-4 max-w-prose text-lg leading-relaxed text-foreground">
          {{ current.plain }}
        </p>
        <details class="mt-5 max-w-prose">
          <summary class="cursor-pointer font-semibold text-primary">
            Under the hood
          </summary>
          <p class="mt-2 leading-relaxed text-muted-foreground">
            {{ current.hood }}
          </p>
        </details>
        <div class="mt-8 flex gap-3">
          <button
            type="button"
            class="tech-chip"
            :disabled="active === 0"
            @click="active--"
          >
            Previous step
          </button>
          <button
            type="button"
            class="tech-chip"
            :disabled="active === STEPS.length - 1"
            @click="active++"
          >
            Next step
          </button>
        </div>
      </div>

      <div>
        <p class="font-semibold text-foreground">
          How much room the picture takes up
        </p>
        <p class="mt-1 text-sm text-muted-foreground">
          Example: a 12-megapixel phone photo squished at quality 75.
        </p>
        <ul class="mt-5 space-y-4">
          <li
            v-for="state in FOOTPRINT"
            :key="state.label"
          >
            <div class="flex justify-between gap-4 text-sm">
              <span :class="state.steps.includes(active) ? 'font-semibold text-foreground' : 'text-muted-foreground'">{{ state.label }}</span>
              <span
                class="font-mono"
                :class="state.steps.includes(active) ? 'font-semibold text-primary' : 'text-muted-foreground'"
              >{{ state.size }}</span>
            </div>
            <div class="mt-1 h-3 rounded-sm bg-muted">
              <div
                class="h-full rounded-sm"
                :class="state.steps.includes(active) ? 'bg-primary' : 'bg-muted-foreground/50'"
                :style="{ width: `${state.percent}%` }"
              />
            </div>
          </li>
        </ul>
        <p class="mt-5 text-sm leading-relaxed text-muted-foreground">
          A picture file is a packed suitcase. To change it, the browser has to
          unpack it completely, which takes about ten times the room, and then
          pack it again more tightly.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const STEPS = [
  {
    name: 'Check',
    title: 'Squish reads the label before opening anything',
    plain: 'Is this a kind of picture Squish can open: PNG, JPG, WebP, AVIF or an iPhone HEIC photo? Is it 50 MB or less? Anything else is turned away with a message saying why, before any work is done.',
    hood: 'validateFile() compares the file\'s type against a fixed list and its size against a 50 MB cap. HEIC is accepted only where the browser itself can decode it, which today means Safari; elsewhere it is refused with an explanation. Once the dimensions are known, a picture of more than 100 megapixels is also refused, so a small file that describes an enormous picture cannot exhaust the device\'s memory.',
  },
  {
    name: 'Hand off',
    title: 'A helper takes the job, so the page never freezes',
    plain: 'Squishing a big photo is real work. Squish gives the job to a helper that runs alongside the page, so buttons and sliders keep responding while it works. The helper keeps the picture open, so trying a different quality is quick.',
    hood: 'The helper is a single Web Worker, compression-worker.js, running on its own thread and loaded from this site only. It keeps recently decoded pictures in a cache limited to 80 megapixels, so a quality change re-encodes without decoding again. Browsers without OffscreenCanvas do the same work on the page\'s own thread. A helper that has not answered after 60 seconds is stopped and replaced.',
  },
  {
    name: 'Unpack',
    title: 'The picture is opened into millions of coloured dots',
    plain: 'Every dot is four numbers: how much red, green and blue, and how see-through it is. Only the dots are kept. Anything else that was tucked into the file, such as the camera model or the place the photo was taken, is left behind.',
    hood: 'createImageBitmap() decodes the file and drawImage() paints it onto a canvas: 4,000 × 3,000 dots × 4 numbers is 48 million numbers. If you asked for a smaller picture, it is scaled down at this point. Because only the canvas is saved afterwards, EXIF metadata, including GPS position, does not survive.',
  },
  {
    name: 'Repack',
    title: 'The dots are saved again, more thriftily',
    plain: 'The quality number says how much fine detail to keep. At 75, the saver throws away detail the eye barely registers, and the file shrinks a great deal. At 20, it throws away detail you will miss. You can also choose to save as JPG or WebP, whatever the picture started as.',
    hood: 'canvas.convertToBlob({ type, quality }) uses the JPEG or WebP encoder built into the browser, so Squish ships no compression library of its own. By default a picture keeps the format it arrived in; AVIF and HEIC, which browsers cannot write, become JPG. PNG is lossless, so the quality number has no effect on PNG output, and the tool says so and offers JPG or WebP instead. Saving as JPG paints a white background first, because JPG has no transparency.',
  },
  {
    name: 'Save',
    title: 'You compare the two, then download',
    plain: 'The result is held in the browser\'s memory, next to the original, so you can drag between them. The file on your disk is never changed. Close the tab and both copies in memory are gone.',
    hood: 'The result is a Blob addressed by a temporary blob: URL that only this tab can read. Download uses an ordinary link with a download attribute, and adds _compressed to the file name. Several pictures are packed into one ZIP file, built in the browser. The URLs are revoked when a picture is removed or the page is closed.',
  },
]

/** Bars are scaled to the largest state; `steps` lists the steps each state belongs to. */
const FOOTPRINT = [
  { label: 'The file you dropped', size: '4 MB', percent: 9, steps: [0, 1] },
  { label: 'Unpacked into dots', size: '46 MB', percent: 100, steps: [2] },
  { label: 'Repacked by Squish', size: 'about 1 MB', percent: 2.5, steps: [3, 4] },
]

const active = ref(0)
const current = computed(() => STEPS[active.value]!)
</script>

<style scoped>
.pipe-step {
  width: 100%;
  height: 100%;
  border-top: 4px solid var(--color-border);
  padding: 0.75rem 0.25rem 0.5rem;
  text-align: left;
  color: var(--color-muted-foreground);
  transition: color 0.15s, border-color 0.15s;
}

.pipe-step:hover {
  color: var(--color-foreground);
}

.pipe-step[aria-current='step'] {
  border-top-color: var(--color-primary);
  color: var(--color-primary);
}

.pipe-step:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
</style>
