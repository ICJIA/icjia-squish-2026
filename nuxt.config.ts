// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxtjs/seo'],

  // Static site generation for Netlify with SSR for SEO
  ssr: true,
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
      title: 'Squish - Image Compression for Writers and Designers',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Privacy-focused image compression tool for writers and designers. Compress images instantly in your browser with real-time preview comparison. No uploads required.',
        },
        { name: 'theme-color', content: '#0d0d0d' },
        // Open Graph
        { property: 'og:title', content: 'Squish - Image Compression for Writers and Designers' },
        { property: 'og:description', content: 'Privacy-focused image compression tool for writers and designers. Compress images instantly in your browser with real-time preview comparison. No uploads required.' },
        { property: 'og:image', content: 'https://squish.icjia.dev/og-image.png' },
        { property: 'og:url', content: 'https://squish.icjia.dev' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Squish' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Squish - Image Compression for Writers and Designers' },
        { name: 'twitter:description', content: 'Privacy-focused image compression tool. Compress images instantly in your browser with real-time preview comparison.' },
        { name: 'twitter:image', content: 'https://squish.icjia.dev/og-image.png' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // CSS configuration - with Nuxt 4 srcDir defaults to app/
  css: ['~/assets/css/main.css'],

  vue: {
    compilerOptions: {
      isCustomElement: _tag => false,
    },
  },

  // SEO Configuration
  site: {
    url: 'https://squish.icjia.dev',
    name: 'Squish',
    description: 'Privacy-focused image compression tool for writers and designers. Compress images instantly in your browser with real-time preview comparison.',
    defaultLocale: 'en',
  },

  // Enable Nuxt 4 behavior
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  // Nitro configuration for Netlify static deployment
  nitro: {
    preset: 'netlify-static',
    output: {
      dir: 'dist',
      publicDir: 'dist',
    },
  },

  // Build configuration to suppress Tailwind sourcemap warnings
  vite: {
    build: {
      sourcemap: false,
    },
    css: {
      devSourcemap: false,
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  // OG Image configuration (disabled for static sites)
  ogImage: {
    enabled: false,
  },

  // Robots.txt configuration
  robots: {
    allow: '/',
  },

  // Sitemap configuration
  sitemap: {
    strictNuxtContentPaths: true,
    exclude: ['/404'],
  },
})
