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
  await expect(page.locator('.bi-row').first()).toBeVisible();
});

test('production Pagefind returns an article result', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  await page.locator('[data-search-input]').fill('Bedouins');
  await expect(page.locator('[data-search-results] a').first()).toBeVisible({ timeout: 10_000 });
});

test('theme initialization and switching work when browser storage is disabled', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem']) {
      Object.defineProperty(Storage.prototype, method, { value: () => { throw new DOMException('Storage disabled', 'SecurityError'); } });
    }
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const toggle = page.locator('#themeToggle');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  expect(errors).toEqual([]);
});
