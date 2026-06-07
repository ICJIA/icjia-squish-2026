<template>
  <ImageCompressor />
</template>

<script setup lang="ts">
// Use Nuxt SEO module's useSeoMeta with proper configuration
useSeoMeta({
  title: 'Squish - Image Compression for Writers & Developers',
  description: 'Privacy-focused image compression for writers and developers. Compress images instantly in your browser with real-time preview. No uploads required.',
  author: 'cschweda',
  ogTitle: 'Squish - Image Compression for Writers & Developers',
  ogDescription: 'Privacy-focused image compression for writers and developers. Compress images instantly in your browser with real-time preview. No uploads required.',
  ogImage: 'https://squish.icjia.app/og-image.png',
  ogImageAlt: 'Squish - Image compression for writers and developers',
  ogUrl: 'https://squish.icjia.app/',
  ogType: 'website',
  ogSiteName: 'Squish',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Squish - Image Compression for Writers & Developers',
  twitterDescription: 'Privacy-focused image compression. Compress images instantly in your browser with real-time preview. No uploads required.',
  twitterImage: 'https://squish.icjia.app/og-image.png',
  twitterImageAlt: 'Squish - Image compression for writers and developers',
})

// Emit the schema.org JSON-LD graph directly into <head> so AI/SEO scanners
// that only read <head> can detect it. The graph (Organization, Person,
// WebSite, WebPage, WebApplication) is built in app/utils/structuredData.ts;
// nuxt-schema-org's auto-graph is disabled in nuxt.config to avoid a duplicate.
const { buildDate } = useRuntimeConfig().public

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(buildSquishGraph({ buildDate })),
    },
  ],
})
</script>
