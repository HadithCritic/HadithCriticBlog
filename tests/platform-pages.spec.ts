import { expect, test } from '@playwright/test';

test('homepage presents the research method, recent studies and platform links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#method .mp__step')).toHaveCount(5);
  await expect(page.locator('#latest')).toBeVisible();
  await expect(page.locator('#latest .home-lead')).toHaveCount(5);
  await expect(page.locator('#latest .home-lead').first()).toBeVisible();
  await expect(page.locator('.home-rows .home-row').first()).toBeVisible();
  for (const [section, href] of [['corpus', '/hadith/'], ['narrators', '/projects/rijal/'], ['tafsir', '/projects/tafsir/'], ['tarikh', '/projects/history/']]) {
    await expect(page.locator(`#${section} a[href="${href}"]`).first()).toBeVisible();
  }
});

test('the Tafsīr library is linked from the projects page and reads verse by verse', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.pj-card a[href="/projects/tafsir/"]').first()).toBeVisible();

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

test('homepage method, latest studies and closing section remain readable on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('#method .mp__step')).toHaveCount(5);
  await expect(page.locator('#latest .home-rows .home-row')).toHaveCount(25);
  await expect(page.locator('#corpus')).toBeVisible();
  await expect(page.locator('.home-closing')).toBeVisible();
});
