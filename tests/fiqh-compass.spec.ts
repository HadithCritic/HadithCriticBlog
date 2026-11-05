import { expect, test } from '@playwright/test';

test('retired Fiqh Compass routes redirect to the projects index', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.getByRole('heading', { name: /Four projects/ })).toBeVisible();
  await expect(page.locator('a[href*="fiqh-compass"]')).toHaveCount(0);

  for (const path of ['/projects/fiqh-compass/', '/projects/fiqh-compass/methodology/', '/projects/fiqh-compass/quiz/']) {
    const response = await page.request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(301);
    expect(response.headers().location, path).toBe('/projects/');
  }
});
