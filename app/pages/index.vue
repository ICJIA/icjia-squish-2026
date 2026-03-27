<template>
  <ImageCompressor />
</template>

<script setup lang="ts">
// Use Nuxt SEO module's useSeoMeta with proper configuration
useSeoMeta({
  title: 'Squish - Image Compression for Writers & Developers',
  description: 'Privacy-focused image compression for writers and developers. Compress images instantly in your browser with real-time preview. No uploads required.',
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

// Define schema.org structured data
useSchemaOrg([
  {
    '@type': 'WebApplication',
    'name': 'Squish',
    'description': 'Privacy-focused image compression for writers and developers',
    'url': 'https://squish.icjia.app/',
    'applicationCategory': 'UtilityApplication',
    'operatingSystem': 'Any',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
  },
])
</script>
