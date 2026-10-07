/**
 * Parse the saved Ifta' Sunnah table-of-contents snapshots into
 * data/ifta-toc/<platform book id>.json. Offline: this reads only
 * data/ifta-toc/manifest.json and the raw pages it lists, and refuses a
 * collection whose snapshot is missing or no longer matches its recorded
 * sha256, rather than parsing a page the manifest does not vouch for.
 *
 * Output is a function of the snapshots alone (the date is the top page's
 * recorded fetch date, not today's), so parsing twice writes the same bytes.
 *
 * Usage: node scripts/parse-ifta-toc.mjs [platformBookId ...]
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MANIFEST, TOC_DIR, bookTitle, children, levelUrl, sha256, validSnapshot } from './ifta-toc/common.mjs';

async function snapshot(entry) {
  const bytes = await readFile(path.join(TOC_DIR, entry.file)).catch(() => null);
  if (!bytes) throw new Error(`${entry.file}: missing; run scripts/fetch-ifta-toc.mjs ${entry.book}`);
  if (sha256(bytes) !== entry.sha256) throw new Error(`${entry.file}: sha256 differs from the manifest`);
  const html = bytes.toString('utf8');
  if (!validSnapshot(html, entry.book)) throw new Error(`${entry.file}: not a complete level page`);
  return html;
}

async function parseBook(bookId, pagesByParent) {
  const topEntry = pagesByParent.get(0);
  const top = await snapshot(topEntry);
  const groups = children(top, bookId, 0);
  const levels = await Promise.all(
    groups.map(async (group) => {
      if (group.leaf) return group;
      const entry = pagesByParent.get(group.id);
      if (!entry) throw new Error(`book ${bookId}: no snapshot for node ${group.id}; run scripts/fetch-ifta-toc.mjs ${bookId}`);
      return { ...group, children: children(await snapshot(entry), bookId, group.id) };
    }),
  );
  const payload = {
    schemaVersion: 'ifta-toc/1.0.0',
    source: levelUrl(bookId, 0),
    platformBookId: bookId,
    title: bookTitle(top),
    fetched: topEntry.fetched.slice(0, 10),
    groups: levels,
  };
  await writeFile(path.join(TOC_DIR, `${bookId}.json`), JSON.stringify(payload));
  const bab = levels.reduce((sum, g) => sum + (g.children?.filter((c) => !c.leaf).length ?? 0), 0);
  return `book ${bookId} ${payload.title}: ${levels.length} top-level nodes, ${bab} second-level headings`;
}

async function main() {
  const started = Date.now();
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const byBook = new Map();
  for (const entry of manifest.pages) {
    if (!byBook.has(entry.book)) byBook.set(entry.book, new Map());
    byBook.get(entry.book).set(entry.parent, entry);
  }
  const wanted = process.argv.slice(2).map(Number).filter(Boolean);
  const books = (wanted.length ? wanted : [...byBook.keys()]).filter((id) => byBook.get(id)?.has(0)).sort((a, b) => a - b);
  const results = await Promise.allSettled(books.map((id) => parseBook(id, byBook.get(id))));
  let failed = 0;
  results.forEach((result) => {
    if (result.status === 'fulfilled') console.log(result.value);
    else {
      failed += 1;
      console.error(`failed: ${result.reason.message}`);
    }
  });
  console.log(JSON.stringify({ parsed: books.length - failed, failed, elapsedMs: Date.now() - started }));
  process.exitCode = failed ? 1 : 0;
}

await main();
