import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: [
        'app/components/**',
        'app/composables/**',
      ],
      exclude: [
        'node_modules/**',
        'test/**',
        '**/*.config.ts',
        'app/app.vue',
        'app/pages/**',
        '.nuxt/**',
        '.output/**',
        'dist/**',
        'coverage/**',
        'scripts/**',
      ],
    },
    reporters: ['default', 'verbose'],
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
