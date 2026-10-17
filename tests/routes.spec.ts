import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/blogs',
  '/resources',
  '/projects',
  '/academia',
  '/youtube',
  '/contact',
  '/blogs/origins-early-history/5-debunking-the-hadith-prophecy-of-bedouins-building-tall-buildings',
  '/blogs/transmission-narrators/47-hadith-logically-can-not-be-considered-wahi',
  '/blogs/prophecies-eschatology/77-faces-like-hammered-shields-the-turks-hadith-clusters',
  '/blogs/origins-early-history/46-a-case-study-of-ibn-abbas-ikrima-in-the-muwatta',
  '/blogs/transmission-narrators/51-bukharis-blind-spot-the-problem-of-aishas-pre-birth-narrations'
];

for (const route of routes) {
  test(`${route} has one main landmark and no horizontal overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('header.site-header')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}

test('mobile menu restores focus after escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('#menuToggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('legacy addresses cited in research redirect directly to their articles', async ({ request }) => {
  const redirects: Record<string, string> = {
    '/blogs/55-the-myth-of-the-ten-promised-paradise-hadith': '/blogs/theology-epistemology/55-the-myth-of-the-ten-promised-paradise-hadith/',
    '/blogs/64-whitewashing-al-zuhri-and-why-it-fails': '/blogs/origins-early-history/64-whitewashing-al-zuhri-and-why-it-fails/',
    '/blogs/45-the-origin-of-islamic-apostasy-the-slave-of-ibn-abbas': '/blogs/origins-early-history/45-the-origin-of-islamic-apostasy-the-slave-of-ibn-abbas/',
    '/blogs/18-%CA%BFilm-al-rijal-%D8%B9%D9%84%D9%85-%D8%A7%D9%84%D8%B1%D8%AC%D8%A7%D9%84-a-case-study-of-this-flawed-science': '/blogs/origins-early-history/18-%CA%BFilm-al-rijal-%D8%B9%D9%84%D9%85-%D8%A7%D9%84%D8%B1%D8%AC%D8%A7%D9%84-a-case-study-of-this-flawed-science/',
    '/fabricated-hadith-prophecy-return-to-green-arabia': '/blogs/prophecies-eschatology/27-fabricated-hadith-prophecy-return-to-green-arabia/',
    '/fabricated-hadith-prophecy-the-conquest-of-constantinople': '/blogs/prophecies-eschatology/35-fabricated-hadith-prophecy-the-conquest-of-constantinople/',
    '/fabricated-hadith-prophecy-the-killing-of-umar-the-afflictions': '/blogs/prophecies-eschatology/28-fabricated-hadith-prophecy-the-killing-of-umar-the-afflictions/',
    '/fabricated-hadith-prophecy-the-siege-of-baghdad': '/blogs/origins-early-history/25-fabricated-hadith-prophecy-the-siege-of-baghdad/',
    '/%e1%b9%a3a%e1%b8%a5i%e1%b8%a5-al-yahud-the-parable-of-the-believer-the-citron': '/blogs/origins-early-history/38-%E1%B9%A3a%E1%B8%A5i%E1%B8%A5-al-yahud-the-parable-of-the-believer-the-citron/',
    '/hadith-the-prophet-was-bewitched-by-a-jew': '/blogs/origins-early-history/21-hadith-the-prophet-was-bewitched-by-a-jew/',
    '/the-corruption-of-prayer-within-the-hadith': '/blogs/transmission-narrators/17-the-corruption-of-prayer-within-the-hadith/'
  };
  for (const [source, target] of Object.entries(redirects)) {
    for (const suffix of ['', '/']) {
      const response = await request.get(source + suffix, { maxRedirects: 0 });
      expect(response.status(), source + suffix).toBe(301);
      expect(new URL(response.headers().location, response.url()).pathname).toBe(target);
    }
  }
});

test('missing pages return 404 and are excluded from indexing', async ({ page }) => {
  const response = await page.goto('/no-such-audit-page-939032/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});
