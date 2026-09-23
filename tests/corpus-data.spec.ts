import { expect, test } from '@playwright/test';

/**
 * Assertions about what the real corpus actually contains.
 *
 * These name particular narrations, particular transmitters and real totals, so
 * they cannot run against the miniature fixture CI serves. They skip there, and
 * they are the reason `npm run test:e2e:corpus` exists: run it against the real
 * corpus before publishing one.
 *
 * tests/corpus.spec.ts holds everything that is true of any corpus, and that
 * suite is the one protecting the code. This one protects the data: a reseed
 * that drops a collection, an id that shifts, a fold that stops folding.
 */

const CORPUS_TIMEOUT = 45_000;

/** Figures the corpus release is expected to carry. Update them with the corpus. */
const EXPECTED = {
  hadith: 276_347,
  collections: 33,
  narrators: 20_915,
  /** Muwatta' Malik, whose stored hadith_count the filter must reproduce exactly. */
  muwattaBookId: 27,
  muwattaCount: 1_781,
  /**
   * Malik ibn Anas. `hadith_narrator` holds 10,485 rows for him across 8,693
   * narrations, because he occupies several positions in some chains. Counting
   * rows rather than DISTINCT narrations overstates by a fifth.
   */
  malikId: 5361,
  malikName: 'Malik ibn Anas',
  malikNarrations: 8_693,
  /** Muwatta' Malik No. 3: two isnad branches, the classic Aisha to Malik chain. */
  sampleHadith: 20614,
  sampleReference: "Muwatta' Malik"
};

let corpusVersion: string | null = null;

/**
 * Skip the whole file unless the real corpus is being served. The fixture
 * announces itself by version, so this cannot silently pass against it.
 */
test.beforeEach(async ({ page }) => {
  if (corpusVersion === null) {
    await page.goto('/hadith');
    await expect(page.locator('.book-card').first()).toBeVisible();
    corpusVersion = await page.evaluate(
      () => (window as unknown as { __corpusVersion?: string }).__corpusVersion || ''
    );
  }
  // The fixture names itself for its own contents, so the prefix is the test.
  test.skip(
    corpusVersion.startsWith('fixture'),
    'the real corpus is not published here; run `npm run test:e2e:corpus` against a real build'
  );
});

test('the corpus reports the totals the release was cut with', async ({ page }) => {
  await page.goto('/hadith');
  await expect(page.locator('.corpus-stat-card__val').first()).toHaveText(
    EXPECTED.hadith.toLocaleString()
  );
  await expect(page.locator('.book-card')).toHaveCount(EXPECTED.collections);
  await page.goto('/narrators');
  await expect(page.locator('[data-register-status]')).toContainText(
    `${EXPECTED.narrators.toLocaleString()} transmitters`,
    { timeout: CORPUS_TIMEOUT }
  );
});

test('a collection filter reproduces the stored count exactly', async ({ page }) => {
  await page.goto(`/hadith?book=${EXPECTED.muwattaBookId}`);
  await expect(page.locator('.corpus-record-card').first()).toBeVisible({
    timeout: CORPUS_TIMEOUT
  });
  await expect(page.locator('.corpus-status__count')).toContainText(
    EXPECTED.muwattaCount.toLocaleString()
  );
  await expect(page.locator('.filter-chip__val')).toContainText(EXPECTED.sampleReference);
});

test('a narrator filter counts narrations, not chain positions', async ({ page }) => {
  await page.goto(`/hadith?narrator=${EXPECTED.malikId}`);
  await expect(page.locator('.corpus-record-card').first()).toBeVisible({
    timeout: CORPUS_TIMEOUT
  });
  await expect(page.locator('.corpus-status__count')).toContainText(
    EXPECTED.malikNarrations.toLocaleString()
  );
  await expect(page.locator('.filter-chip__link')).toHaveText(EXPECTED.malikName);
});

test('the sample narration keeps its identity, chain and apparatus', async ({ page }) => {
  await page.goto(`/hadith/${EXPECTED.sampleHadith}`);
  await expect(page.locator('.edition-hero')).toBeVisible({ timeout: CORPUS_TIMEOUT });
  await expect(page).toHaveTitle(new RegExp(EXPECTED.sampleReference.replace(/'/g, "'")));

  // Two branches, and the chain that ends at the compiler.
  await expect(page.locator('.isnad-path-card')).toHaveCount(2);
  await expect(page.locator('.role-pill--compiler').first()).toBeVisible();
  await expect(
    page.locator(`.ladder-card__name[href="/narrators/${EXPECTED.malikId}/"]`).first()
  ).toBeVisible();

  // All four sections, which only this record's shape produces.
  for (const anchor of ['matn-heading', 'report-heading', 'isnad-heading', 'apparatus-heading']) {
    await expect(page.locator(`#${anchor}`)).toHaveCount(1);
  }
});

test('the sample dossier carries its criticism and network', async ({ page }) => {
  await page.goto(`/narrators/${EXPECTED.malikId}`);
  await expect(page.locator('.rijal-name-en')).toHaveText(EXPECTED.malikName, {
    timeout: CORPUS_TIMEOUT
  });
  await expect(page).toHaveTitle(new RegExp(EXPECTED.malikName));
  await expect(page.locator('.rijal-critic-accordion').first()).toBeVisible();
  await expect(page.locator('.rijal-net-link').first()).toHaveAttribute('href', /^\/narrators\/\d+\/$/);
  await expect(page.locator('.rijal-transmission-card').first()).toHaveAttribute(
    'href',
    /^\/hadith\/\d+\/$/
  );
});

test('an id the corpus does not hold answers 404 and is kept out of the index', async ({ page }) => {
  // Hadith ids are sparse: 1 to 3 do not exist, 4 does. Before the shells
  // checked, every numeric id answered an indexable 200.
  for (const [path, status] of [
    ['/hadith/3/', 404],
    ['/hadith/999999999/', 404],
    [`/hadith/${EXPECTED.sampleHadith}/`, 200],
    [`/narrators/${EXPECTED.malikId}/`, 200],
    ['/narrators/999999/', 404]
  ] as const) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(status);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots, path).toMatch(status === 404 ? /^noindex/ : /^index/);
  }
  // The 404 still renders the shell, so the reader gets the explanation
  // rather than a blank page.
  await expect(page.locator('.rijal-degraded__title')).toContainText('not in this register', {
    timeout: CORPUS_TIMEOUT
  });
});

test('both spellings of a folded name find the same narrations', async ({ page }) => {
  const counts: string[] = [];
  for (const spelling of ['%D8%B9%D8%A7%D8%A6%D8%B4%D8%A9', '%D8%B9%D8%A7%D9%8A%D8%B4%D9%87']) {
    await page.goto(`/hadith?q=${spelling}`);
    await expect(page.locator('.corpus-record-card').first()).toBeVisible({
      timeout: CORPUS_TIMEOUT
    });
    counts.push((await page.locator('.corpus-status__count').innerText()).trim());
  }
  expect(counts[0]).toBe(counts[1]);
  // Capped counts read "10,000+"; either way it must be a real result set.
  expect(counts[0]).toMatch(/[1-9][\d,]*\+? archival records/);
});
