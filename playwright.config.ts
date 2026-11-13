import { defineConfig, devices } from '@playwright/test';

const appPort = Number(process.env.PLAYWRIGHT_PORT) || 4321;

export default defineConfig({
  testDir: './tests',

  timeout: 90_000,

  use: { baseURL: `http://127.0.0.1:${appPort}`, trace: 'retain-on-failure' },

  /**
   * The HTML report is what the CI job uploads on failure. Without naming it
   * here nothing is written to playwright-report/ and the upload step reports
   * "No files were found with the provided path", which is what happened: the
   * traces existed in test-results/ and nobody could reach them.
   */
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list']],

  /** A stray `test.only` must fail the build rather than quietly skip the suite. */
  forbidOnly: Boolean(process.env.CI),

  webServer: [
    // `astro preview` backgrounds itself and returns, which Playwright reads as
    // the server having exited. scripts/site/preview-foreground.mjs starts or adopts
    // it and then stays alive for the run. See the header of that file.
    {
      command: 'node scripts/site/preview-foreground.mjs',
      url: `http://127.0.0.1:${appPort}`,
      reuseExistingServer: true,
      env: { PREVIEW_PORT: String(appPort) },
      timeout: 90_000
    }
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
