import {expect,test} from '@playwright/test';

test('Academia retains cover controls, citation formats, and thesis disclosures',async({page})=>{
 await page.goto('/academia/');
 await page.locator('#tab-back').click();
 await expect(page.locator('#acad-book-viewport')).toHaveAttribute('data-view','back');
 await page.locator('#tab-front').click();
 await expect(page.locator('#acad-book-viewport')).toHaveAttribute('data-view','front');
 await page.locator('#cite-tab-chicago').click();
 await expect(page.locator('#cite-panel-chicago')).toBeVisible();
 await expect(page.locator('#cite-panel-bibtex')).toBeHidden();
 await page.locator('#cite-tab-apa').click();
 await expect(page.locator('#cite-panel-apa')).toBeVisible();
 await page.locator('.acad-thesis-item summary').first().click();
 await expect(page.locator('.acad-thesis-body').first()).toBeVisible();
});

test('Academia prints every citation format without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 const page=await context.newPage();
 await page.goto('/academia/');
 for(const format of ['bibtex','chicago','apa']) await expect(page.locator(`#cite-panel-${format}`)).toBeVisible();
 await context.close();
});

test('Projects preserves every project destination and index anchor',async({page})=>{
 await page.goto('/projects/');
 const destinations=await page.locator('.pj-lead, .pj-panel, .pj-proto').evaluateAll(items=>items.map(item=>({id:item.id,href:item.querySelector('h3 a')?.getAttribute('href')})));
 expect(destinations).toHaveLength(7);
 for(const project of destinations) {
  expect(project.href).toMatch(/^\//);
  await expect(page.locator(`.pj-table__jump[href="#${project.id}"]`)).toHaveCount(1);
 }
});

test('Resources search and format filters preserve URL state and reset',async({page})=>{
 await page.goto('/resources/');
 const total=await page.locator('[data-resource]').count();
 await page.locator('.chip[data-format="GitBook"]').click();
 const filtered=await page.locator('[data-resource]:not([hidden])').count();
 expect(filtered).toBeGreaterThan(0); expect(filtered).toBeLessThan(total);
 expect(new URL(page.url()).searchParams.get('format')).toBe('GitBook');
 await page.reload();
 await expect(page.locator('[data-resource]:not([hidden])')).toHaveCount(filtered);
 await page.locator('#resource-query').fill('no-matching-resource-932735');
 await expect(page.locator('#resource-empty')).toBeVisible();
 await page.locator('#resource-reset').click();
 await expect(page.locator('[data-resource]:not([hidden])')).toHaveCount(total);
});

test('YouTube filtering and card selection retain the working player',async({page})=>{
 await page.route('https://www.youtube-nocookie.com/embed/**',route=>route.fulfill({body:'',contentType:'text/html'}));
 await page.goto('/youtube/');
 await page.locator('#yt-filter-tabs [data-filter="certainty"]').click();
 await expect(page.locator('.yt-card:not([hidden])').first()).toHaveAttribute('data-category','certainty');
 await page.locator('#yt-search-input').fill('no-video-998237');
 await expect(page.locator('#yt-empty')).toBeVisible();
 await page.locator('#yt-empty-reset').click();
 const first=page.locator('.yt-card').first();
 const title=await first.getAttribute('data-title'); const id=await first.getAttribute('data-video-id');
 await first.locator('.yt-card__link').click();
 await expect(page.locator('#featured-title')).toHaveText(title!);
 await expect(page.locator('#yt-embed iframe')).toHaveAttribute('src',new RegExp(id!));
});

test('YouTube tiles are real links to the videos without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 const page=await context.newPage();
 await page.goto('/youtube/');
 const href=await page.locator('.yt-card__link').first().getAttribute('href');
 expect(href).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
 await context.close();
});

test('Contact retains topic selection and success/error form handling without sending mail',async({page})=>{
 let success=true;
 await page.route('https://api.web3forms.com/submit',route=>route.fulfill({status:success?200:400,contentType:'application/json',body:JSON.stringify({success,message:success?'Success':'Review fixture: submission failed'})}));
 await page.goto('/contact/');
 await page.locator('[data-topic="Correction"]').click();
 await expect(page.locator('select[name="topic"]')).toHaveValue('Correction');
 const fill=async()=>{
  await page.locator('[name="name"]').fill('Local review');
  await page.locator('#contact-form [name="email"]').fill('review@example.com');
  await page.locator('[name="topic"]').selectOption('Correction');
  await page.locator('[name="message"]').fill('Local intercepted verification request.');
 };
 await fill(); await page.locator('#contact-form button[type="submit"]').click();
 await expect(page.locator('#contact-form-status')).toContainText('Message sent');
 await expect(page.locator('[name="name"]')).toHaveValue('');
 success=false; await fill(); await page.locator('#contact-form button[type="submit"]').click();
 await expect(page.locator('#contact-form-status')).toContainText('Review fixture: submission failed');
 await expect(page.locator('#contact-form button[type="submit"]')).toBeEnabled();
});

test('Contact topics remain reachable on a phone',async({page})=>{
 await page.setViewportSize({width:375,height:1000});
 await page.goto('/contact/');
 await page.locator('[data-topic="Other"]').click();
 await expect(page.locator('select[name="topic"]')).toHaveValue('Other');
});

test('YouTube keeps the shared navigation search shortcut',async({page})=>{
 await page.goto('/youtube/');
 await page.keyboard.press('Control+k');
 await expect(page.locator('#site-search-dialog')).toBeVisible();
 await expect(page.locator('#site-search-input')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.locator('#site-search-dialog')).toBeHidden();
});
