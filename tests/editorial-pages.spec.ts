import {expect,test} from '@playwright/test';

test('Projects preserves every project destination and index anchor',async({page})=>{
 await page.goto('/projects/');
 const destinations=await page.locator('.pj-lead, .pj-card').evaluateAll(items=>items.map(item=>({id:item.id,href:item.querySelector('h3 a')?.getAttribute('href')})));
 expect(destinations).toHaveLength(4);
 for(const project of destinations) {
  expect(project.href).toMatch(/^\//);
  await expect(page.locator(`#${project.id}`)).toHaveCount(1);
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

test('YouTube video filters update the visible archive and URL',async({page})=>{
 await page.goto('/youtube/');
 const all=await page.locator('.yt-card:not([hidden])').count();
 await page.locator('[data-video-filter="short"]').click();
 const shorts=page.locator('.yt-card:not([hidden])');
 await expect(shorts).toHaveCount(await page.locator('.yt-card[data-kind="short"]').count());
 expect(await shorts.count()).toBeGreaterThan(0);
 expect(await shorts.count()).toBeLessThan(all);
 expect(new URL(page.url()).searchParams.get('kind')).toBe('short');
 await expect(page.locator('[data-video-filter="short"]')).toHaveAttribute('aria-pressed','true');
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
 await page.locator('.ct-topic input[value="Correction"]').check();
 await expect(page.locator('.ct-topic input[value="Correction"]')).toBeChecked();
 const fill=async()=>{
  await page.locator('[name="name"]').fill('Local review');
  await page.locator('#contact-form [name="email"]').fill('review@example.com');
  await page.locator('.ct-topic input[value="Correction"]').check();
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
 await page.locator('.ct-topic input[value="Other"]').check();
 await expect(page.locator('.ct-topic input[value="Other"]')).toBeChecked();
});

test('YouTube keeps the shared navigation search shortcut',async({page})=>{
 await page.goto('/youtube/');
 await page.keyboard.press('Control+k');
 await expect(page.locator('#site-search-dialog')).toBeVisible();
 await expect(page.locator('#site-search-input')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.locator('#site-search-dialog')).toBeHidden();
});
