import { expect, test } from '@playwright/test';

const TOTAL = 96;
const VERSION = 'prototype-2';

test('methodology page is readable without JavaScript and reports current limits', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/projects/fiqh-compass/methodology/`);

  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Evidence first. Limits in view.' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'A passage can contain more than one voice' })).toBeVisible();
  await expect(page.locator('.fc-attribution-list dt').filter({ hasText: "Author's statement" })).toBeVisible();
  await expect(page.locator('.fc-method-register')).toContainText('no school match is computed');
  await expect(page.locator('.fc-method-register')).toContainText('none has bilingual approval');
  await expect(page.getByRole('link', { name: /Read the issue register/ })).toHaveAttribute('href', '/projects/fiqh-compass/issues/');
  await expect(page.getByRole('link', { name: /Send a source-based correction/ })).toHaveAttribute('href', '/projects/fiqh-compass/corrections/');

  for (const width of [320, 390, 780, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  await context.close();
});

test('quiz exposes every question without JavaScript and never submits answers in the URL', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/projects/fiqh-compass/quiz/`);

  await expect(page.locator('[data-question]:visible')).toHaveCount(TOTAL);
  await expect(page.locator('.fc-noscript')).toContainText('not sent or saved');
  const initialUrl = page.url();
  await page.locator('#question-Q01').getByText('Strongly agree', { exact: true }).click();
  await expect(page.locator('input[name="Q01"][value="2"]')).toBeChecked();
  expect(page.url()).toBe(initialUrl);

  await context.close();
});

test('quiz resumes locally and excludes uncertain answers from provisional coordinates', async ({ page }) => {
  const nonGetRequests: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET' && request.method() !== 'HEAD') {
      nonGetRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto('/projects/fiqh-compass/quiz/');
  await expect(page.locator('[data-question-position]')).toHaveText(`Question 1 of ${TOTAL}`);
  await page.locator('[data-compass-auto-advance]').uncheck({ force: true });
  await expect(page.locator('[data-compass-auto-advance]')).not.toBeChecked();

  await page.locator('#question-Q01').getByText('Strongly disagree', { exact: true }).click();
  await expect(page.locator('input[name="Q01"][value="-2"]')).toBeChecked();
  await page.locator('[data-compass-next]').click();
  await expect(page.locator('[data-question-position]')).toHaveText(`Question 2 of ${TOTAL}`);

  await page.locator('#question-Q02').getByText('Strongly agree', { exact: true }).click();
  await expect(page.locator('input[name="Q02"][value="2"]')).toBeChecked();
  await page.locator('[data-compass-next]').click();
  await expect(page.locator('[data-question-position]')).toHaveText(`Question 3 of ${TOTAL}`);
  await page.reload();

  await expect(page.locator('[data-question-position]')).toHaveText(`Question 3 of ${TOTAL}`);
  await page.locator('[data-compass-auto-advance]').uncheck({ force: true });
  await expect(page.locator('input[name="Q01"][value="-2"]')).toBeChecked();
  await expect(page.locator('input[name="Q02"][value="2"]')).toBeChecked();

  for (let index = 2; index < TOTAL; index += 1) {
    const question = page.locator(`[data-question-index="${index}"]`);
    const name = await question.locator('input[type="radio"]').first().getAttribute('name');
    expect(name).toBeTruthy();
    await question.getByText('I am not sure', { exact: true }).click();
    await expect(question.locator(`input[name="${name}"][value="unknown"]`)).toBeChecked();
    await page.locator('[data-compass-next]').click();
  }

  const results = page.locator('[data-compass-results]');
  await expect(results).toBeVisible();
  await expect(results.locator('[data-result-count]')).toHaveText(
    `${TOTAL} of ${TOTAL} responses recorded · 2 included in axis scores`,
  );
  await expect(results.locator('[role="img"][aria-label^="Sources of binding law: 100 out of 100"]')).toBeVisible();
  await expect(results.locator('.fc-result-meta').filter({ hasText: 'No scored answers' })).toHaveCount(11);
  await expect(results.locator('.fc-evidence-disclosure')).toHaveCount(0);
  // One scored dimension is too few to compare with any figure, and the page says so.
  await expect(results.locator('[data-figure-results]')).toContainText('Answer more statements to compare');
  await expect(results.locator('.fc-figure')).toHaveCount(0);
  // Each dimension still lists where the figures stand, with the passages.
  await expect(results.locator('.fc-figures-axis').first()).toContainText('Where figures stand on this dimension');
  // Each axis shows the statements and answers behind it.
  const basis = results.locator('.fc-result-basis');
  await expect(basis).toHaveCount(12);
  await basis.first().locator('summary').click();
  await expect(basis.first()).toContainText('Strongly disagree');
  expect(nonGetRequests).toEqual([]);

  await page.reload();
  await expect(page.locator('[data-compass-results]')).toBeVisible();
  await expect(page.locator('[data-result-count]')).toContainText('2 included in axis scores');

  // Restarting with answers recorded asks first.
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('[data-compass-reset]').last().click();
  await expect(page.locator('[data-compass-quiz]')).toBeVisible();
  await expect(page.locator('[data-question-position]')).toHaveText(`Question 1 of ${TOTAL}`);
  await expect(page.locator('input[name="Q01"]:checked')).toHaveCount(0);
  await expect(page.locator('[data-result-count]')).toHaveCount(1);
  expect(nonGetRequests).toEqual([]);
});

test('quiz remains within phone widths and supports a keyboard-only answer path', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/fiqh-compass/quiz/');
  await expect(page.locator('[data-question-position]')).toHaveText(`Question 1 of ${TOTAL}`);
  await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 760 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const card = await page.locator('[data-question][data-active="true"]').boundingBox();
    expect(card).not.toBeNull();
    expect(card!.x + card!.width).toBeLessThanOrEqual(width + 1);
  }

  await page.setViewportSize({ width: 320, height: 760 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  let reachedFirstAnswer = false;
  for (let tab = 0; tab < 16; tab += 1) {
    await page.keyboard.press('Tab');
    if (await page.locator('input[name="Q01"]:focus').count()) {
      reachedFirstAnswer = true;
      break;
    }
  }
  expect(reachedFirstAnswer).toBe(true);
  await expect(page.locator('input[name="Q01"]:focus')).toHaveCSS('outline-style', 'solid');

  for (let index = 0; index < TOTAL; index += 1) {
    await page.keyboard.press('Space');
    if (index < TOTAL - 1) {
      await expect(page.locator('[data-question-position]')).toHaveText(`Question ${index + 2} of ${TOTAL}`);
    }
  }
  await expect(page.locator('[data-compass-results]')).toBeVisible();
  await expect(page.locator('[data-result-count]')).toHaveText(`${TOTAL} of ${TOTAL} responses recorded · ${TOTAL} included in axis scores`);
});

test('a completed quiz names the closest figures and cites the passage behind each placement', async ({ page }) => {
  await page.addInitScript(([version, total]) => {
    const answers = Object.fromEntries(Array.from({ length: total }, (_, i) => [`Q${String(i + 1).padStart(2, '0')}`, '2']));
    localStorage.setItem(`hadithcritic:fiqh-compass:${version}`, JSON.stringify({ version, activeIndex: 0, answers, completed: true }));
  }, [VERSION, TOTAL] as const);
  await page.goto('/projects/fiqh-compass/quiz/');

  const figures = page.locator('[data-figure-results]');
  await expect(figures).toBeVisible();
  await expect(figures.locator('.fc-figures__list > .fc-figure')).toHaveCount(5);
  await expect(figures.locator('.fc-figures__stability')).toContainText('stays closest in');
  const first = figures.locator('.fc-figure').first();
  await expect(first.locator('.fc-figure__score')).toContainText('% similar on');
  await first.locator('.fc-figure__sources summary').click();
  const source = first.locator('.fc-source').first();
  await expect(source.locator('blockquote[lang="ar"][dir="rtl"]')).not.toBeEmpty();
  await expect(source.locator('.fc-source__cite')).toContainText('Shamela book');

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('correction form submits only the correction and never reads saved quiz answers', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const answerKey = `hadithcritic:fiqh-compass:${VERSION}`;
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ version: key.split(':').pop(), activeIndex: 4, answers: { Q01: '-2' } }));
    const reads: string[] = [];
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (name: string) {
      if (name === key) reads.push(name);
      return original.call(this, name);
    };
    (window as Window & { __fiqhAnswerReads?: string[] }).__fiqhAnswerReads = reads;
  }, answerKey);

  let submittedBody = '';
  await page.route('https://api.web3forms.com/submit', async (route) => {
    submittedBody = route.request().postData() ?? '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Submission successful' }),
    });
  });

  await page.goto('/projects/fiqh-compass/corrections/?kind=issue&record=I03');
  await expect(page.locator('select[name="category"]')).toHaveValue('Issue dossier');
  await expect(page.locator('input[name="record_reference"]')).toHaveValue('I03');
  const formBounds = await page.locator('#fc-correction-form').boundingBox();
  expect(formBounds).not.toBeNull();
  expect(formBounds!.x + formBounds!.width).toBeLessThanOrEqual(391);
  await page.locator('select[name="category"]').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="record_reference"]')).toBeFocused();
  await page.locator('input[name="source_reference"]').fill('al-Risala, verified edition, p. 42');
  await page.locator('textarea[name="message"]').fill('The cited passage needs a page locator check against the edition title page.');
  await page.locator('#fc-correction-form button[type="submit"]').click();

  await expect(page.locator('#fc-correction-status')).toHaveText('Thank you. Your correction was sent for editorial review.');
  expect(submittedBody).toContain('al-Risala, verified edition, p. 42');
  expect(submittedBody).toContain('I03');
  expect(submittedBody).not.toContain(answerKey);
  expect(submittedBody).not.toContain('Q01');
  expect(submittedBody).not.toContain('"-2"');
  expect(await page.evaluate(() => (window as Window & { __fiqhAnswerReads?: string[] }).__fiqhAnswerReads)).toEqual([]);
});
