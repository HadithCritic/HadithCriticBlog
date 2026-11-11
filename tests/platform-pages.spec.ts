import { expect, test } from '@playwright/test';

test('homepage presents recent studies and links its research platforms', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.home-lead')).toHaveCount(1);
  await expect(page.locator('.home-rows .home-row').first()).toBeVisible();

  const platforms = page.locator('.home-library .library__panel');
  await expect(platforms).toHaveCount(2);
  const hrefs = await platforms.locator('a.library__link').evaluateAll(links => links.map(link => link.getAttribute('href')));
  expect(hrefs).toEqual(['/hadith/', '/projects/history/']);
});

test('the Tafsīr library is linked from the projects page and reads verse by verse', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.pj-row a[href="/projects/tafsir/"]').first()).toBeVisible();

  await page.goto('/projects/tafsir/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  /* Every commentary lists all 114 surahs, and none is Ibn Wahb's. */
  for (const work of ['mujahid', 'thawri', 'zamakhshari', 'tabari']) {
    await expect(page.locator(`#contents-${work} [data-contents-item]`)).toHaveCount(114);
  }
  await expect(page.locator('#contents-ibn-wahb')).toHaveCount(0);

  /* A surah opens on its verses; a verse opens its own commentary under the site header. */
  await page.goto('/projects/tafsir/mujahid/2/');
  await expect(page.locator('.site-header')).toHaveCount(1);
  await expect(page.locator('.masthead')).toHaveCount(0);
  await page.locator('a.tfv-row').first().click();
  await expect(page).toHaveURL(/\/projects\/tafsir\/mujahid\/2\/\d+\/$/);
  await expect(page.locator('.chapter').first()).toBeVisible();

  /* The surah and verse menus move to another verse from anywhere. */
  await page.locator('[data-switch-surah]').selectOption('3');
  await expect(page.locator('[data-switch-verse] option', { hasText: 'All verses' })).toHaveCount(1);
  const lastVerse = await page.locator('[data-switch-verse] option').last().getAttribute('value');
  await page.locator('[data-switch-verse]').selectOption(lastVerse ?? '');
  await expect(page).toHaveURL(/\/projects\/tafsir\/mujahid\/3\/\d+\/$/);
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
  await expect(page.locator('.home-platform .showcase__row')).toHaveCount(1);
  await expect(page.locator('.home-platform .showcase__link')).toHaveAttribute('href', '/hadith/');
  await expect(page.locator('.home-library .library__panel')).toHaveCount(2);
  await expect(page.locator('.home-closing')).toBeVisible();
});
