// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  // Enable Nuxt 4 behavior
  future: {
    compatibilityVersion: 4,
  },

  modules: ["@nuxt/ui", "@nuxt/icon"],

  // Static site generation for Netlify
  ssr: true,

  // App configuration
  app: {
    head: {
      title: "Squish - Image Compression for Writers",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "A simple, modern image compression tool for writers and authors. Drag and drop your images to compress them instantly.",
        },
        { name: "theme-color", content: "#0d0d0d" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  // CSS configuration - with Nuxt 4 srcDir defaults to app/
  css: ["~/assets/css/main.css"],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => false,
    },
  },
});
