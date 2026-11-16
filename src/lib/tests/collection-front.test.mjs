/**
 * Every collection front page is read out of its collection.html. These
 * checks run the reader over every file that has a design of its own, so a
 * rebuilt or hand-edited page that loses a part fails here, not in print.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCollectionHtml, GENERIC_LEDE } from '../collection-front.ts';
import { COLLECTION_IDENTITIES } from '../../data/hadith/collection-identities.ts';

const pageFor = (slug) => `src/data/hadith/pages/${slug}/collection.html`;
const designed = Object.keys(COLLECTION_IDENTITIES).filter((slug) => fs.existsSync(pageFor(slug)));

test('every designed chapter collection has a collection.html', () => {
  assert.ok(designed.length >= 25, `only ${designed.length} designed collections have a collection.html`);
});

for (const slug of designed) {
  test(`${slug}: the front page parts are all read`, () => {
    const front = parseCollectionHtml(slug, fs.readFileSync(pageFor(slug), 'utf8'));
    assert.ok(front.titleHtml.length > 3);
    assert.ok(front.compiler.length > 3);
    assert.match(front.beginHref, new RegExp(`^/hadith/collection/${slug}/`));
    assert.equal(front.exploreHref, '#chapters');
    assert.match(front.indexHtml, /^<section id="chapters"[\s\S]*<\/section>$/);
    assert.ok((front.indexHtml.match(/data-filter-row/g) ?? []).length > 0, 'index has no rows');
    assert.ok(front.notes.length > 0);
    assert.ok(front.scripts.some((script) => script.includes('data-filter-input')), 'index filter script missing');
    const identity = COLLECTION_IDENTITIES[slug];
    if (GENERIC_LEDE.test(front.lede)) assert.ok(identity.lede, 'generic hero sentence and no lede of its own');
  });
}

test('the reader rejects a page without its hero', () => {
  assert.throws(() => parseCollectionHtml('broken', '<section id="chapters"></section>'), /broken: collection.html has no hero/);
});
