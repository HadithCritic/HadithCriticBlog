import { expect, test } from '@playwright/test';

test('homepage presents recent studies and links its four research platforms', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.home-lead')).toHaveCount(1);
  await expect(page.locator('.home-rows .home-row').first()).toBeVisible();

  const platforms = page.locator('.home-library .library__panel');
  await expect(platforms).toHaveCount(4);
  const hrefs = await platforms.locator('a.library__link').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(hrefs).toEqual(['/hadith/', '/narrators/', '/projects/quran/', '/projects/history/']);
});

test('retired Tafsir reader is absent from the projects page and redirects to the projects index', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('a[href*="tafsir"]')).toHaveCount(0);
  const response = await page.request.get('/projects/tafsir/', { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe('/projects/');
});

test('Qirāʾāt landing page links extracted suras without restoring the removed reader section', async ({ page }) => {
  await page.goto('/projects/quran/');
  await expect(page.locator('.reader-card')).toHaveCount(0);
  await expect(page.locator('.grid .cell')).toHaveCount(114);
  const firstSura = page.locator('.grid .cell > a').first();
  await expect(firstSura).toHaveAttribute('href', /^\/projects\/quran\/sura\/\d+\/$/);
  await firstSura.click();
  await expect(page).toHaveURL(/\/projects\/quran\/sura\/\d+\//);
  await expect(page.locator('main h1')).toBeVisible();
});

test('homepage video activation uses the privacy-enhanced embed', async ({ page }) => {
  await page.route('https://www.youtube-nocookie.com/embed/**', route => route.fulfill({ body: '', contentType: 'text/html' }));
  await page.goto('/');
  const video = page.locator('.yt-lite').first();
  const id = await video.getAttribute('data-video-id');
  await video.scrollIntoViewIfNeeded();
  await video.click();
  await expect(video.locator('iframe')).toHaveAttribute('src', `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`);
});

test('homepage platform rows and closing section remain readable on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.home-platform .showcase__row')).toHaveCount(3);
  for (const link of await page.locator('.home-platform .showcase__link').all()) {
    await expect(link).toHaveAttribute('href', /^\/(hadith|narrators|projects\/quran)\/$/);
  }
  await expect(page.locator('.home-library .library__panel')).toHaveCount(4);
  await expect(page.locator('.home-closing')).toBeVisible();
});
