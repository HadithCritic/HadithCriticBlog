import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* The number of articles with bespoke art is whatever the registry holds. */
const ARTWORK_COUNT = (readFileSync(new URL('../src/data/blog-artwork.ts', import.meta.url), 'utf8').match(/"src":/g) ?? []).length;

test('the existing site search shortcut keeps its dialog and focus', async ({ page }) => {
  await page.goto('/blogs/');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  await expect(page.locator('#site-search-dialog')).toBeVisible();
  await expect(page.locator('#site-search-dialog [data-search-input]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-search-dialog')).toBeHidden();
});

test('the newest article leads and every registered article receives its bespoke art', async ({ page }) => {
  await page.goto('/blogs/');
  await expect(page.locator('.bi-lead')).toHaveCount(1);
  const dates = await page.locator('.bi-row').evaluateAll(rows => rows.map(row => Number((row as HTMLElement).dataset.timestamp)));
  const leadDate = await page.locator('.bi-lead').getAttribute('data-timestamp');
  expect(Number(leadDate)).toBe(Math.max(...dates));
  await expect(page.locator('.bi-row--illustrated')).toHaveCount(ARTWORK_COUNT);
  const art = await page.locator('.bi-row--illustrated img').evaluateAll(images => images.map(img => img.getAttribute('src')));
  expect(new Set(art).size).toBe(ARTWORK_COUNT);
});

test('the complete archive is listed by year, newest first', async ({ page }) => {
  await page.goto('/blogs/');
  const years = await page.locator('.bi-year').evaluateAll(groups => groups.map(group => Number((group as HTMLElement).dataset.year)));
  expect(years).toEqual([...years].sort((a, b) => b - a));
  const dates = await page.locator('#ledger .bi-row').evaluateAll(rows => rows.map(row => Number((row as HTMLElement).dataset.timestamp)));
  expect(dates).toEqual([...dates].sort((a, b) => b - a));
});

test('branch filters stay synchronized with the URL and reset', async ({ page }) => {
  await page.goto('/blogs/');
  const category = 'Transmission & Narrators';
  const expected = await page.locator('.bi-row').evaluateAll((rows, field) => rows.filter(row => (row as HTMLElement).dataset.category === field).length, category);
  await page.locator('#bi-filters .bi-chip').filter({ hasText: category }).click();
  await expect(page.locator('.bi-row:not([hidden])')).toHaveCount(expected);
  await expect(page.locator('.bi-chip[aria-current="true"]').filter({ hasText: category })).toHaveCount(1);
  expect(new URL(page.url()).searchParams.get('category')).toBe(category);
  await page.reload();
  await expect(page.locator('.bi-row:not([hidden])')).toHaveCount(expected);
  await page.locator('#archive-reset-btn').click();
  await expect(page.locator('.bi-row:not([hidden])')).toHaveCount(await page.locator('.bi-row').count());
});

test('full text search retains section links into an older article', async ({ page }) => {
  const response = await page.request.get('/search-index.json');
  const docs = await response.json();
  const doc = docs.find((item: { id: string }) => item.id.includes('5-debunking-the-hadith-prophecy'));
  const section = doc.sections.find((item: { text: string; slug: string }) => item.slug && item.text.length > 120);
  const phrase = section.text.split(/\s+/).slice(4, 13).join(' ');
  await page.goto('/blogs/');
  await page.locator('#archive-search-input').fill(phrase);
  const row = page.locator('.bi-row').filter({ has: page.locator(`a[href^="/blogs/${doc.id}/#"]`) });
  await expect(row).toBeVisible();
  await expect(row.locator('.bi-row__match')).toBeVisible();
});

test('empty results can reset and ordering persists through reload', async ({ page }) => {
  await page.goto('/blogs/');
  await page.locator('#archive-search-input').fill('no-results-9817346');
  await expect(page.locator('#ledger-empty')).toBeVisible();
  await page.locator('#ledger-empty-reset').click();
  await expect(page.locator('#ledger-empty')).toBeHidden();
  await page.locator('#archive-order').selectOption('oldest');
  const dates = await page.locator('#ledger .bi-row').evaluateAll(rows => rows.map(row => Number((row as HTMLElement).dataset.timestamp)));
  expect(dates).toEqual([...dates].sort((a, b) => a - b));
  await page.reload();
  await expect(page.locator('#archive-order')).toHaveValue('oldest');
});

test('without JavaScript the archive and real category links remain usable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/blogs/');
  await expect(page.locator('#archive-search-form')).toBeHidden();
  await expect(page.locator('#ledger .bi-row').last()).toBeVisible();
  const category = page.locator('#bi-filters a[href^="/blogs/category/"]').first();
  const href = await category.getAttribute('href');
  await category.click();
  expect(new URL(page.url()).pathname).toBe(href);
  await context.close();
});
