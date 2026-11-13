import { expect, test } from '@playwright/test';
import { historySources, openReaders } from '../src/data/history/history';

const route = '/projects/history/';
const titles = historySources.map(source => source.title);
const readers = openReaders.map(({ reader }) => reader);
const foreignAsset = /\/assets\/hadith\/|^\/history\/(art|book)|^\/projects\/history\/reader\//;

test('the archive identifies its sources and links each open reader', async ({ page, request }) => {
  await page.goto(route);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('History (Tārīkh)');
  await expect(page.locator('[data-history-source]')).toHaveCount(historySources.length);
  const paintings = new Set<string>();
  for (const title of titles) {
    const source = page.getByRole('article', { name: title, exact: true });
    await expect(source.getByRole('heading', { level: 3 })).toBeVisible();
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
  expect(paintings.size).toBe(historySources.length);
  await expect(page.locator('.history-art-note')).toContainText('they are not evidence for the historical claims');
  for (const reader of readers) {
    await expect(page.locator(`.history-source__foot a[href="${reader.href}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#al-tabari .history-source__foot')).toContainText('Not open yet');
});

test('every open history has a title page with its contents and opens on a reading page', async ({ page }) => {
  for (const reader of readers) {
    const foreign: string[] = [];
    const failed: string[] = [];
    const onRequest = (req: { url(): string }) => { if (foreignAsset.test(new URL(req.url()).pathname)) foreign.push(req.url()); };
    const onResponse = (res: { status(): number; url(): string }) => { if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`); };
    page.on('request', onRequest);
    page.on('response', onResponse);
    await page.goto(reader.href);
    await expect(page).toHaveTitle(/\| HadithCritic$/);
    await expect(page.locator('.site-header .header-brand')).toBeVisible();
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('#main-content h1')).toHaveCount(1);
    expect(await page.locator('.hx-contents [data-hx-row]').count()).toBeGreaterThan(0);
    await expect(page.locator('.hx-more a[href="/projects/history/"]')).toHaveCount(1);
    await page.locator('[data-hx-begin]').click();
    await expect(page).toHaveURL(new RegExp(`^.*${reader.href}[^/]+/$`));
    await expect(page.locator('#main-content h1')).toHaveCount(1);
    await expect(page.locator('.side')).toHaveClass(/is-enhanced/);
    await expect(page.locator('.side-foot a')).toHaveAttribute('href', '/projects/history/');
    await expect(page.locator('.side [aria-current="page"]')).toHaveCount(1);
    await expect(page.locator('.hx-pager a')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(foreign, reader.href).toEqual([]);
    expect(failed, reader.href).toEqual([]);
    page.off('request', onRequest);
    page.off('response', onResponse);
  }
});

test('a reading page keeps its contents drawer below the site header on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(readers[0].href);
  await page.locator('[data-hx-begin]').click();
  await page.locator('#navbtn').click();
  const side = page.locator('.side');
  await expect(side.locator('.side-close')).toBeVisible();
  const header = await page.locator('.site-header').boundingBox();
  const box = await side.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(813);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('a chronicle opens on the year asked for, and a link from the one-page edition still lands', async ({ page }) => {
  await page.goto('/projects/history/khalifa/');
  await page.locator('#hx-jump-year').fill('64');
  await page.locator('[data-hx-jump="year"] button').click();
  await expect(page).toHaveURL(/\/khalifa\/chapter-8-3\/#year-64-8$/);
  await expect(page.locator('#year-64-8')).toBeInViewport();
  await page.goto('/projects/history/khalifa/#topic-7');
  await expect(page).toHaveURL(/\/khalifa\/chapter-3\/#topic-7$/);
  await page.goto('/projects/history/futuh-al-buldan/#report-500');
  await expect(page).toHaveURL(/\/futuh-al-buldan\/chapter-40\/#report-500$/);
});

test('each record retains its source identity and description without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(route);
  for (const entry of historySources) {
    const source = page.getByRole('article', { name: entry.title, exact: true });
    await expect(source.locator('.history-source__author')).toContainText(entry.author);
    await expect(source.locator('.history-source__description')).toHaveText(entry.description);
    await expect(source.locator('[lang="ar"]')).toHaveText(entry.arabic);
  }
  const zoom = page.locator('[data-history-zoom]').first();
  await expect(zoom).toHaveAttribute('href', /\.webp$/);
  await expect(page.locator('[data-history-viewer]')).not.toHaveAttribute('open');
  await page.locator('.header-nav [data-project-nav] summary').click();
  await expect(page.locator('.header-nav a[href="/projects/history/"]')).toHaveAttribute('aria-current', 'page');
  await context.close();
});

test('a painting opens in the viewer and focus returns to it on close', async ({ page }) => {
  await page.goto(route);
  const zoom = page.locator('#al-baladhuri [data-history-zoom]');
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
      const outOfBounds = await page.locator('.history-hero__copy, .history-source, .history-closing').evaluateAll(nodes => nodes.some(node => {
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
