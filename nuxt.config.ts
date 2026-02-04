// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxtjs/seo'],

  // SEO Configuration
  site: {
    url: 'https://squish.icjia.dev',
    name: 'Squish',
    description: 'Privacy-focused image compression tool for writers and designers. Compress images instantly in your browser with real-time preview comparison.',
    defaultLocale: 'en',
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

  // OG Image configuration (disabled for static sites)
  ogImage: {
    enabled: false,
  },

  // Static site generation for Netlify - enable SSR for proper meta tags
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
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // CSS configuration - with Nuxt 4 srcDir defaults to app/
  css: ['~/assets/css/main.css'],

  vue: {
    compilerOptions: {
      isCustomElement: tag => false,
    },
  },

  // Enable Nuxt 4 behavior
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-11-01',

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
