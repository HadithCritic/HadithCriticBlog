import { expect, test } from '@playwright/test';
import { splitParts } from '../src/lib/qiraat-parts';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const activeReleaseId = JSON.parse(readFileSync('public/data/quran/manifest.json', 'utf8')).releaseId as string;
const hasLocalReleaseAssets = existsSync(join('public/data/quran/releases', activeReleaseId));

const quranRoutes = [
  '/projects/quran/',
  '/projects/quran/read/',
  '/projects/quran/variants/',
  '/projects/quran/relationships/',
  '/projects/quran/concordance/',
  '/projects/quran/intertexts/',
  '/projects/quran/intertexts/categories/',
  '/projects/quran/manuscripts/',
  '/projects/quran/analyses/',
  '/projects/quran/methods/',
  '/projects/quran/transmission/',
  '/projects/quran/sura/1/',
  '/projects/quran/sura/2/'
];

test.describe('Quran project navigation', () => {
  test.skip(!hasLocalReleaseAssets, 'The immutable Quran release is ignored by Git and is not present in CI checkouts.');

  test('Variant Index defers the full catalog until search is requested', async ({ page }) => {
    const catalogRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/variant-catalog.json')) catalogRequests.push(request.url());
    });
    await page.goto('/projects/quran/variants/');
    await expect(page.locator('#qv-search-status')).toContainText('12-record source-linked preview');
    expect(catalogRequests).toHaveLength(0);
    await page.locator('#qv-query').fill('zotero');
    await page.getByRole('button', { name: 'Search all records' }).click();
    await expect(page.locator('#qv-search-status')).toContainText('of 18,000 source records match');
    expect(catalogRequests).toHaveLength(1);
  });

  test('Variant Index preserves every TEI-listed label in a multi-label record', async ({ page }) => {
    await page.goto('/projects/quran/variants/');
    await page.locator('#qv-query').fill('variant_1000');
    await page.getByRole('button', { name: 'Search all records' }).click();
    const record = page.locator('#variant_1000');
    await expect(record).toBeVisible();
    await expect(record.locator('.qv-record__reader')).toContainText('2 TEI-listed labels');
    const references = record.locator('.qv-record__reader-references');
    await references.locator('summary').click();
    await expect(references).toContainText('Abū Ǧaʿfar');
    await expect(references).toContainText('Ḫalaf');
    await expect(references.getByRole('link', { name: /source line 10832/ })).toHaveAttribute(
      'href',
      /allvariants\.xml#L10832$/
    );
  });

  test('label analysis searches exact descriptive source labels', async ({ page }) => {
    await page.goto('/projects/quran/analyses/');
    const search = page.getByLabel('Search exact source key, label, or variant ID');
    await expect(search).toBeEnabled();
    await search.fill('grammatisch möglich');
    const results = page.locator('#qa-results');
    await expect(results).toContainText('grammatisch möglich');
    await expect(page.locator('#qa-status')).toContainText('exact-key groups match');
  });

  test('variant and analysis evidence remain available without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/projects/quran/variants/');
    await expect(page.locator('.qv-record')).toHaveCount(12);
    await expect(page.locator('.qv-record__source').first()).toHaveAttribute('href', /allvariants\.xml#L\d+$/);
    await expect(page.getByRole('link', { name: /complete 18,000-record search catalog/i })).toBeVisible();

    await page.goto('/projects/quran/analyses/');
    await expect(page.locator('#qa-results .qa-row')).toHaveCount(8);
    await expect(page.getByRole('link', { name: 'Download analysis rows and record members' })).toBeVisible();
    await expect(page.locator('#qa-status')).toContainText('30,112 source label entries');
    await context.close();
  });

  test('all Quran routes have one main landmark and fit a narrow viewport', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of quranRoutes) {
      await page.goto(route);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1').first()).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${route} should not overflow a 390px viewport`
      ).toBeTruthy();
    }

    expect(errors).toEqual([]);
  });

  test('all Quran routes give interactive controls accessible names', async ({ page }) => {
    const unnamedByRoute: Record<string, string[]> = {};

    for (const route of quranRoutes) {
      await page.goto(route);
      const unnamed = await page.locator('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"]')
        .evaluateAll((elements) => elements.flatMap((element) => {
          const node = element as HTMLElement;
          if (node.closest('[aria-hidden="true"], [hidden], astro-dev-toolbar')
            || node.getAttribute('name') === 'dev-toolbar-toggle'
            || (node instanceof HTMLButtonElement && node.querySelector('slot'))) return [];
          const labelledBy = node.getAttribute('aria-labelledby')
            ?.split(/\s+/u)
            .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
            .filter(Boolean)
            .join(' ');
          const associatedLabels = node instanceof HTMLInputElement || node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement
            ? Array.from(node.labels ?? []).map((label) => label.textContent?.trim() ?? '').filter(Boolean).join(' ')
            : '';
          const imageAlternatives = Array.from(node.querySelectorAll('img')).map((image) => image.alt.trim()).filter(Boolean).join(' ');
          const name = node.getAttribute('aria-label')?.trim()
            || labelledBy
            || associatedLabels
            || node.textContent?.trim()
            || imageAlternatives
            || (node instanceof HTMLInputElement ? node.getAttribute('placeholder')?.trim() : '')
            || '';
          return name ? [] : [`<${node.tagName.toLowerCase()}> href=${node.getAttribute('href') ?? ''} title=${node.title} html=${node.outerHTML.slice(0, 320)}`];
        }));

      if (unnamed.length) unnamedByRoute[route] = unnamed.slice(0, 12);
    }

    expect(unnamedByRoute).toEqual({});
  });

  test('Read & Compare preserves passage and source reader key when following candidate links', async ({ page }) => {
    await page.goto('/projects/quran/variants/');

    const candidateDetails = page.locator('.qv-record__alignments').first();
    await expect(candidateDetails).toHaveCount(1);
    await candidateDetails.locator('summary').click();
    await expect(candidateDetails).toContainText('Candidate rule: cc-variant-n-to-cairo-xml-id-v1');
    const readLink = candidateDetails.getByRole('link', { name: /Read & Compare/ });
    const readHref = await readLink.getAttribute('href');
    expect(readHref).toBeTruthy();

    const candidateUrl = new URL(readHref!, 'http://localhost');
    const selectedVerse = candidateUrl.searchParams.get('verse');
    const selectedReader = candidateUrl.searchParams.get('reader');
    expect(selectedVerse).toMatch(/^verse-\d{3}-\d{3}$/);
    expect(selectedReader).toBeTruthy();

    await page.goto(readHref!);
    await expect(page.locator('#qr-load')).toBeEnabled();
    await expect(page.locator('#qr-passage-title')).toHaveText(selectedVerse!);
    await expect(page.locator('#qr-verse')).toHaveValue(selectedVerse!);
    await expect(page.locator('#qr-reader')).toHaveValue(selectedReader!);
    await expect(page.locator('#qr-arabic')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('#qr-arabic')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('#qr-arabic')).not.toBeEmpty();

    const variantLink = page.locator('#qr-records .qr-record').first().getByRole('link', { name: 'Open in Variant Index' });
    const variantHref = await variantLink.getAttribute('href');
    expect(variantHref).toBeTruthy();
    const variantUrl = new URL(variantHref!, 'http://localhost');
    expect(variantUrl.searchParams.get('verse')).toBe(selectedVerse);
    expect(variantUrl.searchParams.get('reader')).toBe(selectedReader);
    expect(variantUrl.hash).toMatch(/^#variant_/);

    await page.goto(variantHref!);
    const linkedRecord = page.locator(variantUrl.hash);
    await expect(linkedRecord).toBeVisible();
    const linkedCandidates = linkedRecord.locator('.qv-record__alignments');
    await expect(linkedCandidates).toHaveCount(1);
    await linkedCandidates.locator('summary').click();
    const returnLink = linkedCandidates.getByRole('link', { name: /Read & Compare/ });
    await returnLink.click();
    await expect(page).toHaveURL(new RegExp(`verse=${selectedVerse}.*reader=${encodeURIComponent(selectedReader!)}`));
    await expect(page.locator('#qr-verse')).toHaveValue(selectedVerse!);
    await expect(page.locator('#qr-reader')).toHaveValue(selectedReader!);
  });

  test('Read & Compare print view keeps the selected source passage and its citations', async ({ page }) => {
    await page.goto('/projects/quran/read/?verse=verse-020-040');
    await expect(page.locator('#qr-load')).toBeEnabled();
    await expect(page.locator('#qr-passage-title')).toHaveText('verse-020-040');
    await expect(page.locator('#qr-records .qr-record').first()).toBeVisible();
    const releaseText = await page.evaluate(async () => {
      const verseId = 'verse-020-040';
      const option = document.querySelector<HTMLOptionElement>(`#qr-verse option[value="${verseId}"]`);
      const manifest = await fetch('/data/quran/manifest.json').then((response) => response.json()) as { releaseId: string };
      if (!option?.dataset.shard) return null;
      const payload = await fetch(`/data/quran/releases/${manifest.releaseId}/${option.dataset.shard}`)
        .then((response) => response.json()) as { records: Array<{ verseNativeId: string; exactText: string }> };
      return payload.records.find((record) => record.verseNativeId === verseId)?.exactText ?? null;
    });
    expect(await page.locator('#qr-arabic').textContent()).toBe(releaseText);
    expect(releaseText).not.toBeNull();
    await expect(page.locator('#qr-arabic')).toHaveCSS('white-space', 'pre-wrap');
    await expect(page.locator('#qr-arabic-reading')).toHaveAttribute('data-transform-profile', 'quran-whitespace-collapse/1.0.0');
    await expect(page.locator('#qr-arabic-reading')).toHaveText(releaseText!.replace(/\s+/gu, ' ').trim());

    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await expect(page.locator('.qr-reading-format')).toHaveAttribute('open', '');
    await expect(page.locator('#qr-arabic-reading')).toBeVisible();
    await expect(page.locator('.qr-crumbs')).toBeHidden();
    await expect(page.locator('.qr-picker')).toBeHidden();
    await expect(page.locator('#site-footer')).toBeHidden();
    await expect(page.locator('#qr-passage-title')).toBeVisible();
    await expect(page.locator('#qr-arabic')).toBeVisible();
    await expect(page.locator('.qr-word-source-label')).toBeVisible();
    await expect(page.locator('#qr-verse-source')).toBeVisible();
    await expect(page.locator('#qr-records .qr-record').first().getByRole('link', { name: 'Open source record line ↗' })).toBeVisible();
    await page.screenshot({ path: 'test-results/quran-read-print-review.png', fullPage: true });

    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await expect(page.locator('.qr-reading-format')).not.toHaveAttribute('open', '');
    await page.emulateMedia({ media: 'screen' });
    await expect(page.locator('.qr-picker')).toBeVisible();
  });

  test('concordance shows pinned interface labels beside exact field codes and values', async ({ page }) => {
    await page.goto('/projects/quran/concordance/');
    await page.getByLabel('Source file', { exact: true }).selectOption('concordance-sura001.json');
    await page.getByRole('button', { name: 'Load source file' }).click();
    const record = page.locator('.qcn-record').first();
    await expect(record.locator('.qcn-comparison').getByText('word (word_rafi_talmon)', { exact: true })).toBeVisible();
    await expect(record.locator('.qcn-comparison').getByText('Corpus Coranicum transcription (word_corpus_coranicum)', { exact: true })).toBeVisible();
    await expect(record.locator('.qcn-comparison').getByText('bi-sm-i', { exact: true })).toBeVisible();
    await expect(record.locator('.qcn-comparison').getByText('bi-smi', { exact: true })).toBeVisible();
    await expect(record.getByRole('link', { name: 'Open source TEI line ↗' })).toHaveAttribute('href', /sura001\.xml#L87$/);
    await record.locator('summary').click();
    await expect(record.locator('.qcn-fields').getByText('word_number', { exact: true })).toBeVisible();
    await expect(record.locator('.qcn-fields').getByText('analysis_number', { exact: true })).toBeVisible();
    await expect(record.locator('.qcn-fields').getByText('modality (analyse_mortality)', { exact: true })).toBeVisible();
    await expect(record.locator('.qcn-fields').getByText('Triptotic', { exact: true })).toBeVisible();
  });

  test('bibliography keys remain exact, searchable, and unresolved without local records', async ({ page }) => {
    await page.goto('/projects/quran/relationships/?type=source_bibliographic_key_reference&q=zotero-4HR2RHA3');
    await expect(page.locator('#qrg-type')).toHaveValue('source_bibliographic_key_reference');
    await expect(page.locator('#qrg-status')).toContainText('records match');
    const entry = page.locator('.qrg-entry').first();
    await expect(entry).toContainText('TEI bibliographic citation key');
    await expect(entry).toContainText('Source key · record unresolved');
    await expect(entry).toContainText('zotero-4HR2RHA3');
    await expect(entry).toContainText('Jeffery 1937: 21');
    await expect(entry).toContainText('local bibliography record remains unresolved');
    await expect(entry.getByRole('link', { name: 'Open Zotero item-key URL ↗' }))
      .toHaveAttribute('href', 'https://www.zotero.org/groups/corpuscoranicum_pub/items/itemKey/4HR2RHA3');
    const sourceLink = entry.getByRole('link', { name: 'Open exact TEI source line ↗' });
    await expect(sourceLink).toHaveAttribute(
      'href',
      /^https:\/\/github\.com\/telota\/corpus-coranicum-tei\/blob\/57cb2b7be321ecfba100cb5f7988974f47864a14\/data\/quran_commentary\/sura-00001\.xml#L\d+$/
    );
  });

  test('malformed Zotero bibliography keys stay exact and unlinked', async ({ page }) => {
    await page.goto('/projects/quran/relationships/?type=source_bibliographic_key_reference&q=zotero-R7C4TX%22');
    await expect(page.locator('#qrg-status')).toContainText('1 of');
    const entry = page.locator('.qrg-entry').first();
    await expect(entry).toContainText('zotero-R7C4TX');
    await expect(entry).toContainText('does not match the documented eight-character Zotero key form');
    await expect(entry.getByRole('link', { name: 'Open Zotero item-key URL ↗' })).toHaveCount(0);
    await expect(entry.getByRole('link', { name: 'Open exact TEI source line ↗' })).toBeVisible();
  });

  test('publisher-coded TUK references link only to exact pinned intertext records', async ({ page }) => {
    await page.goto('/projects/quran/relationships/?type=source_explicit_tei_reference&q=%23TUK909');
    await expect(page.locator('#qrg-status')).toContainText('2 of');
    const resolved = page.locator('.qrg-entry').first();
    await expect(resolved.locator('code').filter({ hasText: '#TUK909' })).toBeVisible();
    const intertextLink = resolved.getByRole('link', { name: 'Open source-linked intertext record ↗' });
    await expect(intertextLink).toHaveAttribute('href', '/projects/quran/intertexts/?record=tuk_909');
    await intertextLink.click();
    await expect(page).toHaveURL(/\/projects\/quran\/intertexts\/\?record=tuk_909$/);
    await expect(page.locator('#qix-status')).toHaveText('Exact source record tuk_909 found in the pinned catalog.');
    await expect(page.locator('.qix-entry')).toHaveCount(1);
    await expect(page.locator('.qix-entry').first()).toContainText('Native msDesc ID: tuk_909');

    await page.goto('/projects/quran/relationships/?type=source_explicit_tei_reference&q=%23TUK501');
    const missing = page.locator('.qrg-entry').first();
    await expect(missing).toContainText('#TUK501');
    await expect(missing.getByRole('link', { name: 'Open source-linked intertext record ↗' })).toHaveCount(0);

    await page.goto('/projects/quran/relationships/?type=source_explicit_tei_reference&q=Nr.%20181');
    const malformed = page.locator('.qrg-entry').first();
    await expect(malformed).toContainText('exact target #TUK');
    await expect(malformed.getByRole('link', { name: 'Open source-linked intertext record ↗' })).toHaveCount(0);
  });

  test('Methods & Data identifies the active immutable data release', async ({ page }) => {
    await page.goto('/projects/quran/methods/');
    await expect(page.getByText(`Current data release: ${activeReleaseId}`)).toBeVisible();
  });
});

test('Quran routes prerender their structural shell without local release assets', async ({ page }) => {
  for (const route of quranRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('main'), route).toHaveCount(1);
  }
});

test.describe('Quran sura page: qirāʾāt display (al-Fātiḥa, the five-book pilot)', () => {
  test('links each numbered word in the passage to a position that lists its readings', async ({ page }) => {
    await page.goto('/projects/quran/sura/1/');
    await expect(page.locator('.pos')).toHaveCount(5);

    const hrefs = await page.locator('a.w').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) await expect(page.locator(href as string)).toHaveCount(1);

    for (const card of await page.locator('.card').all()) await expect(card.locator('.card__who')).not.toBeEmpty();
  });

  test('the collation shows every transmitter at every position with a name for each tile', async ({ page }) => {
    await page.goto('/projects/quran/sura/1/');
    await expect(page.locator('.m-row')).toHaveCount(20);
    await expect(page.locator('.matrix .tile')).toHaveCount(100);
    const unnamed = await page.locator('.matrix .tile').evaluateAll((tiles) => tiles.filter((tile) => !tile.getAttribute('aria-label')).length);
    expect(unnamed).toBe(0);
  });

  test('marks Arabic with a language and never displays a grade', async ({ page }) => {
    await page.goto('/projects/quran/sura/1/');
    const unmarked = await page.locator('.qq *').evaluateAll((nodes) =>
      nodes.filter((node) => node.children.length === 0 && /[؀-ۿ]/u.test(node.textContent ?? '') && !node.closest('[lang="ar"]')).length
    );
    expect(unmarked).toBe(0);
    const text = (await page.locator('main').textContent())?.toLowerCase() ?? '';
    expect(text).not.toMatch(/ṣaḥīḥ|sahih|ḍaʿīf|daif|reliab|authentic|trustworth|weak/u);
  });

  test('reader focus works with scripting disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/projects/quran/sura/1/');

    const visibleCards = async () => {
      const cards = page.locator('.card');
      let count = 0;
      for (let index = 0; index < (await cards.count()); index += 1) if (await cards.nth(index).isVisible()) count += 1;
      return count;
    };

    const all = await visibleCards();
    await page.locator('label:has(#qq-r-yaqub)').click();
    const focused = await visibleCards();
    expect(focused).toBeGreaterThan(0);
    expect(focused).toBeLessThan(all);
    expect(await page.locator('.card').evaluateAll((cards) =>
      cards.filter((card) => getComputedStyle(card).display !== 'none' && !(card.getAttribute('data-qaris') ?? '').split(' ').includes('yaqub')).length
    )).toBe(0);

    await page.locator('label:has(#qq-r-all)').click();
    expect(await visibleCards()).toBe(all);
    await context.close();
  });
});

test.describe('Quran hub and long suras', () => {
  const index = JSON.parse(readFileSync('src/data/qiraat/index.json', 'utf8')) as {
    suras_with_data: number;
    suras: { sura: number; positions: number }[];
  };

  test('the hub lists all 114 suras and links exactly the extracted ones', async ({ page }) => {
    await page.goto('/projects/quran/');
    await expect(page.locator('.grid .cell')).toHaveCount(114);
    await expect(page.locator('.grid .cell > a')).toHaveCount(index.suras_with_data);
    for (const entry of index.suras.slice(0, 5)) {
      await expect(page.locator(`.grid a[href="/projects/quran/sura/${entry.sura}/"]`)).toHaveCount(1);
    }
    const text = (await page.locator('main').textContent())?.toLowerCase() ?? '';
    expect(text).not.toMatch(/ṣaḥīḥ|sahih|ḍaʿīf|daif|reliab|authentic|trustworth/u);
  });

  test('every sura without a page says what the books say, quoted from the page', async ({ page }) => {
    const silent = JSON.parse(readFileSync('src/data/qiraat/silent-suras.json', 'utf8')) as {
      suras: Record<string, { status: string; quotes: { quote: string; page: string }[] }>;
    };
    const numbers = Object.keys(silent.suras).map(Number);
    const withData = new Set(index.suras.map((entry) => entry.sura));
    for (const n of numbers) expect(withData.has(n)).toBe(false);
    await page.goto('/projects/quran/');
    await expect(page.locator('#silent .silent > li')).toHaveCount(numbers.length);
    // No cell claims "Not extracted yet" for a sura the books have spoken about.
    const off = await page.locator('.cell--off .cell__meta').allTextContents();
    expect(off.filter((text) => /Not extracted yet/.test(text)).length).toBe(114 - index.suras_with_data - numbers.length);
    const quotes = await page.locator('#silent blockquote[lang="ar"]').count();
    expect(quotes).toBe(Object.values(silent.suras).reduce((sum, entry) => sum + entry.quotes.length, 0));
  });

  const parts = (sura: number) => splitParts(JSON.parse(readFileSync(`src/data/qiraat/sura-${String(sura).padStart(3, '0')}.json`, 'utf8')).features);

  test('a long sura opens on an overview and lists every part, with no position blocks', async ({ page }) => {
    const sura2 = index.suras.find((entry) => entry.sura === 2)!;
    const spans = parts(2);
    expect(spans.length).toBeGreaterThan(1);
    expect(spans.reduce((sum, span) => sum + (span.end - span.start), 0)).toBe(sura2.positions);
    await page.goto('/projects/quran/sura/2/');
    await expect(page.locator('.pos')).toHaveCount(0);
    await expect(page.locator('.part')).toHaveCount(spans.length);
    await expect(page.locator('.ov__row')).toHaveCount(20);
    const unmarked = await page.locator('.qq *').evaluateAll((nodes) =>
      nodes.filter((node) => node.children.length === 0 && /[؀-ۿ]/u.test(node.textContent ?? '') && !node.closest('[lang="ar"]')).length
    );
    expect(unmarked).toBe(0);
  });

  test('each part shows its own positions under their global numbers and never splits a verse', async ({ page }) => {
    const spans = parts(2);
    const seen = new Set<string>();
    for (const span of spans) {
      await page.goto(`/projects/quran/sura/2/part/${span.index}/`);
      await expect(page.locator('.pos')).toHaveCount(span.end - span.start);
      const ids = await page.locator('.pos').evaluateAll((nodes) => nodes.map((node) => node.id));
      for (const id of ids) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
      const first = await page.locator('.pos .disc--lg').first().textContent();
      expect(Number(first)).toBe(span.start + 1);
      const refs = await page.locator('.pos__no').allTextContents();
      const verses = refs.map((ref) => Number(/2:(\d+)/.exec(ref)![1]));
      expect(Math.min(...verses)).toBeGreaterThanOrEqual(span.firstVerse);
      expect(Math.max(...verses)).toBeLessThanOrEqual(span.lastVerse);
    }
    expect(seen.size).toBe(index.suras.find((entry) => entry.sura === 2)!.positions);
  });

  test('every extracted sura page resolves and every position has a reader for each card', async ({ page }) => {
    // This audit visits every generated page across six suras in one test.
    // Keep it within the suite timeout on slower CI runners.
    test.setTimeout(240_000);
    for (const entry of index.suras.slice(0, 6)) {
      const spans = parts(entry.sura);
      const urls = spans.length > 0 ? spans.map((span) => `/projects/quran/sura/${entry.sura}/part/${span.index}/`) : [`/projects/quran/sura/${entry.sura}/`];
      let count = 0;
      for (const url of urls) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        count += await page.locator('.pos').count();
        for (const card of await page.locator('.card').all()) await expect(card.locator('.card__who')).not.toBeEmpty();
      }
      expect(count).toBe(entry.positions);
    }
  });

  test('permitted ways of beginning a word are listed with the reports and name the transmitter', async ({ page }) => {
    await page.goto('/projects/quran/sura/53/part/1/');
    const position = page.locator('.pos', { hasText: 'عادا' }).first();
    const summary = position.locator('details.reports > summary');
    await expect(summary).toContainText('permitted');
    await summary.click();
    const rows = position.locator('details.reports li .quotes__ref');
    await expect(rows.first()).toContainText('The book permits this as a way of beginning the word');
    await expect(position.locator('details.reports')).toContainText('Nāfiʿ (Qālūn)');
  });

  test('a position whose printed sentence leaves out a reader that other books name says so', async ({ page }) => {
    const spans = parts(12);
    const span = spans.find((candidate) => candidate.firstVerse <= 62 && candidate.lastVerse >= 62);
    await page.goto(span ? `/projects/quran/sura/12/part/${span.index}/` : '/projects/quran/sura/12/');
    const position = page.locator('.pos', { hasText: 'لفتيانه' }).first();
    await expect(position).toContainText('an-Nashr');
    await expect(position).toContainText('al-Kisāʾī');
  });

  test('routes named below the transmitters are quoted, marked as not entered, and their narrators marked as Arabic', async ({ page }) => {
    const spans = parts(3);
    const span = spans.find((candidate) => candidate.firstVerse <= 66 && candidate.lastVerse >= 66);
    await page.goto(span ? `/projects/quran/sura/3/part/${span.index}/` : '/projects/quran/sura/3/');
    const routes = page.locator('.pos', { hasText: 'ها أنتم' }).first().locator('details.routes');
    await expect(routes).toContainText('not entered as readings');
    await routes.locator('summary').click();
    await expect(routes.locator('blockquote').first()).toBeVisible();
    expect(await routes.locator('bdi[lang="ar"]').count()).toBeGreaterThan(0);
  });

  test('a hand-read route names the narrator, the transmitter it runs under and the form, as printed', async ({ page }) => {
    const spans = parts(18);
    const span = spans.find((candidate) => candidate.firstVerse <= 16 && candidate.lastVerse >= 16);
    await page.goto(span ? `/projects/quran/sura/18/part/${span.index}/` : '/projects/quran/sura/18/');
    const routes = page.locator('.pos', { hasText: 'مرفقا' }).first().locator('details.routes', { hasText: 'Routes read below the transmitters' });
    await expect(routes).toContainText('Routes read below the transmitters');
    await routes.locator('summary').click();
    await expect(routes.locator('bdi[lang="ar"]', { hasText: 'الأعشى' }).first()).toBeVisible();
    await expect(routes).toContainText('بفتح الميم وكسر الفاء');
  });
});

test.describe('Quran page: transmission diagram', () => {
  const transmission = JSON.parse(readFileSync('src/data/quran-transmission.json', 'utf8')) as {
    persons: { id: string }[];
    edges: { student: string; teacher: string; witnesses: unknown[] }[];
  };

  test('every reader and transmitter reaches the Prophet through the links', () => {
    const teachers = new Map<string, string[]>();
    for (const edge of transmission.edges) teachers.set(edge.student, [...(teachers.get(edge.student) ?? []), edge.teacher]);
    const reaches = (id: string, seen = new Set<string>()): boolean => {
      if (id === 'prophet') return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return (teachers.get(id) ?? []).some((next) => reaches(next, seen));
    };
    const named = ['nafi', 'abu_jafar', 'abu_amr', 'yaqub', 'asim', 'hamza', 'khalaf_ashir', 'kisai', 'ibn_amir', 'ibn_kathir',
      'warsh', 'qalun', 'ibn_wardan', 'ibn_jammaz', 'duri_abu_amr', 'susi', 'ruways', 'rawh', 'shuba', 'hafs',
      'khalaf_hamza', 'khallad', 'ishaq', 'idris', 'abu_harith', 'duri_kisai', 'hisham', 'ibn_dhakwan', 'bazzi', 'qunbul'];
    expect(named.filter((id) => !reaches(id))).toEqual([]);
    expect(transmission.edges.every((edge) => edge.witnesses.length > 0)).toBe(true);
  });

  test('draws every person and link and gives each link a quoted source in the list', async ({ page }) => {
    await page.goto('/projects/quran/transmission/');
    await expect(page.locator('.board__person')).toHaveCount(transmission.persons.length);
    await expect(page.locator('.board__teacher')).toHaveCount(transmission.edges.length);
    const blocks = await page.locator('.lk').count();
    expect(blocks).toBeGreaterThan(0);
    await expect(page.locator('.lk__list > li')).toHaveCount(transmission.edges.length);
    const hrefs = await page.locator('.board__name[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    for (const href of hrefs.slice(0, 12)) await expect(page.locator(href as string)).toHaveCount(1);
  });

  test('following one reader narrows the diagram to his line', async ({ page }) => {
    await page.goto('/projects/quran/transmission/');
    const visible = (selector: string) =>
      page.locator(selector).evaluateAll((nodes) => nodes.filter((n) => getComputedStyle(n).display !== 'none').length);
    const select = page.locator('#tx-reader-select');
    await expect(select).toBeVisible();
    await select.selectOption('nafi');
    const nafi = await visible('.board__person');
    expect(nafi).toBeGreaterThan(5);
    expect(nafi).toBeLessThan(transmission.persons.length);
    await select.selectOption('ibn_kathir');
    expect(await visible('.board__person')).toBeGreaterThan(5);
    expect(await visible('.board__person[data-person-id="warsh"]')).toBe(0);
  });

  test('with scripting off every chain is shown and no dead control is offered', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/projects/quran/transmission/');
    await expect(page.locator('#tx-reader-select')).toBeHidden();
    const shown = await page.locator('.board__person').evaluateAll((nodes) => nodes.filter((n) => getComputedStyle(n).display !== 'none').length);
    expect(shown).toBe(transmission.persons.length);
    await context.close();
  });

  test('marks Arabic with a language and never displays a grade', async ({ page }) => {
    await page.goto('/projects/quran/transmission/');
    const unmarked = await page.locator('.tx .lk *, .tx .chip *').evaluateAll((nodes) =>
      nodes.filter((node) => node.children.length === 0 && /[؀-ۿ]/u.test(node.textContent ?? '') && !node.closest('[lang="ar"]')).length
    );
    expect(unmarked).toBe(0);
    const text = (await page.locator('main').textContent())?.toLowerCase() ?? '';
    expect(text).not.toMatch(/ṣaḥīḥ|sahih|ḍaʿīf|daif|reliab|authentic|trustworth|weak/u);
  });
});

test.describe('Quran general rules', () => {
  const rules = JSON.parse(readFileSync('src/data/qiraat/rules.json', 'utf8')) as {
    counts: { rules: number; chapters: number; claims: number };
    chapters: { title_ar: string; rules: { id: string; groups: { claims?: { quote: string }[] }[]; reports?: { quote: string }[] }[] }[];
  };

  test('the rules page shows every chapter and every rule, with Arabic marked as Arabic', async ({ page }) => {
    await page.goto('/projects/quran/rules/');
    await expect(page.locator('.toc li')).toHaveCount(rules.counts.chapters);
    await expect(page.locator('article.pos')).toHaveCount(rules.counts.rules);
    const unmarked = await page.locator('main *').evaluateAll((nodes) =>
      nodes.filter((node) => node.children.length === 0 && /[؀-ۿ]/u.test(node.textContent ?? '') && !node.closest('[lang="ar"]')).length
    );
    expect(unmarked).toBe(0);
    const text = (await page.locator('main').textContent())?.toLowerCase() ?? '';
    expect(text).not.toMatch(/ṣaḥīḥ|sahih|ḍaʿīf|daif|reliab|authentic|trustworth/u);
  });

  test('every quotation on the rules page is present in the data built from the checked batches', async ({ page }) => {
    await page.goto('/projects/quran/rules/');
    const built = new Set(rules.chapters.flatMap((chapter) => chapter.rules.flatMap((rule) => [
      ...rule.groups.flatMap((group) => (group.claims ?? []).map((claim) => claim.quote)),
      ...(rule.reports ?? []).map((report) => report.quote),
    ])));
    const shown = await page.locator('article.pos blockquote.quotes__ar').allTextContents();
    expect(shown.length).toBeGreaterThan(0);
    const missing = shown.filter((quote) => !built.has(quote.trim()));
    expect(missing.slice(0, 2).map((quote) => JSON.stringify(quote))).toEqual([]);
  });
});
