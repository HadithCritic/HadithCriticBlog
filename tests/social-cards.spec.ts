import { expect, test } from '@playwright/test';

/**
 * Every section's og:image must be its own card and must exist. A missing card
 * fails silently in production: the page renders, and the link pasted into a
 * feed shows no preview at all.
 */
const ROUTES: Array<[string, string]> = [
  ['/', '/og/default.jpg'],
  ['/blogs/', '/og/blogs.jpg'],
  ['/blogs/category/transmission-narrators/', '/og/category/transmission-narrators.jpg'],
  ['/hadith/', '/og/hadith.jpg'],
  ['/hadith/collection/sahih-al-bukhari/', '/og/collection/sahih-al-bukhari.jpg'],
  ['/narrators/', '/og/narrators.jpg'],
  ['/projects/quran/', '/og/quran.jpg'],
  ['/projects/tafsir/', '/og/tafsir.jpg'],
  ['/projects/islamic-studies-atlas/', '/og/atlas.jpg'],
  ['/projects/academic-studies/', '/og/icma.jpg'],
  ['/projects/', '/og/projects.jpg'],
  ['/contact/', '/og/contact.jpg']
];

for (const [route, card] of ROUTES) {
  test(`${route} previews with ${card}`, async ({ page, request }) => {
    await page.goto(route);
    const content = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(new URL(content!).pathname).toBe(card);
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/jpeg');
    const response = await request.get(card);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/jpeg');
  });
}
