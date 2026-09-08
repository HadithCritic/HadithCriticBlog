import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'retain-on-failure' },
  // `astro preview` backgrounds itself and returns, which Playwright reads as
  // the server having exited. scripts/preview-foreground.mjs starts or adopts
  // it and then stays alive for the run. See the header of that file.
  webServer: {
    command: 'node scripts/preview-foreground.mjs',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
    timeout: 90_000
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
