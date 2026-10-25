import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:9090',
    headless: true,
    channel: 'chrome',
  },
})