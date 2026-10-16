import { expect, test } from '@playwright/test';

const route = '/projects/history/';
const titles = ['Tārīkh Khalīfa ibn Khayyāṭ', 'Futūḥ al-buldān', 'The History of al-Ṭabarī'];

test('the archive identifies its three real sources and makes publication limits explicit', async ({ page, request }) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('History (Tārīkh)');
  await expect(page.locator('[data-history-source]')).toHaveCount(3);
  const paintings = new Set<string>();
  for (const title of titles) {
    const source = page.getByRole('article', { name: title, exact: true });
    await expect(source.getByRole('heading', { level: 3 })).toBeVisible();
    await expect(source.getByText('Full text not yet published', { exact: true })).toBeVisible();
    await expect(source.locator('[lang="ar"][dir="rtl"]')).toBeVisible();
    const image = source.getByRole('img');
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async (node: HTMLImageElement) => { await node.decode(); });
    expect(await image.getAttribute('alt')).toBeTruthy();
    const original = await source.locator('figure a').getAttribute('href');
    expect(original).toMatch(/^\/images\/history\/.+\.webp$/);
    paintings.add(original!);
    const response = await request.get(original!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
  expect(paintings.size).toBe(3);
  await expect(page.getByText('These capabilities are in preparation.')).toBeVisible();
  await expect(page.getByText(/They do not document particular events/)).toBeVisible();
  await expect(page.locator('a[href*="/projects/history/read"]')).toHaveCount(0);
});

test('each record states where its source stands, without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);
  for (const title of titles) {
    const source = page.getByRole('article', { name: title, exact: true });
    const record = source.getByRole('region', { name: `Where ${title} stands` });
    await expect(record).toBeVisible();
    await expect(record.locator('.history-source__note')).not.toBeEmpty();
    await expect(record.locator('.history-source__reference')).not.toBeEmpty();
  }
  const zoom = page.locator('[data-history-zoom]').first();
  await expect(zoom).toHaveAttribute('href', /\.webp$/);
  await expect(page.locator('[data-history-viewer]')).not.toHaveAttribute('open');
  await page.locator('.header-nav [data-project-nav] summary').click();
  await expect(page.locator('.header-nav a[href="/projects/history/"]')).toHaveAttribute('aria-current', 'page');
  await context.close();
});

test('the chronology lists the authors in order and links to their works', async ({ page }) => {
  await page.goto(route);
  const events = page.locator('.history-timeline__events a');
  await expect(events).toHaveCount(3);
  const dates = await events.locator('.history-timeline__date').allTextContents();
  expect(dates).toEqual(['d. 240/854', 'd. c. 279/892', 'd. 310/923']);
  await events.nth(2).click();
  await expect(page).toHaveURL(/#al-tabari$/);
  await expect(page.getByRole('heading', { level: 3, name: 'The History of al-Ṭabarī' })).toBeInViewport();
});

test('a painting opens in the viewer and focus returns to it on close', async ({ page }) => {
  await page.goto(route);
  const zoom = page.locator('[data-history-zoom]').nth(1);
  await zoom.scrollIntoViewIfNeeded();
  await zoom.focus();
  await page.keyboard.press('Enter');
  const viewer = page.locator('[data-history-viewer]');
  await expect(viewer).toHaveAttribute('open', '');
  await expect(viewer.locator('img')).toHaveAttribute('src', /al-baladhuri-v2-1600\.webp$/);
  await expect(viewer.locator('figcaption')).toContainText('At the gates of a town');
  await page.keyboard.press('Escape');
  await expect(viewer).not.toHaveAttribute('open');
  await expect(zoom).toBeFocused();
  expect(page.url()).not.toMatch(/\.webp$/);
});

test('project navigation reaches the archive on desktop and mobile', async ({ page }) => {
  await page.goto('/projects/');
  await page.locator('.header-nav [data-project-nav] summary').click();
  await page.locator('.header-nav a[href="/projects/history/"]').click();
  await expect(page).toHaveURL(/\/projects\/history\/$/);
  await page.waitForLoadState('load');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('#menuToggle').click();
  await page.locator('#mobileNav [data-project-nav] summary').click();
  await expect(page.locator('#mobileNav a[href="/projects/history/"]')).toBeVisible();
  await page.locator('#mobileNav a[href="/projects/history/"]').click();
  await expect(page).toHaveURL(/\/projects\/history\/$/);
});

for (const theme of ['dark', 'light']) {
  test(`the archive remains readable across phone, tablet and desktop widths in ${theme}`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem('theme', value), theme);
    for (const width of [320, 375, 414, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 950 });
      await page.goto(route);
      await page.evaluate(async () => { await document.fonts.ready; });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: page overflow`).toBe(true);
      const outOfBounds = await page.locator('.history-hero__copy, .history-timeline, .history-source, .history-tools, .history-principles__inner, .history-closing').evaluateAll(nodes => nodes.some(node => {
        const box = node.getBoundingClientRect();
        return box.left < -1 || box.right > innerWidth + 1;
      }));
      expect(outOfBounds, `${width}: content clipping`).toBe(false);
      const wraps = await page.locator('.history-hero__actions a, .history-text-link').evaluateAll(nodes => nodes.some(node => {
        const range = document.createRange(); range.selectNodeContents(node);
        const rects = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0);
        return rects.some(rect => Math.abs(rect.top - rects[0].top) > 4);
      }));
      expect(wraps, `${width}: wrapped action text`).toBe(false);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });
}
