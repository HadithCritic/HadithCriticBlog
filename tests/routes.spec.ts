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
