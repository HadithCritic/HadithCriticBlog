import fs from 'node:fs';
import { chromium } from '@playwright/test';
const plan=JSON.parse(fs.readFileSync('docs/archive-artwork-plan.json','utf8'));
const numbers=process.argv.slice(2).map(Number);
const articles=plan.articles.filter(a=>numbers.includes(a.number));
const base=process.env.ARTWORK_REVIEW_URL||'http://127.0.0.1:4323';
fs.mkdirSync('output/archive-artwork',{recursive:true});
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 for(const width of [1672,375]) {
  await page.setViewportSize({width,height:950});
  await page.goto(base+'/blogs/',{waitUntil:'networkidle'});
  await page.locator('#older-archive').evaluate(e=>e.open=true);
  await page.addStyleTag({content:'astro-dev-toolbar{display:none!important}'});
  for(const a of articles) {
   const row=page.locator(`.bi-row[data-id="${a.id}"]`);
   await row.scrollIntoViewIfNeeded();
   await row.locator('img').evaluate(async img=>{await img.decode();if(!img.naturalWidth)throw Error('Broken image');});
   await row.screenshot({path:`output/archive-artwork/${a.number}-${width}.png`});
  }
 }
 for(const a of articles) {
  await page.goto(base+'/blogs/'+a.id+'/',{waitUntil:'domcontentloaded'});
  const image=page.locator('.hc-head__plate img');
  await image.evaluate(async img=>{await img.decode();if(!img.naturalWidth)throw Error('Broken article image');});
  if(!(await image.getAttribute('src')).includes(a.key))throw Error('Wrong article plate '+a.number);
  const share=await page.locator('meta[property="og:image"]').getAttribute('content');
  if(!share.includes(a.key))throw Error('Wrong share image '+a.number);
  a.browserReview={desktop:1672,mobile:375,archiveImageDecoded:true,articleImageDecoded:true,shareImage:true};
 }
 fs.writeFileSync('docs/archive-artwork-plan.json',JSON.stringify(plan,null,2));
 console.log('Verified archive, article and share artwork: '+numbers.join(', '));
} finally {await browser.close();}
