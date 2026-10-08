import { expect, test } from '@playwright/test';

/* The article reader: one column, quiet contents, real notes. See DESIGN.md,
   "Article reader". */
const LONG = '/blogs/theology-epistemology/81-the-people-of-the-canyon-in-q85-a-case-for-the-valley-of-hinnom-gehenna/';

test('wide screens get margin contents that link to real sections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LONG);
  const links = page.locator('.hc-contents--margin a');
  expect(await links.count()).toBeGreaterThan(2);
  await expect(page.locator('.hc-contents--inline')).toBeHidden();
  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
    await expect(page.locator(`[id="${decodeURIComponent(href!.slice(1))}"]`)).toHaveCount(1);
  }
});

test('the old reader chrome stays gone', async ({ page }) => {
  await page.goto(LONG);
  for (const gone of ['[data-reading-progress]', '#readingOptionsToggle', '.desk-toolbar', '.desk-left-rail', '.back-to-top']) {
    await expect(page.locator(gone)).toHaveCount(0);
  }
  await expect(page.locator('main h1')).toHaveCount(1);
  const verse = page.locator('.hc-verse').first();
  await expect(verse).toBeVisible();
  await expect(verse.locator('[lang="ar"]').first()).not.toBeEmpty();
  await expect(verse.locator('[data-source-quoted]').first()).not.toBeEmpty();
});

test('a footnote reference opens its note as a preview', async ({ page }) => {
  await page.goto(LONG);
  const ref = page.locator('sup a[data-footnote-ref]').first();
  await ref.click();
  await expect(page.locator('#footnoteDialog')).toBeVisible();
  await expect(page.locator('#footnoteContent')).not.toBeEmpty();
});

test('report headings passed as title are rendered', async ({ page }) => {
  await page.goto('/blogs/theology-epistemology/14-the-salafi-paradox/');
  await expect(page.locator('.hc-report__label', { hasText: 'Ibn Baz on asking the Prophet for intercession after death' })).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  test('contents open natively and Share controls do not exist', async ({ page }) => {
    await page.goto(LONG);
    const contents = page.locator('.hc-contents--inline');
    await contents.locator('summary').click();
    await expect(contents.locator('a').first()).toBeVisible();
    await expect(page.locator('.hc-source__share').first()).toBeHidden();
  });
});
