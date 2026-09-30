import { chromium } from '@playwright/test';

const origin = process.env.STATIC_CORPUS_PROTOTYPE_URL || 'http://127.0.0.1:4323/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/data/')) requests.push(request.url());
  });
  page.on('pageerror', (error) => console.error(`browser error: ${error.message}`));

  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.locator('#query').fill('الصلاة');
  await page.getByRole('button', { name: "Search Muwatta' Malik" }).click();
  await page.locator('#results .result').first().waitFor();
  await page.locator('#results .result button').first().click();
  await page.locator('#detail h3').waitFor();
  await page.locator('#results .result button').first().click();
  await page.getByRole('button', { name: 'Load dossier' }).click();
  await page.locator('#dossier h3').waitFor();
  await page.getByRole('button', { name: 'Load dossier' }).click();

  const report = await page.locator('#metrics').textContent();
  console.log(JSON.stringify({
    origin,
    dataRequests: requests.length,
    requestPaths: requests.map((url) => new URL(url).pathname),
    browserMeasurements: JSON.parse(report || '{}')
  }, null, 2));
} finally {
  await browser.close();
}
