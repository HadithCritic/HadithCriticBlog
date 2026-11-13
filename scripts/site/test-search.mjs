// End-to-end test of the built Pagefind index in Node.
// Shims fetch to read dist/ files so /pagefind/pagefind.js works outside a browser.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = path.resolve(process.cwd(), 'dist');

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  let url = String(input instanceof Request ? input.url : input);
  if (url.startsWith('file://')) {
    // strip query params pagefind appends for cache busting
    const clean = decodeURIComponent(new URL(url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
    const buf = await readFile(clean);
    return new Response(buf, { status: 200 });
  }
  return realFetch(input, init);
};

const mod = await import(pathToFileURL(path.join(DIST, 'pagefind', 'pagefind.js')).href);
await mod.options({ excerptLength: 30 });
mod.init();

function normalizeArabic(s) {
  return s
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه');
}

async function trySearch(label, q, filters) {
  const t = Date.now();
  const res = await mod.search(q, filters ? { filters } : undefined);
  const ms = Date.now() - t;
  console.log('==', label, '->', res.results.length, 'pages in', ms + 'ms');
  if (res.results.length) {
    const data = await res.results[0].data();
    const sub = (data.sub_results || []).find((s) => s.url.includes('#h')) || data;
    console.log('   top:', (data.meta && data.meta.collection) || '?', '|', sub.title || data.meta.title);
    console.log('   url:', sub.url);
    console.log('   excerpt:', (sub.excerpt || '').slice(0, 220));
  }
}

await trySearch('english: intentions', 'deeds intentions');
await trySearch('english: black banners', 'black banners khurasan');
await trySearch('arabic bare: الاعمال بالنيات', normalizeArabic('الأعمال بالنيات'));
await trySearch('arabic bare: حدثنا', normalizeArabic('حدثنا'));
await trySearch('arabic vocalised input: إِنَّمَا الأَعْمَالُ', normalizeArabic('إِنَّمَا الأَعْمَالُ'));
await trySearch('filtered: zakat in Muwatta', 'zakat', { collection: ['Muwaṭṭaʾ Mālik'] });
console.log('done');
process.exit(0);
