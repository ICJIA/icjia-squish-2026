<template>
  <ImageCompressor />
</template>

<script setup lang="ts">
// Use Nuxt SEO module's useSeoMeta with proper configuration
useSeoMeta({
  title: 'Squish - Image Compression for Writers and Designers',
  description: 'Privacy-focused image compression tool for writers and designers. Compress images instantly in your browser with real-time preview comparison. No uploads required.',
  ogTitle: 'Squish - Image Compression for Writers and Designers',
  ogDescription: 'Privacy-focused image compression tool for writers and designers. Compress images instantly in your browser with real-time preview comparison. No uploads required.',
  ogImage: 'https://squish.icjia.dev/og-image.png',
  ogImageAlt: 'Squish - Image compression for writers and designers',
  ogUrl: 'https://squish.icjia.dev',
  ogType: 'website',
  ogSiteName: 'Squish',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Squish - Image Compression for Writers and Designers',
  twitterDescription: 'Privacy-focused image compression tool. Compress images instantly in your browser with real-time preview comparison.',
  twitterImage: 'https://squish.icjia.dev/og-image.png',
  twitterImageAlt: 'Squish - Image compression for writers and designers',
})

// Define schema.org structured data
useSchemaOrg([
  {
    '@type': 'WebApplication',
    'name': 'Squish',
    'description': 'Privacy-focused image compression tool for writers and designers',
    'url': 'https://squish.icjia.dev',
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
