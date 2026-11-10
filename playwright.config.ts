import { defineConfig, devices } from '@playwright/test'

/**
 * Browser tests run against the generated site in dist/, served with the same
 * security headers as production (scripts/serve-dist.mjs). Run `yarn generate`
 * first; `yarn test:e2e` does both.
 */
/** An uncommon port, so the tests never talk to some other project's preview server. */
const PORT = Number(process.env.PORT) || 4391
const ORIGIN = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: ORIGIN,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: ORIGIN,
    env: { PORT: String(PORT) },
    // Always start a fresh server: reusing whatever answers on the port risks
    // testing a stale build, or another project entirely.
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
