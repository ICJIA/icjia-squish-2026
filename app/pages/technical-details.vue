<template>
  <div class="tech-page min-h-screen bg-background">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-background"
    >Skip to content</a>
    <header class="border-b border-border">
      <div class="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-6 lg:px-10">
        <NuxtLink
          to="/"
          class="text-4xl font-black tracking-tighter text-foreground transition-colors hover:text-primary sm:text-5xl"
        >
          Squish
        </NuxtLink>
        <NuxtLink
          to="/"
          class="tech-cta"
        >
          Squish a picture
        </NuxtLink>
      </div>
    </header>

    <main id="main">
      <!-- Hero: the real thing, running -->
      <section class="tech-section border-t-0">
        <h1 class="max-w-5xl text-5xl leading-[0.95] font-black tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
          Squish makes pictures smaller. They never leave your device.
        </h1>
        <p class="tech-lede">
          This page explains, without jargon, what happens when you drop a picture
          into Squish and why that is worth doing. Start by trying it: your browser
          drew the picture below a moment ago, and it is being squished on your
          own device as you move the slider.
        </p>
        <div class="mt-12">
          <TechLiveLab />
        </div>
      </section>

      <section
        class="tech-section"
        aria-labelledby="why"
      >
        <h2
          id="why"
          class="tech-h2"
        >
          Heavy pictures make people wait
        </h2>
        <p class="tech-lede">
          A photo straight from a phone is far larger than a web page, an email or
          a report needs. Every reader pays for that in waiting time and mobile
          data. Set up a page of your own and see what the difference comes to.
        </p>
        <div class="mt-12">
          <TechLoadTime />
        </div>
        <ul class="mt-14 grid gap-x-10 gap-y-6 md:grid-cols-3">
          <li
            v-for="reason in REASONS"
            :key="reason.title"
            class="border-t-2 border-border pt-4"
          >
            <p class="text-xl font-bold text-foreground">
              {{ reason.title }}
            </p>
            <p class="mt-2 leading-relaxed text-muted-foreground">
              {{ reason.text }}
            </p>
          </li>
        </ul>
      </section>

      <section
        class="tech-section"
        aria-labelledby="privacy"
      >
        <h2
          id="privacy"
          class="tech-h2"
        >
          Where does your picture go? Nowhere.
        </h2>
        <p class="tech-lede">
          Most online picture tools work by taking your picture: it is uploaded to
          a company's computer, processed there, and sent back. Squish does the
          work inside your own browser instead, so there is nothing to upload.
        </p>
        <div class="mt-12">
          <TechPrivacyRoute />
        </div>
        <div class="mt-14 grid gap-x-10 gap-y-6 md:grid-cols-3">
          <div class="border-t-2 border-primary pt-4">
            <p class="text-xl font-bold text-foreground">
              This is a rule, and your browser enforces it
            </p>
            <p class="mt-2 max-w-prose leading-relaxed text-muted-foreground">
              Squish is delivered with an instruction that forbids the page from
              contacting any other website. Even if its code tried to send a
              picture somewhere, your browser would block the attempt.
            </p>
          </div>
          <div class="border-t-2 border-primary pt-4">
            <p class="text-xl font-bold text-foreground">
              You can test it: turn off your internet
            </p>
            <p class="mt-2 max-w-prose leading-relaxed text-muted-foreground">
              After your first visit, Squish works with no connection at all.
              Switch on airplane mode, reload the page, and squish a picture. A
              tool that needed to upload anything could not do that.
            </p>
          </div>
          <div class="border-t-2 border-primary pt-4">
            <p class="text-xl font-bold text-foreground">
              There is nothing on the other end
            </p>
            <p class="mt-2 max-w-prose leading-relaxed text-muted-foreground">
              The site is a set of ready-made files, like pages in a filing
              cabinet. No program runs behind it that could receive a picture, and
              there are no accounts, cookies or visitor tracking.
            </p>
          </div>
        </div>
      </section>

      <section
        class="tech-section"
        aria-labelledby="steps"
      >
        <h2
          id="steps"
          class="tech-h2"
        >
          Five steps from drop to download
        </h2>
        <p class="tech-lede">
          Here is everything that happens between dropping a picture and seeing
          the result. Choose a step to read about it.
        </p>
        <div class="mt-12">
          <TechPipeline />
        </div>
      </section>

      <section
        class="tech-section"
        aria-labelledby="rounding"
      >
        <h2
          id="rounding"
          class="tech-h2"
        >
          How it shrinks without looking worse: rounding
        </h2>
        <p class="tech-lede">
          A picture is a very long list of numbers, one set for every dot. Round
          those numbers a little and neighbouring dots start to match. Matching
          neighbours are cheap to write down. Round too far, and you can see it.
        </p>
        <div class="mt-12">
          <TechRounding />
        </div>
        <p class="mt-8 max-w-prose text-sm leading-relaxed text-muted-foreground">
          This is a simplified picture of the idea. A real JPEG rounds patterns of
          detail inside small squares of the picture rather than single dots,
          which is why heavy squishing shows up as square blocks.
        </p>
      </section>

      <section
        class="tech-section"
        aria-labelledby="made-of"
      >
        <h2
          id="made-of"
          class="tech-h2"
        >
          What it is made of
        </h2>
        <p class="tech-lede">
          Squish is deliberately small: a tool and this explanation, no database,
          no server program and no compression library of its own.
        </p>
        <div class="mt-8">
          <div
            class="inline-flex gap-2 rounded-lg border border-border bg-card p-1.5"
            role="group"
            aria-label="Choose how the parts are described"
          >
            <button
              type="button"
              class="tech-tab"
              :aria-pressed="!technical"
              @click="technical = false"
            >
              In plain words
            </button>
            <button
              type="button"
              class="tech-tab"
              :aria-pressed="technical"
              @click="technical = true"
            >
              In technical terms
            </button>
          </div>
        </div>
        <dl
          class="mt-8"
          aria-live="polite"
        >
          <div
            v-for="part in PARTS"
            :key="part.name"
            class="grid gap-x-10 gap-y-1 border-t border-border py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
          >
            <dt class="text-2xl font-black tracking-tight text-foreground">
              {{ technical ? part.name : part.plainName }}
            </dt>
            <dd class="max-w-prose text-lg leading-relaxed text-muted-foreground">
              {{ technical ? part.technical : part.plain }}
            </dd>
          </div>
        </dl>
      </section>

      <section
        class="tech-section"
        aria-labelledby="checked"
      >
        <h2
          id="checked"
          class="tech-h2"
        >
          Checked, not just claimed
        </h2>
        <p class="tech-lede">
          The code is public, so anyone can read exactly what it does. It is also
          tested and audited before each release.
        </p>
        <dl class="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          <div
            v-for="fact in FACTS"
            :key="fact.label"
            class="flex flex-col-reverse justify-end"
          >
            <dt class="mt-2 leading-snug text-foreground">
              {{ fact.label }}
            </dt>
            <dd class="font-mono text-6xl font-black tracking-tighter text-primary sm:text-7xl">
              {{ fact.value }}
            </dd>
          </div>
        </dl>
        <p class="mt-10 max-w-prose leading-relaxed text-muted-foreground">
          The audit results, with every finding and what was done about it, are
          published in the project's
          <a
            class="tech-link"
            href="https://github.com/ICJIA/icjia-squish-2026/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
          >changelog</a>.
          The full source is on
          <a
            class="tech-link"
            href="https://github.com/ICJIA/icjia-squish-2026"
            target="_blank"
            rel="noopener noreferrer"
          >GitHub</a>
          under the MIT license.
        </p>
      </section>

      <section
        class="tech-section"
        aria-labelledby="limits"
      >
        <h2
          id="limits"
          class="tech-h2"
        >
          What to know before you rely on it
        </h2>
        <ul class="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          <li
            v-for="limit in LIMITS"
            :key="limit.title"
            class="border-t-2 border-border pt-4"
          >
            <p class="text-xl font-bold text-foreground">
              {{ limit.title }}
            </p>
            <p class="mt-2 max-w-prose leading-relaxed text-muted-foreground">
              {{ limit.text }}
            </p>
          </li>
        </ul>
        <div class="mt-16">
          <NuxtLink
            to="/"
            class="tech-cta tech-cta--large"
          >
            Squish a picture
          </NuxtLink>
        </div>
      </section>
    </main>

    <footer class="border-t border-border">
      <div class="mx-auto max-w-[1400px] px-6 py-8 text-sm text-muted-foreground lg:px-10">
        Squish is published by the Illinois Criminal Justice Information Authority.
        All processing happens in your browser.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const TITLE = 'How Squish works - Technical details in plain words'
const DESCRIPTION = 'An interactive, jargon-free explanation of how Squish compresses pictures inside your browser, why smaller pictures matter, and why nothing is ever uploaded.'

useSeoMeta({
  title: TITLE,
  description: DESCRIPTION,
  ogTitle: TITLE,
  ogDescription: DESCRIPTION,
  ogImage: 'https://squish.icjia.app/og-image.png',
  ogUrl: 'https://squish.icjia.app/technical-details',
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: TITLE,
  twitterDescription: DESCRIPTION,
  twitterImage: 'https://squish.icjia.app/og-image.png',
})

const technical = ref(false)

const REASONS = [
  {
    title: 'It fits where it has to go',
    text: 'Email services commonly refuse attachments beyond about 25 MB, and many websites and forms cap uploads far lower. A handful of phone photos is already over.',
  },
  {
    title: 'It costs readers less',
    text: 'People on a phone plan pay for every megabyte. A page of unsquished photos can use more data than an hour of reading.',
  },
  {
    title: 'It usually looks the same',
    text: 'At the recommended setting the difference is hard to find even when you go looking. The comparison slider in the tool is there so you can check for yourself.',
  },
]

const PARTS = [
  {
    plainName: 'The page itself',
    name: 'Nuxt 4 and Vue 3',
    plain: 'Built ahead of time into ordinary files. When you visit, you are handed finished pages rather than having a program assemble them for you.',
    technical: 'A Nuxt 4 application written in TypeScript with Vue 3 single-file components, pre-rendered to static HTML with nuxt generate and hydrated in the browser.',
  },
  {
    plainName: 'The squisher',
    name: 'Canvas API',
    plain: 'Every modern browser already knows how to open and save pictures. Squish simply asks it to, which is why there is nothing to install.',
    technical: 'createImageBitmap() decodes, an OffscreenCanvas holds the pixels, and convertToBlob() re-encodes with the browser\'s native JPEG, WebP or PNG encoder at the chosen quality.',
  },
  {
    plainName: 'The helper',
    name: 'Web Worker',
    plain: 'A second pair of hands that does the heavy lifting in the background, so the page stays responsive while a big photo is processed.',
    technical: 'One long-lived dedicated worker served from the same origin. It caches decoded bitmaps, up to 80 megapixels, so a quality change skips decoding. It is replaced after a 60-second timeout, and there is a main-thread canvas fallback.',
  },
  {
    plainName: 'The look',
    name: 'Nuxt UI and Tailwind CSS 4',
    plain: 'A dark, high-contrast design with large controls, built to work with a keyboard and a screen reader as well as a mouse.',
    technical: 'Nuxt UI 3 components on Tailwind CSS 4 theme tokens, with Lucide icons compiled into the bundle at build time so that none is fetched at runtime.',
  },
  {
    plainName: 'The filing cabinet',
    name: 'Netlify static hosting',
    plain: 'The finished files sit on a hosting service that only hands them out. It has no way to accept anything back.',
    technical: 'Deployed with the netlify-static Nitro preset. There are no functions, no API routes and no storage; hashed assets are cached for a year. A Workbox service worker precaches the site\'s own files for offline use.',
  },
  {
    plainName: 'The house rules',
    name: 'Security headers',
    plain: 'Instructions sent with every page telling your browser what the site may and may not do. One of them: never contact another website.',
    technical: 'A Content-Security-Policy with no third-party host in any directive (connect-src \'self\'), plus HSTS, COOP, CORP, X-Frame-Options, Referrer-Policy and Permissions-Policy.',
  },
  {
    plainName: 'The safety net',
    name: 'Vitest',
    plain: 'More than a hundred and fifty automated checks run on every change, including a real browser that uses the finished site the way you would.',
    technical: 'A Vitest unit suite on happy-dom with Vue Test Utils, plus Playwright browser tests that run against the generated site served with the production security headers. GitHub Actions runs lint, type check, both suites and the build on every pull request.',
  },
]

const FACTS = [
  { value: '0', label: 'pictures uploaded, ever. There is nowhere to upload them to.' },
  { value: '0', label: 'other websites contacted while you use Squish' },
  { value: '0', label: 'accounts, cookies or trackers' },
  { value: '170+', label: 'automated tests, 25 of them in a real browser, run on every change' },
]

const LIMITS = [
  {
    title: 'It removes hidden details from your photos',
    text: 'Phone photos carry hidden notes: the camera model, the time, and often the exact place the photo was taken. A squished picture keeps none of them. For sharing publicly, that is usually what you want.',
  },
  {
    title: 'The quality slider does not change PNG files',
    text: 'PNG is a format that never throws detail away, so there is nothing for the slider to adjust. Squish tells you when this applies. To make a PNG much smaller, choose JPG or WebP under "Save as".',
  },
  {
    title: 'It keeps the picture\'s dimensions unless you ask',
    text: 'By default a photo that is 4,000 dots wide stays 4,000 dots wide. Set "Longest side" to scale large pictures down, which is often the biggest saving of all.',
  },
  {
    title: 'iPhone HEIC photos open only in Safari',
    text: 'Squish relies on your browser to open pictures. Safari can open HEIC; Chrome, Edge and Firefox currently cannot, and Squish will say so. PNG, JPG, WebP and AVIF work everywhere. Files can be up to 50 MB.',
  },
  {
    title: 'It saves as JPG, WebP or PNG',
    text: 'Those are the formats browsers can write. A picture that arrives as AVIF or HEIC is saved as JPG.',
  },
  {
    title: 'Transparent areas turn white in a JPG',
    text: 'JPG cannot store see-through areas. If a logo or diagram has a transparent background, save it as WebP or keep it as PNG.',
  },
]
</script>

<style scoped>
.tech-section {
  margin-inline: auto;
  max-width: 1400px;
  border-top: 1px solid var(--color-border);
  padding: 5rem 1.5rem;
}

@media (min-width: 1024px) {
  .tech-section {
    padding: 8rem 2.5rem;
  }
}

.tech-h2 {
  max-width: 60rem;
  font-size: clamp(2.5rem, 6vw, 4.75rem);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: -0.045em;
  color: var(--color-foreground);
  text-wrap: balance;
}

.tech-lede {
  margin-top: 1.75rem;
  max-width: 44rem;
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--color-muted-foreground);
}
</style>
