import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const articles = [
  'transmission-narrators/82-the-bottleneck-fussilat-misses',
  'transmission-narrators/83-the-woman-ruler-hadith-abu-bakra-and-the-battle-of-the-camel',
  'prophecies-eschatology/84-al-hasans-reconciliation-prophecy-and-al-amashs-kufan-dive',
  'transmission-narrators/85-aisha-and-the-quran-as-criterion'
];

for (const id of articles) {
  test(`${id}: source apparatus, contents and notes resolve`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/blogs/${id}/`);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('.hc-report').first()).toBeVisible();
    const broken = await page.locator('.hc-article a[href^="#"]').evaluateAll(links => links
      .map(link => link.getAttribute('href')!)
      .filter(href => href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1)))));
    expect(broken).toEqual([]);
    const ref = page.locator('a[data-footnote-ref]').first();
    await ref.click();
    await expect(page.locator('#footnoteDialog')).toBeVisible();
    await expect(page.locator('#footnoteContent')).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(ref).toBeFocused();
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
    expect(errors).toEqual([]);
  });

  test(`${id}: diagrams and notes remain readable without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`/blogs/${id}/`);
    await expect(page.locator('.hc-report').first()).toBeVisible();
    const figure = page.locator('[data-isnad]').first();
    const diagrams = (readFileSync(`src/content/articles/${id}.mdx`, 'utf8').match(/<IsnadDiagram\b/g) || []).length;
    await expect(page.locator('[data-isnad]')).toHaveCount(diagrams);
    if (diagrams) {
      await expect(figure).toBeVisible();
      await expect(figure.locator('.lbl').first()).toHaveCSS('opacity', '1');
      await expect(figure.locator('.edge').first()).toHaveCSS('stroke-dashoffset', '0px');
      await expect(figure.locator('.isnad-toolbar')).toBeHidden();
    }
    const ref = page.locator('a[data-footnote-ref]').first();
    const href = await ref.getAttribute('href');
    await ref.click();
    expect(new URL(page.url()).hash).toBe(href);
    await context.close();
  });
}

test('isnad strands support the keyboard and the expanded view stays centered', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/blogs/${articles[0]}/`);
  const figure = page.locator('[data-isnad]').first();
  const narrator = figure.locator('[data-node]').first();
  await narrator.focus();
  await narrator.press('Enter');
  await expect(narrator).toHaveAttribute('aria-pressed', 'true');
  await narrator.press(' ');
  await expect(narrator).toHaveAttribute('aria-pressed', 'false');
  await figure.locator('[data-isnad-expand]').click();
  const modal = figure.locator('dialog');
  await expect(modal).toBeVisible();
  const bounds = await modal.locator('svg.isnad-svg').boundingBox();
  const viewport = await modal.locator('[data-modal-viewport]').boundingBox();
  expect(bounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(Math.abs(bounds!.x + bounds!.width / 2 - (viewport!.x + viewport!.width / 2))).toBeLessThan(2);
  expect(Math.abs(bounds!.y + bounds!.height / 2 - (viewport!.y + viewport!.height / 2))).toBeLessThan(2);
  const expandedNode = modal.locator('[data-node]').first();
  await expandedNode.focus();
  await expandedNode.press('Enter');
  await expect(expandedNode).toHaveAttribute('aria-pressed', 'true');
  await expandedNode.press('Escape');
  await expect(expandedNode).toHaveAttribute('aria-pressed', 'false');
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(figure.locator('[data-isnad-expand]')).toBeFocused();
});
