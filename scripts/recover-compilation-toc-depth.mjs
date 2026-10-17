/** Recover unrecorded source heading levels, without altering corpus/site data. */
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { children, levelUrl, sha256, validSnapshot } from './ifta-toc/common.mjs';

const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const meta = read('src/data/corpus-meta.json');
const report = read('docs/research/hadith/collection-structure.json');
const file = 'data/ifta-toc/deep-manifest.json';
const manifest = fs.existsSync(file) ? read(file) : { schemaVersion: 'ifta-toc-depth/1.0.0', pages: [] };
const db = new DatabaseSync('dist-db/silsilah.db', { readOnly: true });
const idsByBook = new Map();
for (const r of db.prepare('SELECT id,book_id FROM hadith ORDER BY id').iterate()) {
  if (!idsByBook.has(r.book_id)) idsByBook.set(r.book_id, new Set());
  idsByBook.get(r.book_id).add(r.id);
}
db.close();
fs.mkdirSync('data/ifta-toc/raw/deep', { recursive: true });
const cache = new Map(manifest.pages.map(p => [`${p.book}:${p.parent}`, p]));
const seen = new Set();
let starts = Promise.resolve();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function get(book, parent) {
  const cacheKey = `${book}:${parent}`;
  let p = cache.get(cacheKey);
  if (p && fs.existsSync(`data/ifta-toc/${p.file}`)) {
    const bytes = fs.readFileSync(`data/ifta-toc/${p.file}`);
    if (sha256(bytes) === p.sha256 && validSnapshot(bytes.toString('utf8'), book)) return children(bytes.toString('utf8'), book, parent);
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    starts = starts.then(() => pause(250));
    await starts;
    try {
      const response = await fetch(levelUrl(book, parent), { headers: { 'User-Agent': 'HadithCritic TOC verification (research, low rate)' }, signal: AbortSignal.timeout(45000) });
      const bytes = Buffer.from(await response.arrayBuffer());
      const html = bytes.toString('utf8');
      if (!response.ok || !validSnapshot(html, book)) throw new Error(`HTTP ${response.status}, invalid source page`);
      p = { book, parent, url: levelUrl(book, parent), file: `raw/deep/${book}-${parent}.html`, bytes: bytes.length, sha256: sha256(bytes), fetched: new Date().toISOString() };
      fs.writeFileSync(`data/ifta-toc/${p.file}`, bytes);
      cache.set(cacheKey, p);
      manifest.pages = [...cache.values()].sort((a,b) => a.book-b.book || a.parent-b.parent);
      fs.writeFileSync(`${file}.part`, JSON.stringify(manifest, null, 2));
      fs.renameSync(`${file}.part`, file);
      return children(html, book, parent);
    } catch (error) {
      if (attempt === 4) throw error;
      await pause(2000 * 2 ** attempt);
    }
  }
}
async function limited(tasks) {
  let index = 0;
  // Eight in-flight pages, with the shared 250 ms start gate (at most 4/s).
  await Promise.all(Array.from({ length: 8 }, async () => { while (index < tasks.length) await tasks[index++](); }));
}
const summaries = [];
for (const book of meta.collections) {
  const platformId = report[book.slug].platform_book_id;
  const toc = read(`data/ifta-toc/${platformId}.json`);
  const records = idsByBook.get(book.id);
  const known = new Set(records);
  const nodes = [];
  const add = n => { known.add(n.id); if (!n.leaf) { nodes.push(n); for (const c of n.children || []) add(c); } };
  toc.groups.forEach(add);
  let unknown = [];
  const lo = Math.min(...toc.groups.map(g => g.id));
  const hi = Math.max(...records);
  for (let id = lo; id <= hi; id++) if (!known.has(id)) unknown.push(id);
  let round = 0;
  while (unknown.length) {
    nodes.sort((a,b) => a.id-b.id);
    const parents = new Map();
    for (const id of unknown) {
      let left = 0, right = nodes.length;
      while (left < right) { const mid = (left+right) >>> 1; if (nodes[mid].id < id) left = mid+1; else right = mid; }
      const parent = nodes[left-1];
      if (parent && !seen.has(`${platformId}:${parent.id}`)) parents.set(parent.id, parent);
    }
    if (!parents.size) break;
    console.log(`${book.slug}: depth round ${++round}, ${parents.size} source divisions to inspect, ${unknown.length} unaccounted source IDs`);
    await limited([...parents.values()].map(parent => async () => {
      seen.add(`${platformId}:${parent.id}`);
      const found = await get(platformId, parent.id);
      parent.children = found;
      for (const n of found) { if (!known.has(n.id)) add(n); }
    }));
    unknown = unknown.filter(id => !known.has(id));
  }
  const summary = { slug: book.slug, platformId, additionalPages: manifest.pages.filter(p => p.book === platformId).length, unresolvedSourceIds: unknown.length, unresolvedSamples: unknown.slice(0,20) };
  summaries.push(summary);
  console.log(JSON.stringify(summary));
}
fs.writeFileSync('scratch/compilation-toc-depth-audit.json', JSON.stringify(summaries, null, 2));
fs.mkdirSync('docs/research/hadith', { recursive: true });
fs.writeFileSync('docs/research/hadith/toc-depth-audit.json', JSON.stringify(summaries, null, 2));
console.log(`Recovered source depth; ${manifest.pages.length} additional source pages saved.`);
