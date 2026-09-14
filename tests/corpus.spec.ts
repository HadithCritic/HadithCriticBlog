import { expect, test, type Page } from '@playwright/test';

/**
 * Acceptance tests for the static corpus.
 *
 * The corpus moved off a hosted database and onto a versioned SQLite file the
 * browser reads over HTTP range requests. Every test here exists because the
 * migration could plausibly break it and nothing else would notice: the pages
 * still render, they just render the wrong thing or nothing at all.
 *
 * Two rules the suite enforces that are easy to lose:
 *
 *   Not one request may go to a database service. If a hosted query reappears
 *   behind a corpus page, `noDatabaseTraffic` fails the test that provoked it.
 *
 *   A corpus page is a shell until the corpus answers, so every assertion
 *   waits for content rather than for `load`. Asserting on a spinner passes
 *   against a corpus that returns nothing at all.
 */

const CORPUS_TIMEOUT = 45_000;

/**
 * Hosts that would mean the corpus is being read from somewhere metered.
 * Deliberately broad: the point is to catch a reintroduction, whatever the
 * provider is called.
 */
const DATABASE_HOSTS = /turso\.io|libsql|cloudflare\.com\/client\/v4\/accounts|neon\.tech|planetscale/i;

/** Record every request the page makes, so a test can assert on all of them. */
function watchRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  return urls;
}

function noDatabaseTraffic(urls: string[]) {
  const offenders = urls.filter((url) => DATABASE_HOSTS.test(url));
  expect(offenders, 'corpus pages must not query a hosted database').toEqual([]);
}

test.describe('hadith corpus', () => {
  test('the index renders its catalogue and totals without querying anything', async ({ page }) => {
    const urls = watchRequests(page);
    await page.goto('/hadith');

    // Generated into src/data/corpus-meta.json, never counted at request time.
    await expect(page.locator('.corpus-stat-card__val').first()).toHaveText('276,347');
    await expect(page.locator('.book-card')).toHaveCount(33);
    noDatabaseTraffic(urls);
  });

  test('an Arabic query is answered from the static corpus', async ({ page }) => {
    const urls = watchRequests(page);
    await page.goto('/hadith?q=%D8%B9%D8%A7%D8%A6%D8%B4%D8%A9');

    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    await expect(page.locator('.corpus-record-card')).toHaveCount(25);
    await expect(page.locator('.corpus-status__count')).toContainText('archival records found');
    noDatabaseTraffic(urls);
  });

  test('Arabic spelling is folded, so two spellings find the same corpus', async ({ page }) => {
    // عائشة and عايشة differ in hamza seat only. The register and the index were
    // both built through the same fold; if either side stops folding, one of
    // these finds sixty thousand records and the other finds none.
    const counts: string[] = [];
    for (const spelling of ['%D8%B9%D8%A7%D8%A6%D8%B4%D8%A9', '%D8%B9%D8%A7%D9%8A%D8%B4%D9%87']) {
      await page.goto(`/hadith?q=${spelling}`);
      await expect(page.locator('.corpus-record-card').first()).toBeVisible({
        timeout: CORPUS_TIMEOUT
      });
      counts.push((await page.locator('.corpus-status__count').innerText()).trim());
    }
    expect(counts[0]).toBe(counts[1]);
  });

  test('a collection filter reports that collection exactly', async ({ page }) => {
    // 1,781 is Muwatta' Malik's stored hadith_count. An off-by-one here means
    // the filter and the catalogue disagree about the same collection.
    await page.goto('/hadith?book=27');
    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    await expect(page.locator('.corpus-status__count')).toContainText('1,781');
    await expect(page.locator('.filter-chip__val')).toContainText("Muwatta' Malik");
  });

  test('a narrator filter counts narrations, not chain positions', async ({ page }) => {
    // Malik occupies several positions in some chains, so hadith_narrator holds
    // 10,485 rows for 8,693 narrations. Counting rows overstates by a fifth.
    await page.goto('/hadith?narrator=5361');
    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    await expect(page.locator('.corpus-status__count')).toContainText('8,693');
    await expect(page.locator('.filter-chip__link')).toHaveAttribute('href', '/narrators/5361');
  });

  test('a deep link survives a reload and the back button', async ({ page }) => {
    await page.goto('/hadith?q=%D8%A7%D9%84%D8%B5%D9%84%D8%A7%D8%A9');
    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });

    await page.locator('a.corpus-pager__btn', { hasText: 'Next' }).click();
    await expect(page.locator('.corpus-pager__info')).toContainText('Page 2');
    expect(new URL(page.url()).searchParams.get('page')).toBe('2');

    await page.reload();
    await expect(page.locator('.corpus-pager__info')).toContainText('Page 2', {
      timeout: CORPUS_TIMEOUT
    });

    await page.goBack();
    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    expect(new URL(page.url()).searchParams.get('page')).toBeNull();
  });
});

test.describe('narration record', () => {
  test('renders its texts, isnad and apparatus from the corpus', async ({ page }) => {
    const urls = watchRequests(page);
    await page.goto('/hadith/20614');

    await expect(page.locator('.edition-hero')).toBeVisible({ timeout: CORPUS_TIMEOUT });
    await expect(page).toHaveTitle(/Muwatta' Malik/);

    // The scrollspy's targets are linked from articles and must keep their ids.
    for (const id of ['report-heading', 'isnad-heading', 'apparatus-heading']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    await expect(page.locator('.ladder-node').first()).toBeVisible();
    // Every resolved transmitter is a link into the register.
    await expect(page.locator('.ladder-card__name[href^="/narrators/"]').first()).toBeVisible();
    noDatabaseTraffic(urls);
  });

  test('an id with no record says so rather than failing blank', async ({ page }) => {
    await page.goto('/hadith/999999999');
    await expect(page.locator('.hadith-degraded__title')).toContainText('not in this corpus', {
      timeout: CORPUS_TIMEOUT
    });
    await expect(page.locator('.hadith-degraded__badge')).toHaveText('No such record');
  });
});

test.describe('collection edition', () => {
  test('lists narrations in manuscript order with a working pager', async ({ page }) => {
    const urls = watchRequests(page);
    await page.goto('/hadith/collection/musannaf-ibn-abi-shaybah');

    await expect(page.locator('.narration-record').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    await expect(page.locator('.narration-record')).toHaveCount(25);
    await expect(page.locator('.edition-pager__counter')).toContainText('Page 1 of 1,564');

    const next = page.locator('a.edition-pager__link', { hasText: 'Next' });
    // Seek paging: the link carries the last id rather than an OFFSET.
    await expect(next).toHaveAttribute('href', /after=\d+/);
    await next.click();

    // The shell is one prerendered document served for every page of the
    // collection, so the position has to come from the URL. It did not, once.
    await expect(page.locator('.edition-pager__counter')).toContainText('Page 2 of 1,564', {
      timeout: CORPUS_TIMEOUT
    });
    await expect(page.locator('.narration-record__num').first()).not.toHaveText('№ 1');
    noDatabaseTraffic(urls);
  });

  test('the collection shell is prerendered, so its metadata needs no script', async ({
    browser
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/hadith/collection/sahih-al-bukhari');

    await expect(page.locator('h1.edition-title')).toHaveText('Sahih al-Bukhari');
    await expect(page.locator('.edition-stat-entry__val').first()).toContainText('7,410');
    await context.close();
  });
});

test.describe('narrator register', () => {
  test('lists transmitters and reports the stored total', async ({ page }) => {
    const urls = watchRequests(page);
    await page.goto('/narrators');

    await expect(page.locator('.reg-row').first()).toBeVisible({ timeout: CORPUS_TIMEOUT });
    await expect(page.locator('.reg-row')).toHaveCount(50);
    await expect(page.locator('[data-register-status]')).toContainText('20,915 transmitters');
    noDatabaseTraffic(urls);
  });

  test('search narrows the register and keeps the URL shareable', async ({ page }) => {
    await page.goto('/narrators?q=malik&sort=hadith');
    await expect(page.locator('.reg-row').first()).toBeVisible({ timeout: CORPUS_TIMEOUT });

    await expect(page.locator('[data-register-search]')).toHaveValue('malik');
    await expect(page.locator('[data-register-sort]')).toHaveValue('hadith');
    const status = await page.locator('[data-register-status]').innerText();
    expect(status).not.toContain('20,915');
  });

  test('a filter chip is undone by the back button', async ({ page }) => {
    await page.goto('/narrators');
    await expect(page.locator('.reg-row').first()).toBeVisible({ timeout: CORPUS_TIMEOUT });

    await page.locator('[data-filter-group="century"] [data-value="2"]').click();

    // Wait for the settled count, not merely for the total to change: the
    // status reads "Searching…" in between, which also is not "20,915", and
    // asserting on that passes before the filter has been applied at all.
    // 3,226 is the stored facet count for narrators who died in the 2nd
    // century AH, so this also checks the chip and the query agree.
    await expect(page.locator('[data-register-status]')).toContainText('3,226 transmitters', {
      timeout: CORPUS_TIMEOUT
    });
    expect(new URL(page.url()).searchParams.get('century')).toBe('2');

    await page.goBack();
    await expect(page.locator('[data-register-status]')).toContainText('20,915', {
      timeout: CORPUS_TIMEOUT
    });
    expect(new URL(page.url()).searchParams.get('century')).toBeNull();
  });
});

test.describe('narrator dossier', () => {
  test('renders the biography, criticism and network', async ({ page }) => {
    const urls = watchRequests(page);
    await page.goto('/narrators/5361');

    await expect(page.locator('.rijal-name-en')).toHaveText('Malik ibn Anas', {
      timeout: CORPUS_TIMEOUT
    });
    await expect(page).toHaveTitle(/Malik ibn Anas/);
    await expect(page.locator('.rijal-critic-accordion').first()).toBeVisible();
    await expect(page.locator('.rijal-net-link').first()).toHaveAttribute(
      'href',
      /^\/narrators\/\d+$/
    );
    // Links back into the corpus, which is the other half of the relationship.
    await expect(page.locator('.rijal-transmission-card').first()).toHaveAttribute(
      'href',
      /^\/hadith\/\d+$/
    );
    noDatabaseTraffic(urls);
  });

  test('no authenticity grade is asserted anywhere on a dossier', async ({ page }) => {
    // The product rule, as a test. Classical verdicts appear as attributed
    // source data; nothing on the page scores a transmitter.
    await page.goto('/narrators/5361');
    await expect(page.locator('.rijal-name-en')).toBeVisible({ timeout: CORPUS_TIMEOUT });

    for (const critic of await page.locator('.rijal-stmt-verdict').all()) {
      await expect(critic).toHaveText(/Jarḥ|Taʿdīl|Mixed|Unclassified/);
    }
    await expect(page.locator('[class*="rating"], [class*="score"], [aria-label*="stars"]'))
      .toHaveCount(0);
  });

  test('an id with no entry says so rather than failing blank', async ({ page }) => {
    await page.goto('/narrators/999999');
    await expect(page.locator('.rijal-degraded__title')).toContainText('not in this register', {
      timeout: CORPUS_TIMEOUT
    });
  });
});

test.describe('comparison', () => {
  test('compares the selected transmitters in the order chosen', async ({ page }) => {
    await page.goto('/narrators/compare?ids=5361,5917,4361');
    await expect(page.locator('.compare-table')).toBeVisible({ timeout: CORPUS_TIMEOUT });

    const headers = page.locator('.compare-table thead th');
    await expect(headers).toHaveCount(4);
    await expect(headers.nth(1)).toContainText('Malik ibn Anas');
    await expect(headers.nth(2)).toContainText('al-Zuhri');
  });

  test('an empty selection explains itself', async ({ page }) => {
    await page.goto('/narrators/compare');
    await expect(page.locator('.compare-empty')).toContainText('No transmitters selected');
  });
});

test.describe('corpus artifacts', () => {
  /** The build the page is serving, as the page itself reports it. */
  async function corpusVersion(page: Page): Promise<string> {
    await page.goto('/hadith');
    await expect(page.locator('.book-card').first()).toBeVisible();
    return page.evaluate(
      () => (window as unknown as { __corpusVersion?: string }).__corpusVersion || ''
    );
  }

  test('the manifest is self-locating and describes a chunked database', async ({
    page,
    request
  }) => {
    const version = await corpusVersion(page);
    expect(version, 'the page must report which corpus build it serves').not.toBe('');

    const manifest = await (await request.get(`/data/corpus/${version}/manifest.json`)).json();
    expect(manifest.version).toBe(version);
    expect(manifest.serverMode).toBe('chunked');
    expect(manifest.chunkCount).toBeGreaterThan(0);
    expect(manifest.databaseLengthBytes).toBeGreaterThan(0);
    // Relative, so the same bytes work served from the site or from a data
    // host. An absolute prefix would pin the chunks to one origin.
    expect(manifest.urlPrefix).not.toMatch(/^(\/|https?:)/);
    // Must equal the database page size or every page read spans two requests.
    expect(manifest.requestChunkSize).toBe(4096);
  });

  test('chunks answer range requests, which the whole design rests on', async ({
    page,
    request
  }) => {
    const version = await corpusVersion(page);

    const response = await request.get(`/data/corpus/${version}/chunks/hadith.chunk.000`, {
      headers: { Range: 'bytes=0-99' }
    });
    expect(response.status()).toBe(206);
    expect(response.headers()['content-range']).toMatch(/^bytes 0-99\/\d+$/);
    expect(response.headers()['accept-ranges']).toBe('bytes');

    const body = await response.body();
    expect(body.length).toBe(100);
    // Chunk zero starts at byte zero of the database, so it starts with the
    // SQLite header. A chunker that wrote them out of order fails here.
    expect(body.subarray(0, 15).toString()).toBe('SQLite format 3');
  });
});
