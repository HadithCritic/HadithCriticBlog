import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /**
   * Corpus pages are shells until SQLite has been fetched over range requests,
   * so their assertions wait up to 45s. A per-test ceiling of 30s silently
   * capped those waits: an `expect(...).toBeVisible({ timeout: 45_000 })` can
   * never fire if the test it is in is killed at 30s, and the failure reads as
   * a timeout rather than as whatever was actually wrong.
   */
  timeout: 90_000,

  use: { baseURL: 'http://127.0.0.1:4321', trace: 'retain-on-failure' },

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
    // the server having exited. scripts/preview-foreground.mjs starts or adopts
    // it and then stays alive for the run. See the header of that file.
    {
      command: 'node scripts/preview-foreground.mjs',
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: true,
      timeout: 90_000
    },
    // The corpus, on its own origin, because `astro preview` is wrangler and
    // Cloudflare static assets answer a range request with 200 and the whole
    // file. The corpus cannot be read from such a host at all, so serving it
    // here is not a workaround for the tests: it is the production arrangement,
    // cross-origin request and CORS headers included. See
    // scripts/build-for-e2e.mjs.
    {
      command: 'node scripts/corpus-file-server.mjs',
      url: 'http://127.0.0.1:4322/health',
      reuseExistingServer: true,
      timeout: 30_000
    }
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
