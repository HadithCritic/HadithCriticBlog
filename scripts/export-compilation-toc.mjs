/** Export the source TOC, never the site's heuristic/flattened presentation. */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { children, bookTitle, sha256, validSnapshot, levelUrl } from './ifta-toc/common.mjs';
import { chronologicalCollections, COMPILER_DATES } from '../src/lib/collection-catalogue.ts';

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const meta = read('src/data/corpus-meta.json');
const report = read('docs/research/hadith/collection-structure.json');
const manifest = read('data/ifta-toc/manifest.json');
const deepManifest = fs.existsSync('data/ifta-toc/deep-manifest.json') ? read('data/ifta-toc/deep-manifest.json') : { pages: [] };
const dictionary = read('data/kitab-titles-en.json');
const key = text => (text || '').replace(/[ً-ْٰـ]/g, '').replace(/\s+/g, ' ').trim();
const curated = new Map(Object.entries(dictionary).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [key(k), v]));
const db = new DatabaseSync(path.join(root, 'dist-db/silsilah.db'), { readOnly: true });
const corpusEnglish = new Map();
const sharedEnglish = new Map();
const aliases = new Map();
for (const r of db.prepare('SELECT a.surface_norm,n.id,n.name_en FROM narrator_alias a JOIN narrator n ON n.id=a.narrator_id WHERE n.name_en IS NOT NULL AND n.name_en != ?').iterate('')) {
  if (!aliases.has(r.surface_norm)) aliases.set(r.surface_norm, new Map());
  aliases.get(r.surface_norm).set(r.id, r.name_en);
}
for (const row of db.prepare('SELECT book_id, chapter_ar, chapter_en FROM hadith ORDER BY id').iterate()) {
  if (!row.chapter_ar || !row.chapter_en) continue;
  const k = `${row.book_id}:${key(row.chapter_ar)}`;
  if (!corpusEnglish.has(k)) corpusEnglish.set(k, new Set());
  corpusEnglish.get(k).add(row.chapter_en);
  const shared = key(row.chapter_ar);
  if (!sharedEnglish.has(shared)) sharedEnglish.set(shared, new Set());
  sharedEnglish.get(shared).add(row.chapter_en);
}
db.close();

const pages = new Map([...manifest.pages, ...deepManifest.pages].map(p => [`${p.book}:${p.parent}`, p]));
const deepPages = new Map(deepManifest.pages.map(p => [`${p.book}:${p.parent}`, p]));
const checkedPages = new Set();
function snapshot(book, parent) {
  const p = pages.get(`${book}:${parent}`);
  if (!p) throw new Error(`Missing primary-source snapshot ${book}:${parent}`);
  const bytes = fs.readFileSync(path.join(root, 'data/ifta-toc', p.file));
  if (bytes.length !== p.bytes || sha256(bytes) !== p.sha256 || !validSnapshot(bytes.toString('utf8'), book)) {
    throw new Error(`Primary-source snapshot failed validation: ${p.file}`);
  }
  checkedPages.add(p.file);
  return bytes.toString('utf8');
}

const schemas = {
  'muwatta-malik': ['Topical kitāb → topical chapter/heading → reports', 'Topic-oriented Muwattaʾ. Lower headings do not all carry an explicit bāb prefix. The table reproduces this source’s order rather than a different recension’s numbering.'],
  'musannaf-abd-al-razzaq': ['Topical kitāb → bāb or thematic heading → reports', 'Topic-oriented muṣannaf. Include all source divisions and appended material under their actual source labels.'],
  'musannaf-ibn-abi-shaybah': ['Topical kitāb → thematic heading → subsidiary heading where present → reports', 'Topic-oriented muṣannaf. Many lower headings are statements or questions without the word bāb. The 44 root divisions here are this platform’s TOC, distinct from the unpublished 41-boundary alignment pilot described in the repository.'],
  'sahih-al-bukhari': ['Kitāb/thematic division → bāb or sūra heading → subsidiary heading where present → reports', 'Topic-oriented collection with additional Qurʾānic-commentary organization. Sūra labels are retained as source headings, not relabelled uniformly as bābs.'],
  'sunan-ibn-majah': ['Thematic abwāb division → bāb → reports', 'The source’s root headings are principally abwāb (chapter groups), not uniformly titled kitāb.'],
  'sunan-abi-dawud': ['Topical kitāb → bāb → subsidiary heading where present → reports', 'Topic-oriented Sunan; source introductions and nested exceptions are preserved.'],
  'jami-al-tirmidhi': ['Thematic abwāb division → bāb → reports', 'The source labels its main thematic divisions abwāb. Additional concluding divisions retain their source labels.'],
  'sunan-al-nasa-i': ['Topical kitāb → bāb/thematic heading → reports', 'This is the source collection titled Sunan al-Nasāʾī, separately catalogued from al-Sunan al-Kubrā.'],
  'al-sunan-al-kubra': ['Topical kitāb → bāb/thematic heading → subsidiary heading where present → reports', 'Al-Nasāʾī’s al-Sunan al-Kubrā, not al-Bayhaqī’s similarly titled collection and not the separately catalogued Sunan al-Nasāʾī.'],
  'sahih-ibn-khuzaymah': ['Topical kitāb → bāb → subsidiary heading where present → reports', 'Source-presented extant collection: its seven root navigation divisions are not a claim that the original work had only seven books.'],
  'sharh-ma-ani-al-athar': ['Introduction/topical kitāb → bāb of legal discussion → reports/discussion', 'Topic-oriented legal discussion, distinct from the flat problem-oriented chapter sequence of Sharḥ Mushkil al-Āthār.'],
  'sunan-al-daraqutni': ['Topical kitāb → bāb where supplied → reports', 'Topic-oriented Sunan. Some source root divisions lead directly to reports and have no separate lower heading.'],
  'al-mustadrak-ala-al-sahihayn': ['Introduction/topical kitāb → bāb or thematic heading → subsidiary heading where present → reports', 'Topic-oriented collection with nested divisions, including headings concerning named individuals. Those headings do not make the whole work a Companion-based musnad.'],
  'sunan-al-bayhaqi-al-kubra': ['Topical kitāb → bāb → subsidiary heading where present → reports', 'Al-Bayhaqī’s large topical Sunan, distinct from al-Nasāʾī’s al-Sunan al-Kubrā.'],
  'al-matalib-al-aliyah': ['Introduction/topical kitāb → bāb → reports', 'Topic-oriented compilation of reports from musnad sources. The source books are musnads, but this work’s TOC is arranged by topics.'],
  'musnad-ahmad': ['Companion/group → individual Companion or narration heading → reports', 'Grouped musnad: named Companions, household/tribal/regional groups, and women. The lower divisions are not uniformly topical bābs.'],
  'musnad-al-tayalisi': ['Companion/transmission heading → subsidiary transmission heading (where present) → reports', 'Narrator-based musnad. Preserve the source’s second-level headings: the website’s flat presentation omits this level.'],
  'musnad-al-humaydi': ['Companion heading → subsidiary heading (where present) → reports', 'Narrator-based musnad, including collective sections; some divisions have no second-level heading.'],
  'musnad-abd-ibn-humayd': ['Companion heading → reports', 'Single-level narrator-based musnad in this source, not topical kitāb/bāb books.'],
  'musnad-abi-ya-la-al-mawsili': ['Companion heading → subsidiary heading (where present) → reports', 'Narrator-based musnad; most top-level divisions go directly to reports.'],
  'musnad-al-bazzar': ['Companion heading → transmission/narrator heading (where present) → reports', 'Narrator-based musnad. Many lower headings identify who transmitted from the named Companion rather than a legal topic.'],
  'al-ahadith-al-mukhtarah': ['Companion heading → transmission heading (where present) → reports', 'Narrator-based selection. The source groups reports under Companions and subsidiary transmitters.'],
  'al-mu-jam-al-kabir': ['Introduction/Companion or collective heading → subsidiary heading → reports', 'Companion-oriented muʿjam, including introductory and collective sections. Do not interpret the site’s “kitab” shape as a uniformly topical arrangement.'],
  'al-mu-jam-al-awsat': ['Alphabetical letter → given-name group → individual teacher → reports', 'Alphabetical teacher-based muʿjam, not topical books or Companion musnads. The source’s own [description](https://sunna.alifta.gov.sa/Book/Details?bookId=13) confirms the arrangement by teachers’ names.'],
  'al-mu-jam-al-saghir': ['Alphabetical/other division → given-name group → individual teacher (where present) → reports', 'Alphabetical teacher-based muʿjam with additional sections as listed. The [source description](https://sunna.alifta.gov.sa/Book/Details?bookId=14) confirms the teacher arrangement.'],
  'musnad-al-darimi': ['Introduction/topical kitāb → bāb → reports', 'Despite “Musnad” in the catalogue title, the source is organized principally by topics in kitābs and bābs.'],
  'al-muntaqa': ['Topical bāb → reports', 'A flat sequence of topical headings in the source; do not invent a kitāb parent.'],
  'sharh-mushkil-al-athar': ['Introduction/problem-oriented bāb → reports/discussion', 'A flat sequence of headings addressing problematic reports; do not impose topical kitāb groups.'],
  'al-shama-il-al-muhammadiyah': ['Topical bāb → reports', 'A flat sequence of chapters on the Prophet’s characteristics and practices.'],
  'al-marasil-li-abi-dawud': ['Single sequence of kitāb and topical headings → reports', 'Mixed heading labels at one source level. A heading beginning kitāb is not proof that the following source siblings are its nested bābs.'],
  'sahih-ibn-hibban': ['Introduction/topical kitāb → bāb and subsidiary headings → reports', 'This source presents a topical arrangement associated with Ibn Balbān’s rearrangement, confirmed by its [book description](https://sunna.alifta.gov.sa/Book/Details?bookId=10). The website’s 60 top-level divisions are source navigation divisions, not a claim of 60 original compiler-authored kitābs.'],
  'sahih-muslim': ['Introduction/topical kitāb → source-edition bāb → reports', 'The bāb labels below belong to this source presentation. Their presence does not establish that Muslim authored each label.'],
  'sunan-sa-id-ibn-mansur': ['Surviving/source-presented topical kitāb → bāb/section → reports', 'Contents of the corpus’s source only; this does not assert that all volumes of the original compilation survive here.'],
};
const escape = text => String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '&#124;').replace(/\r?\n/g, '<br>');
const arabic = text => `<span lang="ar" dir="rtl">${escape(text)}</span>`;
const counts = { curated: 0, corpus: 0, narrator: 0, missing: 0, ambiguous: 0 };
const missing = [];
const schemaArabic = slug => {
  if (slug === 'al-mu-jam-al-awsat' || slug === 'al-mu-jam-al-saghir') return 'حرف المعجم ← مجموعة الاسم ← الشيخ ← الروايات';
  if (slug === 'musnad-ahmad') return 'صحابي أو مجموعة صحابة ← صحابي أو عنوان رواية ← الروايات';
  if (['musnad-al-tayalisi','musnad-al-humaydi','musnad-abd-ibn-humayd','musnad-abi-ya-la-al-mawsili','musnad-al-bazzar','al-ahadith-al-mukhtarah','al-mu-jam-al-kabir'].includes(slug)) return 'صحابي أو مجموعة ← عنوان فرعي عند وجوده ← الروايات';
  if (slug === 'sharh-mushkil-al-athar') return 'مقدمة أو باب في مشكل الآثار ← الروايات والمناقشة';
  if (slug === 'al-marasil-li-abi-dawud') return 'عناوين كتب وأبواب في مستوى واحد ← الروايات';
  if (slug === 'al-muntaqa' || slug === 'al-shama-il-al-muhammadiyah') return 'باب موضوعي ← الروايات';
  return 'مقدمة أو كتاب موضوعي ← باب أو قسم فرعي ← الروايات';
};
function english(book, node) {
  const k = key(node.title);
  if (curated.has(k)) { counts.curated++; return [escape(curated.get(k)), 'D']; }
  let candidates = [...(corpusEnglish.get(`${book.id}:${k}`) || [])];
  let shared = false;
  if (!candidates.length && sharedEnglish.get(k)?.size === 1) {
    candidates = [...sharedEnglish.get(k)];
    shared = true;
  }
  if (candidates.length) {
    counts.corpus++;
    if (candidates.length > 1) counts.ambiguous++;
    return [candidates.map(escape).join('<br>OR: '), candidates.length > 1 ? 'C, multiple renderings' : shared ? 'C, exact heading in another collection' : 'C'];
  }
  // Identifying gloss only. Never resolve an ambiguous or shortened name.
  const prefix = k.match(/^(مسند|حديث|أحاديث|من حديث)\s+/);
  let name = prefix ? k.slice(prefix[0].length) : k;
  name = name.replace(/(?:عن رسول الله صلى الله عليه وسلم|عن النبي صلى الله عليه وسلم|رضوان الله عليهم أجمعين|رضي الله عنهم أجمعين|رضي الله عنهما|رضي الله عنهم|رضي الله عنهن|رضي الله عنها|رضي الله عنه)/g, '').trim();
  const normalizedName = name.replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[^ء-ي\s]/g,' ').replace(/\s+/g,' ').trim();
  const match = aliases.get(normalizedName);
  if (match?.size === 1) {
    counts.narrator++;
    const lead = prefix?.[1] === 'مسند' ? 'Musnad of ' : prefix ? 'Reports of ' : '';
    return [escape(`${lead}${[...match.values()][0]}`), 'N, identifying gloss'];
  }
  counts.missing++;
  missing.push({ slug: book.slug, id: node.id, ar: node.title });
  return ['No verified English heading available', 'M'];
}

const collections = chronologicalCollections(meta.collections).map(book => {
  const platformId = report[book.slug].platform_book_id;
  const saved = read(`data/ifta-toc/${platformId}.json`);
  const topHtml = snapshot(platformId, 0);
  const top = children(topHtml, platformId, 0);
  if (JSON.stringify(top) !== JSON.stringify(saved.groups.map(({ children, ...g }) => g))) throw new Error(`Parsed root differs: ${book.slug}`);
  if (bookTitle(topHtml) !== saved.title) throw new Error(`Title differs: ${book.slug}`);
  let secondCount = 0;
  for (const g of saved.groups) {
    if (g.leaf) throw new Error(`Unexpected root narration leaf: ${book.slug}:${g.id}`);
    const actual = children(snapshot(platformId, g.id), platformId, g.id);
    if (JSON.stringify(actual) !== JSON.stringify(g.children)) throw new Error(`Parsed child list differs: ${book.slug}:${g.id}`);
    secondCount += actual.filter(c => !c.leaf).length;
  }
  const attach = node => {
    if (node.leaf) return;
    if (deepPages.has(`${platformId}:${node.id}`)) node.children = children(snapshot(platformId, node.id), platformId, node.id);
    for (const c of node.children || []) attach(c);
  };
  saved.groups.forEach(attach);
  const depths = [];
  const seenHeadings = new Set();
  const count = (nodes, depth) => {
    for (const n of nodes.filter(n => !n.leaf)) {
      if (seenHeadings.has(n.id)) throw new Error(`Duplicate/cyclic heading in source tree: ${book.slug}:${n.id}`);
      seenHeadings.add(n.id);
      depths[depth-1] = (depths[depth-1] || 0) + 1;
      count(n.children || [], depth+1);
    }
  };
  count(saved.groups, 1);
  return { book, platformId, saved, secondCount, depths, schema: schemas[book.slug] || ['Introduction/topical kitāb or thematic division → bāb/section → reports', 'Topic-oriented source table of contents. Preserve the actual Arabic heading labels; not every heading is literally called kitāb or bāb.'] };
});

const lines = [
  '# Tables of contents and structural schemas of the 33 hadith compilations', '',
  `Prepared 2026-10-11. Corpus release: \`${meta.corpusVersion}\`. Collections ordered by compiler death year (AH), matching the chronological catalogue.`, '',
  '## Scope and certainty', '',
  'This exports source heading nodes, not a generic table assembled from memory. Arabic headings, order and nesting are preserved from the saved Iftaʾ Sunnah/HadithWeb source. Every raw HTML snapshot used is checked against its recorded SHA-256 and byte length. Original trees are reparsed and compared with their saved snapshots; additional nested levels are recovered from primary-source pages. Narration leaves are excluded from the table of contents. Source node IDs identify headings, not hadith numbers.', '',
  '**Certainty has limits:** this describes the source edition represented by the corpus, not every printed edition or the original compiler’s universal schema. Recovery follows unaccounted IDs in the source’s shared heading/report sequence within the corpus’s ID span; the audit below records any remaining gaps. This is not a claim about lost volumes or material outside that span. Source spellings and apparent mistakes are reproduced, not silently corrected. Mixed or narrator-based divisions are not relabelled as invented kitābs or bābs.', '',
  '**English is not uniformly verified.** D = existing HadithCritic heading-dictionary rendering (not independently re-certified here); C = corpus English attached to the exact matching Arabic heading, unverified and sometimes machine-translated; N = identifying English gloss using a uniquely matching narrator-register alias, not a complete word-for-word translation of the heading or its honorifics; M = no verified English equivalent available. C may contain mistranslations. Multiple C variants are shown rather than selecting a false certainty. No parent receives the English of a different first-child heading. Arabic is authoritative for this export.', '',
  'A known example: the corpus renders **وقوت الصلاة** as “The **virtue of prayer**”. That is not an accurate translation of “prayer times”. This illustrates why C entries must not be treated as certain translations.', '',
  'The detailed tables below deliberately retain the existing English data with explicit provenance. A fully certified bilingual edition would require separate review of every C and M heading; this export does not claim that review occurred.', '',
  'Primary source: [Iftaʾ Sunnah compilation catalogue](https://sunna.alifta.gov.sa/Book/IndexMatnBooks). Snapshot manifests: `data/ifta-toc/manifest.json` and `data/ifta-toc/deep-manifest.json`; original source trees: `data/ifta-toc/<platform ID>.json`; English dictionary: `data/kitab-titles-en.json`; exact-heading English: read-only `dist-db/silsilah.db`.', '',
  '## Structural vocabulary', '',
  'These are explanatory glosses, not a replacement for the source headings.', '',
  '| Arabic label | English meaning | Structural caution |',
  '|---|---|---|',
  '| كتاب | Kitāb: book or major thematic division | Not every root division uses this label. |',
  '| باب / أبواب | Bāb: chapter / abwāb: chapters | Abwāb may name a thematic group; a bāb can occur at different depths. |',
  '| مسند | Musnad: collection of attributed reports | In a heading it often identifies a Companion; a compilation titled Musnad can still have topical organization, as in al-Dārimī. |',
  '| حديث / أحاديث | Report / reports | May identify reports of an individual, not a topical chapter. |',
  '| رواية / ما روى | Transmission / what someone transmitted | Often identifies a transmission subdivision under a Companion or another narrator. |',
  '| باب الألف، باب الباء، إلخ | Alif, Bāʾ, etc.: alphabetical divisions | These may organize names rather than legal subjects. |',
  '| من اسمه… | Those named… | A given-name group can contain individual teacher headings below it. |',
  '| مقدمة | Introduction | Front matter is retained separately when the source lists it. |', '',
  '## Overview', '',
  '| # | Compilation (English) | Compilation (Arabic) | Compiler d. AH | Structural schema (English / Arabic) | Headings by depth |',
  '|---|---|---|---:|---|---|',
];
collections.forEach(({book, depths, schema}, i) => lines.push(`| ${i+1} | [${escape(book.title_en)}](#${book.slug}) | ${arabic(book.title_ar)} | ${COMPILER_DATES[book.slug]} | ${escape(schema[0])}<br>${arabic(schemaArabic(book.slug))} | ${depths.map((n,i) => `L${i+1}: ${n}`).join('; ')} |`));
for (const {book, platformId, saved, depths, schema} of collections) {
  lines.push('', `<a id="${book.slug}"></a>`, '', `## ${book.title_en} / ${book.title_ar}`, '',
    `**Schema:** ${schema[0]}.<br>${arabic(schemaArabic(book.slug))}`, '', schema[1], '',
    `**Primary source:** [source table of contents](${saved.source}), platform compilation ID ${platformId}; original snapshot date ${saved.fetched}; recovered levels dated in the depth manifest. **Headings by depth:** ${depths.map((n,i) => `L${i+1}: ${n}`).join('; ')}. **Corpus reports:** ${book.hadith_count.toLocaleString()}.`, '',
    '### Top-level contents', '', '| # | Arabic source heading | English rendering | Basis | Node ID |', '|---:|---|---|---|---:|');
  for (const [i, g] of saved.groups.entries()) {
    const [en, basis] = english(book, g);
    lines.push(`| ${i+1} | ${arabic(g.title)} | ${en} | ${basis} | ${g.id} |`);
  }
  lines.push('', '### Complete nested contents', '');
  const render = (g, ordinal) => {
    lines.push(`${'#'.repeat(Math.min(6, 3 + ordinal.split('.').length))} ${ordinal}. ${g.title}`, '', `[Source division](${levelUrl(platformId, g.id)}).`, '');
    const headings = (g.children || []).filter(c => !c.leaf);
    if (!headings.length) {
      lines.push('No second-level heading is listed in the captured source tree; this division leads directly to narration leaves.', '');
      return;
    }
    lines.push('| # | Arabic source heading | English rendering | Basis | Node ID |', '|---:|---|---|---|---:|');
    for (const [j, c] of headings.entries()) {
      const [en, basis] = english(book, c);
      lines.push(`| ${ordinal}.${j+1} | ${arabic(c.title)} | ${en} | ${basis} | ${c.id} |`);
    }
    lines.push('');
    headings.forEach((c,j) => { if ((c.children || []).some(n => !n.leaf)) render(c, `${ordinal}.${j+1}`); });
  };
  saved.groups.forEach((g,i) => render(g, String(i+1)));
}
const totalTop = collections.reduce((n, c) => n + c.saved.groups.length, 0);
const totalSecond = collections.reduce((n, c) => n + c.secondCount, 0);
const totalHeadings = collections.reduce((n,c) => n+c.depths.reduce((s,v) => s+v,0),0);
if (counts.curated + counts.corpus + counts.narrator + counts.missing !== totalHeadings) throw new Error('Export omitted or duplicated a heading row');
const depthAudit = fs.existsSync('docs/research/hadith/toc-depth-audit.json') ? read('docs/research/hadith/toc-depth-audit.json') : [];
lines.push('## Export validation', '', `- Collections: ${collections.length}.`, `- Total source headings: ${totalHeadings}.`, `- Top-level source headings: ${totalTop}.`, `- Originally captured second-level source headings: ${totalSecond}.`, `- SHA-256-validated source pages: ${checkedPages.size}.`, `- English provenance: D ${counts.curated}; C ${counts.corpus}; N ${counts.narrator}; M ${counts.missing}; C headings with multiple renderings ${counts.ambiguous}.`, `- Unaccounted source IDs after depth recovery: ${depthAudit.length ? depthAudit.reduce((n,c) => n+c.unresolvedSourceIds,0) : 'Recovery audit not yet available'}.`, '- Original snapshots, corpus records and site files were not modified. Additional source snapshots were saved separately.', '');
lines.push('### Reproduce the export', '', '```powershell', 'node scripts/recover-compilation-toc-depth.mjs', 'node scripts/export-compilation-toc.mjs', '```', '', 'Recovery reuses validated local snapshots and fetches only missing pages. A local read-only corpus master is required. Detailed source-ID gaps are recorded in `docs/research/hadith/toc-depth-audit.json`.', '');
const output = 'docs/research/hadith/all-33-compilations-table-of-contents.md';
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, lines.join('\n'));
fs.writeFileSync('scratch/compilation-toc-missing-english.json', JSON.stringify(missing, null, 2));
const audit = { collections: collections.length, totalHeadings, top: totalTop, second: totalSecond, checkedPages: checkedPages.size, english: counts, output };
fs.writeFileSync('scratch/compilation-toc-export-audit.json', JSON.stringify(audit, null, 2));
console.log(JSON.stringify(audit, null, 2));
