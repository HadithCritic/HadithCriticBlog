import { expect, test } from '@playwright/test';

test('search opens with the keyboard shortcut and handles development index absence', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  const dialog = page.locator('#site-search-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-search-input]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('reduced motion keeps archive content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/blogs');
  await expect(page.locator('.ledger-row').first()).toBeVisible();
});

test('production Pagefind returns an article result', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  await page.locator('[data-search-input]').fill('Bedouins');
  await expect(page.locator('[data-search-results] a').first()).toBeVisible({ timeout: 10_000 });
});
