// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxtjs/seo'],

  // Static site generation for Netlify with SSR for SEO
  ssr: true,
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  // App configuration
  app: {
    head: {
      title: 'Squish - Image Compression for Writers & Developers',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Privacy-focused image compression for writers and developers. Compress images instantly in your browser with real-time preview. No uploads required.',
        },
        { name: 'theme-color', content: '#0d0d0d' },
        // Open Graph
        { property: 'og:title', content: 'Squish - Image Compression for Writers & Developers' },
        { property: 'og:description', content: 'Privacy-focused image compression for writers and developers. Compress images instantly in your browser with real-time preview. No uploads required.' },
        { property: 'og:image', content: 'https://squish.icjia.app/og-image.png' },
        { property: 'og:url', content: 'https://squish.icjia.app/' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Squish' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Squish - Image Compression for Writers & Developers' },
        { name: 'twitter:description', content: 'Privacy-focused image compression. Compress images instantly in your browser with real-time preview. No uploads required.' },
        { name: 'twitter:image', content: 'https://squish.icjia.app/og-image.png' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      htmlAttrs: { class: 'dark' },
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
    url: 'https://squish.icjia.app/',
    name: 'Squish',
    description: 'Privacy-focused image compression for writers and developers. Compress images instantly in your browser with real-time preview.',
    defaultLocale: 'en',
    indexable: true,
  },

  // Force dark-only — no light/dark toggle exists
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'nuxt-color-mode',
  },

  // Build timestamp baked in at generate time — powers JSON-LD dateModified
  // so content-freshness stays accurate on every deploy without manual edits.
  runtimeConfig: {
    public: {
      buildDate: new Date().toISOString(),
    },
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

  // Icons are packaged into the client bundle at build time from the installed
  // @iconify-json/lucide collection, never fetched at runtime. The production CSP
  // refuses api.iconify.design in connect-src, and it should stay that way.
  icon: {
    // Under `nuxt generate` the provider otherwise resolves to 'iconify', which
    // sends any icon missing from the bundle to api.iconify.design (fallbackToApi
    // does not govern that path). 'none' never fetches, so a missing icon stays
    // blank and logs "[Icon] failed to load icon" instead.
    provider: 'none',
    fallbackToApi: false,
    clientBundle: {
      // Every icon the templates use, listed by name so none depends on the scan
      // noticing it; `yarn generate` fails if one is missing from the collection.
      // lucide:github is a retired Lucide brand icon, still shipped marked hidden.
      icons: [
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:circle-alert',
        'lucide:download',
        'lucide:github',
        'lucide:image',
        'lucide:x',
        'lucide:zoom-in',
        'lucide:zoom-out',
      ],
      scan: true,
    },
  },

  // OG Image configuration (disabled for static sites)
  ogImage: {
    enabled: false,
  },

  // Robots.txt configuration
  robots: {
    allow: '/',
  },

  // Schema.org JSON-LD is emitted manually into <head> (app/pages/index.vue via
  // app/utils/structuredData.ts) so AI/SEO scanners that only read <head> detect
  // it. nuxt-schema-org v5 renders only at bodyClose and does not forward a
  // tagPosition option, so its auto-graph is disabled to avoid a duplicate.
  schemaOrg: {
    enabled: false,
  },

  // Sitemap configuration
  sitemap: {
    strictNuxtContentPaths: true,
    exclude: ['/404'],
  },
})
