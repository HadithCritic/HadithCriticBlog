/**
 * Everything the cards print, read from committed sources so the cards build
 * without the 1.6 GB corpus or a local database. Each figure is the same one
 * the matching page prints from the same file.
 */

import fs from 'node:fs';
import path from 'node:path';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export function loadData() {
  const meta = readJson('src/data/corpus-meta.json');
  const qiraatIndex = readJson('src/data/qiraat/index.json');
  const sura1 = readJson('src/data/qiraat/sura-001.json');
  const suraNames = readJson('src/data/quran-sura-names.json');
  const graph = readJson('src/data/research-graph.json');
  const verses = readJson('src/data/quran-verses.json');

  return {
    meta,
    articles: loadArticles(),
    readers: loadReaders(sura1),
    qiraat: { surasWithData: qiraatIndex.suras_with_data, rules: qiraatIndex.rules?.rules ?? 0 },
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

/** The ten readers in the hub's order, with the swatch hues from qiraat.css. */
function loadReaders(sura1) {
  const css = fs.readFileSync('src/styles/qiraat.css', 'utf8');
  const hue = (id) => {
    const m = css.match(new RegExp(`\\.q-${id} \\{ --d-bg: (#[0-9a-f]{6}); --d-ink: #[0-9a-f]{6}; --s-bg: (#[0-9a-f]{6})`));
    return m ? { deep: m[1], light: m[2] } : { deep: '#555', light: '#999' };
  };
  const order = ['nafi', 'ibn_kathir', 'abu_amr', 'ibn_amir', 'asim', 'hamza', 'kisai', 'abu_jafar', 'yaqub', 'khalaf_ashir'];
  const byId = new Map(sura1.qaris.map((q) => [q.id, q]));
  return order.map((id) => ({ id, name: byId.get(id).display, arabic: byId.get(id).name_ar, ...hue(id) }));
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
  const familiesSrc = fs.readFileSync('src/data/icma-families.ts', 'utf8');
  const families = {};
  for (const m of familiesSrc.matchAll(/'?([a-z-]+)'?: \{ label: '([^']+)', bg: '(#[0-9a-f]{6})'/g)) {
    families[m[1]] = { label: m[2], bg: m[3], count: 0 };
  }
  const studiesSrc = fs.readFileSync('src/data/academic-studies.ts', 'utf8');
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
