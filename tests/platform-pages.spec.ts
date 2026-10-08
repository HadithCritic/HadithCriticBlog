import {test,expect} from '@playwright/test';

test('Homepage archive leads with one study and links every research branch',async({page})=>{
 await page.goto('/');
 const feature=page.locator('.home-feature');
 await expect(feature).toHaveCount(1);
 const href=await feature.locator('.home-feature__link').getAttribute('href');
 expect(href).toMatch(/^\/blogs\/.+\/$/);
 const branches=page.locator('.home-filter-tab[data-category]');
 expect(await branches.count()).toBeGreaterThanOrEqual(4);
 for(const branch of await branches.all()) {
  const destination=await branch.getAttribute('data-href');
  expect(destination).toMatch(/^\/blogs\/category\/[a-z-]+\/$/);
  await branch.click();
  await expect(branch).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#home-ledger-cta')).toHaveAttribute('href',destination!);
  const visible=page.locator('.home-ledger-row:not([hidden])');
  expect(await visible.count()).toBeGreaterThan(0);
  for(const row of await visible.all()) {
   await expect(row).toHaveAttribute('data-category',(await branch.getAttribute('data-home-filter'))!);
  }
 }
 await expect(page.locator('.home-project')).toHaveCount(6);
});

test('ICMA filters retain family counts, query state, and reset behavior',async({page})=>{
 await page.goto('/projects/academic-studies/');
 const total=await page.locator('[data-study]').count();
 const chip=page.locator('.chip[data-family]').first();
 const family=await chip.getAttribute('data-family');
 await chip.click();
 const matching=page.locator('[data-study]:not([hidden])');
 const count=await matching.count();
 expect(count).toBeGreaterThan(0);expect(count).toBeLessThan(total);
 expect(new URL(page.url()).searchParams.get('family')).toBe(family);
 await page.reload();await expect(matching).toHaveCount(count);
 await page.locator('#study-query').fill('no-study-932872');
 await expect(page.locator('#study-empty')).toBeVisible();
 await page.locator('#study-reset').click();
 await expect(matching).toHaveCount(total);
});

test('Tafsir keeps all suras and shows cited commentary under each verse',async({page})=>{
 await page.goto('/projects/tafsir/');
 await expect(page.locator('.reader-home__grid > li')).toHaveCount(114);
 await expect(page.locator('.rp-hero__lead')).toContainText('Placements are proposed');
 await page.locator('.reader-home__grid a').first().click();
 await expect(page).toHaveURL(/\/projects\/tafsir\/sura\/1\//);
 await expect(page.locator('h1')).toContainText('Fāti');
 await expect(page.locator('[lang="ar"]').first()).toBeVisible();
 // Every passage carries its printed locator and says its placement is unreviewed.
 const passage=page.locator('.tf-pass').first();
 await expect(passage).toBeVisible();
 await expect(passage.locator('.tf-pass__cite')).toContainText(/p\. \d+/);
 await expect(passage.locator('.tf-pass__cite')).toContainText('Placement proposed');
});

test('Qiraat reader profiles and original sura destinations remain available',async({page})=>{
 await page.goto('/projects/quran/');
 await expect(page.locator('.reader-card')).toHaveCount(10);
 await expect(page.locator('.grid .cell')).toHaveCount(114);
 await page.locator('.reader-card__profile').first().click();
 await expect(page).toHaveURL(/\/projects\/quran\/readers\//);
 await expect(page.locator('h1')).toBeVisible();
});

test('Homepage video activation preserves the privacy-enhanced embed',async({page})=>{
 await page.route('https://www.youtube-nocookie.com/embed/**',r=>r.fulfill({body:'',contentType:'text/html'}));
 await page.goto('/');
 const video=page.locator('.yt-lite').first();
 const id=await video.getAttribute('data-video-id');
 await video.scrollIntoViewIfNeeded();
 await video.click();
 await expect(video.locator('iframe')).toHaveAttribute('src',`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`);
});

test('Homepage categories keep distinct colors, readable feature contents, and a modest footer gap', async ({page}) => {
 await page.setViewportSize({width:1672,height:1100});
 await page.goto('/');
 await page.evaluate(()=>document.fonts.ready);
 const branches=page.locator('.home-filter-tab[data-category]');
 expect(await branches.count()).toBeGreaterThanOrEqual(4);
 const colors=await branches.evaluateAll(items=>items.map(item=>getComputedStyle(item,'::before').borderColor));
 expect(new Set(colors).size).toBe(await branches.count());
 const feature=(await page.locator('.home-feature').boundingBox())!;
 const copy=(await page.locator('.home-feature__copy').boundingBox())!;
 expect(copy.width).toBeLessThan(feature.width*0.7);
 const contents=page.locator('.home-feature__contents a');
 expect(await contents.count()).toBeGreaterThan(0);
 for(const link of await contents.all()) {
  expect(await link.getAttribute('href')).toMatch(/^\/blogs\/.+\/#.+/);
  const bounds=(await link.boundingBox())!;
  expect(bounds.y).toBeGreaterThanOrEqual(feature.y);
  expect(bounds.y+bounds.height).toBeLessThanOrEqual(feature.y+feature.height);
 }
 await page.locator('.closing-banner').scrollIntoViewIfNeeded();
 const measureGap=()=>page.evaluate(()=>document.querySelector('#site-footer')!.getBoundingClientRect().top-document.querySelector('.closing-banner')!.getBoundingClientRect().bottom);
 const gap=await measureGap();
 expect(gap).toBeGreaterThanOrEqual(24); expect(gap).toBeLessThanOrEqual(48);
});
