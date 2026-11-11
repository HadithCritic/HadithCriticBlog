import {expect,test} from '@playwright/test';

test('Projects preserves every project destination and index anchor',async({page})=>{
 await page.goto('/projects/');
 const destinations=await page.locator('.pj-row').evaluateAll(items=>items.map(item=>({id:item.id,href:item.querySelector('h3 a')?.getAttribute('href')})));
 expect(destinations).toHaveLength(3);
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

test('YouTube reel controls scroll between recent video links',async({page})=>{
 await page.goto('/youtube/');
 const track=page.locator('[data-reel-track]');
 await expect(track.locator('.yt-slide__link').first()).toHaveAttribute('target','_blank');
 const next=page.locator('[data-reel-step="1"]');
 await expect(next).toBeVisible();
 await next.click();
 await expect.poll(()=>track.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
});

test('YouTube tiles are real links to the videos without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 const page=await context.newPage();
 await page.goto('/youtube/');
 const href=await page.locator('.yt-slide__link').first().getAttribute('href');
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
