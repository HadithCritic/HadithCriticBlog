import { expect, test } from '@playwright/test';

test.describe('Homepage mobile layout', () => {
  test.use({ viewport: { width: 375, height: 812 } });

test('research platform links stay usable without horizontal page overflow', async ({ page }) => {
    await page.goto('/');
    const links = [
      page.locator('#corpus a[href="/hadith/"]').first(),
      page.locator('#narrators a[href="/projects/rijal/"]').first(),
      page.locator('#tafsir a[href="/projects/tafsir/"]').first(),
      page.locator('#tarikh a[href="/projects/history/"]').first(),
    ];
    for (const link of links) {
      await expect(link).toBeVisible();
      const bounds = await link.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(376);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
