import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000, // Increased from 30s for CI environments
  retries: process.env.CI ? 2 : 0, // 2 retries in CI, 0 locally
  reporter: 'list',
  webServer: {
    command: 'pnpm start',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI, // Always fresh server in CI
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
