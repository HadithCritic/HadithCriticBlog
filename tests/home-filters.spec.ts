import { expect, test } from '@playwright/test';

test.describe('Homepage mobile layout', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('platform library stays usable without horizontal page overflow', async ({ page }) => {
    await page.goto('/');
    const panels = page.locator('.home-library .library__panel');
    await expect(panels).toHaveCount(4);
    for (const panel of await panels.all()) {
      await expect(panel.locator('a.library__link')).toBeVisible();
      const bounds = await panel.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(376);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
