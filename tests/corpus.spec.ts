import { expect, test, type Page } from '@playwright/test';

/**
 * Behaviour of the static corpus, against whatever corpus is being served.
 *
 * Every assertion here is about how the code behaves, not about which hadith
 * the corpus happens to contain, so the suite runs unchanged against the real
 * 1.62 GB corpus locally and against the committed fixture in CI. Counts are
 * read from the corpus's own generated metadata rather than hardcoded, which is
 * the invariant that actually matters: the page and the corpus must agree.
 *
 * Assertions that name particular records or real-world totals live in
 * tests/corpus-data.spec.ts, which skips unless the real corpus is present.
 *
 * Two rules the suite enforces that are easy to lose:
 *
 *   Not one request may go to a database service. If a hosted query reappears
 *   behind a corpus page, `noDatabaseTraffic` fails the test that provoked it.
 *
 *   A corpus page is a shell until the corpus answers, so every assertion waits
 *   for content rather than for `load`. Asserting on a spinner passes against a
 *   corpus that returns nothing at all.
 */

const CORPUS_TIMEOUT = 45_000;

/**
 * Hosts that would mean the corpus is being read from somewhere metered.
 * Deliberately broad: the point is to catch a reintroduction, whatever the
 * provider is called.
 */
const DATABASE_HOSTS = /turso\.io|libsql|cloudflare\.com\/client\/v4\/accounts|neon\.tech|planetscale/i;

interface CorpusMeta {
  corpusVersion: string;
  counts: {
    hadith: number;
    collections: number;
    narrators: number;
  };
  collections: { id: number; slug: string; title_en: string; hadith_count: number }[];
}

let meta: CorpusMeta | null = null;
let manifestUrl = '';

/**
 * Where the corpus is actually served from, as the page itself reports it.
 *
 * Not assumed to be the site's own origin. It is not, in the arrangement these
 * tests run under and the one production uses: Cloudflare static assets answer
 * a range request with 200 and the whole file, so the corpus is served from a
 * separate byte-serving origin. Asking the page means the test follows the
 * deployment rather than a guess about it.
 */
async function corpusManifestUrl(page: Page): Promise<string> {
  if (manifestUrl) return manifestUrl;
  await page.goto('/hadith');
  await expect(page.locator('.book-card').first()).toBeVisible();
  const reported = await page.evaluate(() => {
    const w = window as unknown as { __corpusManifest?: string; __corpusVersion?: string };
    return { manifest: w.__corpusManifest || '', version: w.__corpusVersion || '' };
  });
  expect(reported.version, 'the page must report which corpus build it serves').not.toBe('');
  expect(reported.manifest, 'the page must report where its corpus is served from').not.toBe('');
  manifestUrl = new URL(reported.manifest, page.url()).toString();
  return manifestUrl;
}

const corpusFile = (manifest: string, name: string) => new URL(name, manifest).toString();

/**
 * The metadata the deployment was built from, fetched once.
 *
 * Read from the served artifact rather than imported from src/data, so the test
 * checks what the running site actually has rather than what the working tree
 * says it should have.
 */
async function corpusMeta(page: Page): Promise<CorpusMeta> {
  if (meta) return meta;
  const manifest = await corpusManifestUrl(page);
  const url = corpusFile(manifest, 'corpus-meta.json');
  const response = await page.request.get(url);
  expect(response.ok(), `corpus metadata must be published alongside the chunks at ${url}`).toBe(
    true
  );
  meta = (await response.json()) as CorpusMeta;
  const version = await page.evaluate(
    () => (window as unknown as { __corpusVersion?: string }).__corpusVersion || ''
  );
  expect(meta.corpusVersion).toBe(version);
  return meta;
}

/** The collection with the most narrations, which every corpus has at least one of. */
const largestCollection = (m: CorpusMeta) =>
  [...m.collections].sort((a, b) => b.hadith_count - a.hadith_count)[0];

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

/** A term the served corpus definitely contains, so a search test cannot be vacuous. */
const COMMON_ARABIC = encodeURIComponent('محمد');

/** The numeric id at the end of a record link, with or without its trailing slash. */
const idFromHref = (href: string) => Number(/(\d+)\/?$/.exec(href)![1]);

test.describe('hadith corpus', () => {
  test('the index renders its catalogue and totals from generated metadata', async ({ page }) => {
    const urls = watchRequests(page);
    const m = await corpusMeta(page);

    // The page must agree with the corpus it is serving. Hardcoding a number
    // here would pass against a stale metadata file, which is the bug this is
    // meant to catch.
    await expect(page.locator('.corpus-stat-card__val').first()).toHaveText(
      m.counts.hadith.toLocaleString()
    );
    await expect(page.locator('.book-card')).toHaveCount(m.counts.collections);
    await expect(page.locator('.corpus-provenance__version')).toHaveText(m.corpusVersion);
    noDatabaseTraffic(urls);
  });

  test('an Arabic query is answered from the static corpus', async ({ page }) => {
    const urls = watchRequests(page);
    await page.goto(`/hadith?q=${COMMON_ARABIC}`);

    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    await expect(page.locator('.corpus-status__count')).toContainText('archival records found');
    // Every card links into the corpus and carries both scripts.
    const first = page.locator('.corpus-record-card').first();
    await expect(first.locator('a.corpus-record-card__hitarea')).toHaveAttribute(
      'href',
      /^\/hadith\/\d+\/$/
    );
    await expect(first.locator('.corpus-record-card__ar')).toHaveAttribute('lang', 'ar');
    noDatabaseTraffic(urls);
  });

  test('Arabic spelling is folded, so two spellings find the same corpus', async ({ page }) => {
    // عائشة and عايشه differ in hamza seat and final letter. The index and the
    // query fold were built to agree; if either side stops folding, one of these
    // finds records and the other finds none, and nothing else would fail.
    const counts: string[] = [];
    for (const spelling of ['%D8%B9%D8%A7%D8%A6%D8%B4%D8%A9', '%D8%B9%D8%A7%D9%8A%D8%B4%D9%87']) {
      await page.goto(`/hadith?q=${spelling}`);
      await expect(page.locator('.corpus-status__count')).toBeVisible({ timeout: CORPUS_TIMEOUT });
      counts.push((await page.locator('.corpus-status__count').innerText()).trim());
    }
    expect(counts[0]).toBe(counts[1]);
    expect(counts[0]).not.toContain('0 archival');
  });

  test('a collection filter reports that collection exactly', async ({ page }) => {
    const m = await corpusMeta(page);
    const book = largestCollection(m);

    await page.goto(`/hadith?book=${book.id}`);
    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    // The filtered total must equal the count the catalogue advertises for the
    // same collection. These come from different places and used to disagree.
    await expect(page.locator('.corpus-status__count')).toContainText(
      book.hadith_count.toLocaleString()
    );
    await expect(page.locator('.filter-chip__val')).toContainText(book.title_en);
  });

  test('a deep link survives a reload and the back button', async ({ page }) => {
    await page.goto(`/hadith?q=${COMMON_ARABIC}`);
    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });

    const pager = page.locator('a.corpus-pager__btn', { hasText: 'Next' });
    test.skip((await pager.count()) === 0, 'corpus too small to page');

    await pager.click();
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
  /** Any narration the served corpus contains, found through its own search. */
  async function anyHadithId(page: Page): Promise<number> {
    await page.goto(`/hadith?q=${COMMON_ARABIC}`);
    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    const href = await page
      .locator('a.corpus-record-card__hitarea')
      .first()
      .getAttribute('href');
    return idFromHref(href!);
  }

  test('renders its texts, isnad and apparatus from the corpus', async ({ page }) => {
    const urls = watchRequests(page);
    const id = await anyHadithId(page);
    await page.goto(`/hadith/${id}`);

    await expect(page.locator('.edition-hero')).toBeVisible({ timeout: CORPUS_TIMEOUT });
    // The shell titled itself "Hadith <id>"; the record must correct it.
    await expect(page).not.toHaveTitle(`Hadith ${id} | HadithCritic Critical Edition`);

    // The scrollspy's targets are linked from articles and must keep their ids.
    for (const anchor of ['report-heading']) {
      await expect(page.locator(`#${anchor}`)).toHaveCount(1);
    }

    await expect(page.locator('.facing-prose--ar').first()).toBeVisible();
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
    const m = await corpusMeta(page);
    const book = largestCollection(m);

    await page.goto(`/hadith/collection/${book.slug}`);
    await expect(page.locator('.narration-record').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });

    const pages = Math.max(1, Math.ceil(book.hadith_count / 25));
    await expect(page.locator('.edition-pager__counter')).toContainText(
      `Page 1 of ${pages.toLocaleString()}`
    );

    if (pages > 1) {
      const next = page.locator('a.edition-pager__link', { hasText: 'Next' });
      // Seek paging: the link carries the last id rather than an OFFSET.
      await expect(next).toHaveAttribute('href', /after=\d+/);
      const firstBefore = await page.locator('.narration-record__num').first().innerText();
      await next.click();

      // The shell is one prerendered document served for every page of the
      // collection, so the position has to come from the URL. It did not, once.
      await expect(page.locator('.edition-pager__counter')).toContainText('Page 2', {
        timeout: CORPUS_TIMEOUT
      });
      await expect(page.locator('.narration-record__num').first()).not.toHaveText(firstBefore);
    }
    noDatabaseTraffic(urls);
  });

  test('the collection shell is prerendered, so its metadata needs no script', async ({
    browser,
    page
  }) => {
    const m = await corpusMeta(page);
    const book = largestCollection(m);

    const context = await browser.newContext({ javaScriptEnabled: false });
    const noScript = await context.newPage();
    await noScript.goto(`/hadith/collection/${book.slug}`);

    await expect(noScript.locator('h1.edition-title')).toHaveText(book.title_en);
    await expect(noScript.locator('.edition-stat-entry__val').first()).toContainText(
      book.hadith_count.toLocaleString()
    );
    await context.close();
  });
});

test.describe('narrator register', () => {
  test('lists transmitters and reports the stored total', async ({ page }) => {
    const urls = watchRequests(page);
    const m = await corpusMeta(page);

    await page.goto('/narrators');
    await expect(page.locator('.reg-row').first()).toBeVisible({ timeout: CORPUS_TIMEOUT });
    await expect(page.locator('[data-register-status]')).toContainText(
      `${m.counts.narrators.toLocaleString()} transmitters`
    );
    await expect(page.locator('.reg-row')).toHaveCount(Math.min(50, m.counts.narrators));
    await expect(page.locator('.reg-main').first()).toHaveAttribute('href', /^\/narrators\/\d+\/$/);
    noDatabaseTraffic(urls);
  });

  test('search narrows the register and keeps the URL shareable', async ({ page }) => {
    const m = await corpusMeta(page);
    await page.goto('/narrators?q=malik&sort=hadith');
    await expect(page.locator('[data-register-status]')).toBeVisible({ timeout: CORPUS_TIMEOUT });

    await expect(page.locator('[data-register-search]')).toHaveValue('malik');
    await expect(page.locator('[data-register-sort]')).toHaveValue('hadith');
    await expect(page.locator('[data-register-status]')).not.toContainText(
      `${m.counts.narrators.toLocaleString()} transmitters`,
      { timeout: CORPUS_TIMEOUT }
    );
  });

  test('a filter chip is undone by the back button', async ({ page }) => {
    const m = await corpusMeta(page);
    const unfiltered = `${m.counts.narrators.toLocaleString()} transmitters`;

    await page.goto('/narrators');
    await expect(page.locator('.reg-row').first()).toBeVisible({ timeout: CORPUS_TIMEOUT });

    const chip = page.locator('[data-filter-group="century"] [data-value]').nth(1);
    test.skip((await chip.count()) === 0, 'corpus has no century facet');
    const expected = (await chip.locator('.register-tab__n').innerText()).trim();

    await chip.click();
    // Wait for the settled count, not merely for the total to change: the status
    // reads "Searching..." in between, which also is not the unfiltered total,
    // and asserting on that passes before the filter has been applied at all.
    // The chip's own number is the facet count, so this also checks that the
    // stored facet and the live query agree.
    await expect(page.locator('[data-register-status]')).toContainText(`${expected} transmitters`, {
      timeout: CORPUS_TIMEOUT
    });
    expect(new URL(page.url()).searchParams.get('century')).not.toBeNull();

    await page.goBack();
    await expect(page.locator('[data-register-status]')).toContainText(unfiltered, {
      timeout: CORPUS_TIMEOUT
    });
    expect(new URL(page.url()).searchParams.get('century')).toBeNull();
  });
});

test.describe('narrator dossier', () => {
  /** A transmitter the served corpus has a dossier for. */
  async function anyNarratorId(page: Page): Promise<number> {
    await page.goto('/narrators?sort=criticism');
    await expect(page.locator('.reg-row').first()).toBeVisible({ timeout: CORPUS_TIMEOUT });
    const href = await page.locator('.reg-main').first().getAttribute('href');
    return idFromHref(href!);
  }

  test('renders the biography and links both ways', async ({ page }) => {
    const urls = watchRequests(page);
    const id = await anyNarratorId(page);
    await page.goto(`/narrators/${id}`);

    await expect(page.locator('.rijal-name-en')).toBeVisible({ timeout: CORPUS_TIMEOUT });
    await expect(page.locator('.rijal-id-pill')).toHaveText(`Transmitter #${id}`);
    await expect(page.locator('.rijal-fact-card')).toHaveCount(4);
    // Links back into the corpus, which is the other half of the relationship.
    await expect(page.locator(`a[href="/hadith/?narrator=${id}"]`).first()).toBeVisible();
    noDatabaseTraffic(urls);
  });

  test('no authenticity grade is asserted anywhere on a dossier', async ({ page }) => {
    // The product rule, as a test. Classical verdicts appear as attributed
    // source data; nothing on the page scores a transmitter.
    const id = await anyNarratorId(page);
    await page.goto(`/narrators/${id}`);
    await expect(page.locator('.rijal-name-en')).toBeVisible({ timeout: CORPUS_TIMEOUT });

    for (const verdict of await page.locator('.rijal-stmt-verdict').all()) {
      await expect(verdict).toHaveText(/Jarḥ|Taʿdīl|Mixed|Unclassified/);
    }
    await expect(
      page.locator('[class*="rating"], [class*="score"], [aria-label*="stars"]')
    ).toHaveCount(0);
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
    await page.goto('/narrators');
    await expect(page.locator('.reg-row').first()).toBeVisible({ timeout: CORPUS_TIMEOUT });
    const ids = await page.locator('.reg-main').evaluateAll((links) =>
      links.slice(0, 3).map((a) => Number(/(\d+)\/?$/.exec(a.getAttribute('href')!)![1]))
    );

    // Reversed, because the table must follow the order the researcher picked
    // rather than the order the database returns.
    const chosen = [...ids].reverse();
    await page.goto(`/narrators/compare?ids=${chosen.join(',')}`);
    await expect(page.locator('.compare-table')).toBeVisible({ timeout: CORPUS_TIMEOUT });

    const headers = page.locator('.compare-table thead th');
    await expect(headers).toHaveCount(chosen.length + 1);
    for (const [index, id] of chosen.entries()) {
      await expect(headers.nth(index + 1)).toContainText(`#${id}`);
    }
  });

  test('an empty selection explains itself', async ({ page }) => {
    await page.goto('/narrators/compare');
    await expect(page.locator('.compare-empty')).toContainText('No transmitters selected');
  });
});

test.describe('corpus artifacts', () => {
  test('the manifest is self-locating and describes a chunked database', async ({ page }) => {
    const m = await corpusMeta(page);
    const manifest = await (await page.request.get(await corpusManifestUrl(page))).json();

    expect(manifest.version).toBe(m.corpusVersion);
    expect(manifest.serverMode).toBe('chunked');
    expect(manifest.chunkCount).toBeGreaterThan(0);
    expect(manifest.databaseLengthBytes).toBeGreaterThan(0);
    // Relative, so the same bytes work served from the site or from a data
    // host. An absolute prefix would pin the chunks to one origin.
    expect(manifest.urlPrefix).not.toMatch(/^(\/|https?:)/);
    // Must equal the database page size or every page read spans two requests.
    expect(manifest.requestChunkSize).toBe(4096);
    // The chunk count has to follow from the two sizes, or the addressing is wrong.
    expect(manifest.chunkCount).toBe(
      Math.ceil(manifest.databaseLengthBytes / manifest.serverChunkSize)
    );
  });

  test('chunks answer range requests, which the whole design rests on', async ({ page }) => {
    const manifest = await corpusManifestUrl(page);
    const url = corpusFile(manifest, 'chunks/hadith.chunk.000');

    const response = await page.request.get(url, { headers: { Range: 'bytes=0-99' } });
    // A 200 here means the host sent the whole chunk. sql.js-httpvfs would then
    // copy bytes from offset 0 into the page it thinks it asked for, and SQLite
    // would read a database made of the wrong pages. openCorpus() refuses to
    // start in that case; this is the same check, at the HTTP level.
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
