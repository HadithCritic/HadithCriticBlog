/**
 * Everything the cards print, read from committed sources. Each figure is the
 * same one the matching page prints from the same file.
 */

import fs from 'node:fs';
import path from 'node:path';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export function loadData() {
  const suraNames = readJson('src/data/quran/quran-sura-names.json');
  const graph = readJson('src/data/research/research-graph.json');
  const verses = readJson('src/data/quran/quran-verses.json');

  return {
    library: loadLibrary(),
    articles: loadArticles(),
    tafsir: { suras: suraNames.length, verses: suraNames.reduce((sum, s) => sum + s.verses, 0), opening: verses['1:1'] },
    atlas: loadAtlas(graph),
    icma: loadIcma()
  };
}

/** Front matter of every published article, newest first. */
function loadArticles() {
  const root = 'src/content/articles';
  const files = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (/\.mdx?$/.test(name)) files.push(full);
    }
  };
  walk(root);

  const field = (head, key) => {
    const m = head.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    if (!m) return null;
    return m[1].trim().replace(/^["']|["']$/g, '');
  };

  return files
    .map((file) => {
      const head = fs.readFileSync(file, 'utf8').split(/^---\s*$/m)[1] ?? '';
      const id = path.relative(root, file).replace(/\\/g, '/').replace(/\.mdx?$/, '');
      return {
        id,
        title: field(head, 'title'),
        category: field(head, 'category'),
        date: new Date(field(head, 'date')),
        draft: field(head, 'draft') === 'true',
        preview: field(head, 'preview') === 'true'
      };
    })
    .filter((a) => a.title && !a.draft && !a.preview)
    .sort((a, b) => b.date - a.date);
}

/**
 * The /hadith library, counted the way src/lib/hadith-library.ts and
 * src/lib/collection-units.ts count it: each collection's chapter index, less
 * "sections" entries, with the same fixed figures for the editions without one.
 */
function loadLibrary() {
  const NARRATION_COUNTS = { 'birr-al-walidayn': 78 };
  const FIXED_COUNTS = { 'sahifat-hammam-ibn-munabbih': 137, 'fada-il-makka': 7 };
  const shamail = { slug: 'al-shama-il-al-muhammadiyah', title_en: "Al-Shama'il al-Muhammadiyah", title_ar: 'الشمائل المحمدية' };
  const count = (slug) => {
    if (NARRATION_COUNTS[slug]) return NARRATION_COUNTS[slug];
    const index = path.join('src/data/hadith/pages', slug, 'chapter-index.json');
    if (!fs.existsSync(index)) return FIXED_COUNTS[slug];
    return readJson(index).filter((entry) => entry.unit !== 'sections').reduce((sum, entry) => sum + entry.count, 0);
  };
  const collections = [shamail, ...readJson('src/data/hadith/reader-editions.json')]
    .map((edition) => ({ ...edition, hadith_count: count(edition.slug) }));
  return { collections, narrations: collections.reduce((sum, book) => sum + book.hadith_count, 0) };
}

function loadAtlas(graph) {
  const decades = new Map();
  for (const work of graph.works) {
    if (!work.year) continue;
    const decade = Math.floor(work.year / 10) * 10;
    decades.set(decade, (decades.get(decade) ?? 0) + 1);
  }
  return {
    works: graph.works.length,
    scholars: graph.scholars.length,
    citations: graph.edges.filter((e) => e.type === 'cites').length,
    decades: [...decades.entries()].sort((a, b) => a[0] - b[0])
  };
}

/** Study families and counts, parsed from the two TypeScript data files. */
function loadIcma() {
  const familiesSrc = fs.readFileSync('src/data/research/icma-families.ts', 'utf8');
  const families = {};
  for (const m of familiesSrc.matchAll(/'?([a-z-]+)'?: \{ label: '([^']+)', bg: '(#[0-9a-f]{6})'/g)) {
    families[m[1]] = { label: m[2], bg: m[3], count: 0 };
  }
  const studiesSrc = fs.readFileSync('src/data/research/academic-studies.ts', 'utf8');
  const icmaSlugs = [...studiesSrc.matchAll(/"slug":\s*"([^"]+)"[\s\S]*?"category":\s*"([a-z-]+)"/g)]
    .filter((m) => m[2] === 'icma')
    .map((m) => m[1]);
  const familyOf = Object.fromEntries([...familiesSrc.matchAll(/'([^']+)': '([a-z-]+)',?/g)].map((m) => [m[1], m[2]]));
  for (const slug of icmaSlugs) {
    const family = families[familyOf[slug] ?? 'network'];
    if (family) family.count += 1;
  }
  return {
    studies: icmaSlugs.length,
    families: Object.values(families).filter((f) => f.count > 0).sort((a, b) => b.count - a.count)
  };
}
