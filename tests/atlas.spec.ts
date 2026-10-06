import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const graph = JSON.parse(readFileSync(new URL('../src/data/research-graph.json', import.meta.url), 'utf8'));
const busy = graph.works.find((work: { id: string }) => work.id === 'schacht-1950-origins-muhammadan-jurisprudence');
const incoming = graph.edges.filter((edge: { type: string; to: string }) => edge.type === 'cites' && edge.to === busy.id);

test('citation directions, expansion and connection search match the source graph', async ({ page }) => {
  await page.goto(`/projects/islamic-studies-atlas/?work=${busy.id}#map`);
  await expect(page.locator('.focus__title')).toHaveText(busy.title);
  const citedBy = page.getByRole('region', { name: 'Cited by', exact: true });
  await expect(citedBy.locator('h4')).toHaveText(`Cited by (${incoming.length})`);
  await expect(citedBy.locator('[data-explore]')).toHaveCount(Math.min(8, incoming.length));
  await citedBy.getByRole('button', { name: `Show all ${incoming.length} works` }).click();
  await expect(citedBy.locator('[data-explore]')).toHaveCount(incoming.length);
  const targets = await citedBy.locator('[data-explore]').evaluateAll(links => links.map(link => (link as HTMLElement).dataset.explore));
  expect(new Set(targets)).toEqual(new Set(incoming.map((edge: { from: string }) => edge.from)));
  await page.locator('.connections__input').fill('no-such-connected-work');
  await expect(page.locator('.connections__status')).toContainText('0 of');
  await expect(page.locator('.connections__entry')).toHaveCount(0);
  await page.locator('.connections__input').fill('');
  await expect(citedBy.locator('[data-explore]')).toHaveCount(Math.min(8, incoming.length));
});

test('search and topic filters preserve the selected citation context', async ({ page }) => {
  await page.goto(`/projects/islamic-studies-atlas/?work=${busy.id}#map`);
  await expect(page.locator('[data-catalogue] > li')).toHaveCount(20);
  await page.locator('[data-more]').click();
  await expect(page.locator('[data-catalogue] > li')).toHaveCount(40);
  await page.locator('#atlas-query').fill('Schacht');
  await expect(page.locator('#atlas-count')).toContainText('in collection');
  await expect(page.locator('.focus__title')).toHaveText(busy.title);
  await page.locator('#atlas-theme').selectOption('Legal ḥadīth and sunna');
  await expect(page).toHaveURL(/theme=/);
  await page.locator('#atlas-query').fill('no-such-work');
  await expect(page.locator('#atlas-empty')).toBeVisible();
  await page.locator('#atlas-reset').click();
  await expect(page.locator('[data-catalogue] > li')).toHaveCount(20);
  await expect(page.locator('.focus__title')).toHaveText(busy.title);
});

test('following a citation supports browser Back, reload and bibliography anchors', async ({ page }) => {
  await page.goto(`/projects/islamic-studies-atlas/?work=${busy.id}#map`);
  const related = page.locator('.connections__entry').first();
  const target = await related.getAttribute('data-explore');
  await related.click();
  await expect(page).toHaveURL(new RegExp(`work=${target}`));
  await page.reload();
  await expect(page.locator('.focus__title')).toHaveText(graph.works.find((work: { id: string }) => work.id === target).title);
  await page.goBack();
  await expect(page.locator('.focus__title')).toHaveText(busy.title);
  await page.getByRole('link', { name: 'Bibliography and source notes', exact: true }).click();
  await expect(page.locator('[data-bibliography]')).toHaveAttribute('open', '');
  await expect(page.locator(`[id="${busy.id}"]`)).toBeVisible();
});

test('phone layouts keep connection navigation readable and in the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/projects/islamic-studies-atlas/#map');
  await page.locator('[data-catalogue] a').first().click();
  await expect(page.locator('.focus__title')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const groups = page.locator('.connections__group');
  const bounds = await groups.evaluateAll(nodes => nodes.map(node => ({ top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom })));
  expect(bounds[1].top).toBeGreaterThanOrEqual(bounds[0].bottom);
  await page.getByRole('button', { name: 'Back to results' }).click();
  await expect(page.locator('#atlas-query')).toBeFocused();
  await expect(page.locator('[data-focus-empty]')).toBeVisible();
});

test('without JavaScript the bibliography preserves every work and its citation links', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/projects/islamic-studies-atlas/');
  await expect(page.locator('[data-work]')).toHaveCount(graph.works.length);
  await expect(page.locator('[data-bibliography]')).toHaveAttribute('open', '');
  const row = page.locator(`[id="${busy.id}"]`);
  const relations = row.locator('details').filter({ hasText: `Cited by ${incoming.length}` });
  await relations.locator('summary').click();
  await expect(relations.locator('a')).toHaveCount(incoming.length + graph.edges.filter((edge: { type: string; from: string }) => edge.type === 'cites' && edge.from === busy.id).length);
  await expect(page.locator('[data-explorer-start]')).toHaveAttribute('href', '#works');
  await context.close();
});
