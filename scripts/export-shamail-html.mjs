#!/usr/bin/env node
/*
 * Export Al-Shama'il as one editable HTML source per chapter. Run after the
 * corpus has been built locally:
 *   node --experimental-sqlite scripts/export-shamail-html.mjs
 *
 * The public site does not read this database. The checked-in HTML files are
 * the build inputs, following the per-page Tafsir HTML workflow.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const output = path.resolve('src/data/hadith-pages/al-shama-il-al-muhammadiyah');
const chapterOutput = path.join(output, 'chapters');
const dbPath = path.resolve('dist-db/builds', JSON.parse(fs.readFileSync('src/data/corpus-meta.json', 'utf8')).corpusVersion, 'hadith.db');
const structure = JSON.parse(fs.readFileSync('src/data/collection-structure/al-shama-il-al-muhammadiyah.json', 'utf8'));
const pageStyles = `<style>\n/* Shared tokens and reader styles are embedded here so this chapter can be edited as one HTML file. */\n${fs.readFileSync('src/styles/hadith-library.css', 'utf8')}\n${fs.readFileSync('src/styles/hadith-reader.css', 'utf8')}\n.hr-chapter-page { max-width: 92rem; margin: 0 auto; padding: 2rem 1.25rem 5rem; }\n.hr-chapter-page__head { margin: 0 auto 3rem; max-width: 58rem; padding: 2rem 0; border-bottom: 1px solid var(--hl-line); }\n.hr-chapter-page__back, .hr-chapter-page__pager a { color: var(--hl-gold); }\n.hr-chapter-page__eyebrow { margin: 2rem 0 .5rem; color: var(--hl-muted); font: 600 .75rem/1.4 var(--hl-sans); letter-spacing: .12em; text-transform: uppercase; }\n.hr-chapter-page__head h1 { color: var(--hl-cream); font: 600 clamp(2rem, 5vw, 3.5rem)/1.1 var(--hl-display); }\n.hr-chapter-page__ar { color: var(--hl-muted); font: 400 1.6rem/1.8 var(--hl-arabic); }\n.hr-chapter-page__pager { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; margin: 3rem auto 0; max-width: 58rem; }\n.hr-chapter-page__pager > :last-child { text-align: right; }\n@media (max-width: 620px) { .hr-chapter-page__pager { grid-template-columns: 1fr 1fr; } .hr-chapter-page__pager > :nth-child(2) { grid-column: 1 / -1; grid-row: 1; } }\n</style>`;
const overwrite = process.argv.includes('--overwrite');
if (!fs.existsSync(dbPath)) throw new Error(`Corpus database not found: ${dbPath}`);
fs.mkdirSync(output, { recursive: true });

const db = new DatabaseSync(dbPath, { readOnly: true });
const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rich = (value = '') => esc(value).replace(/\*\*(?=\S)([^\n]*?)(?<=\S)\*\*/g, '<strong>$1</strong>').replace(/(?<![\w*])\*(?=[^\s*])([^\n*]*?)(?<=[^\s*])\*(?![\w*])/g, '<em>$1</em>').replace(/\[(\d{1,2})\/(\d{1,5})\]/g, '<span class="folio" title="Printed edition: volume $1, page $2">$1/$2</span>');
const arabic = (value = '') => esc(value).replace(/\[(\d{1,2})\/(\d{1,5})\]/g, '<span class="folio" title="Printed edition: volume $1, page $2">$1/$2</span>');
const get = (sql, ...args) => db.prepare(sql).all(...args);
const one = (sql, ...args) => db.prepare(sql).get(...args);
const hadithColumns = new Set(get("SELECT name FROM pragma_table_info('hadith')").map((row) => row.name));
const narratorColumns = new Set(get("SELECT name FROM pragma_table_info('hadith_narrator')").map((row) => row.name));
const hasTextParts = Boolean(one("SELECT 1 AS present FROM sqlite_master WHERE type='table' AND name='hadith_text_parts'"));
const hasReferences = Boolean(one("SELECT 1 AS present FROM sqlite_master WHERE type='table' AND name='hadith_reference'"));
const book = one('SELECT id, slug, title_en, title_ar FROM hadith_book WHERE slug = ?', 'al-shama-il-al-muhammadiyah');
if (!book) throw new Error('The corpus does not contain Al-Shama\'il al-Muhammadiyah.');

const optional = (column) => hadithColumns.has(column) ? `h.${column}` : `NULL AS ${column}`;
const partsJoin = hasTextParts ? 'LEFT JOIN hadith_text_parts tp ON tp.hadith_id=h.id' : '';
const partsColumns = hasTextParts ? 'tp.lead_end,tp.notes_start,tp.page_start,tp.page_end' : 'NULL AS lead_end,NULL AS notes_start,NULL AS page_start,NULL AS page_end';
const rows = get(`SELECT h.*, b.title_en AS book_en, b.title_ar AS book_ar, b.slug AS book_slug,
    ${optional('text_ar_diac')}, ${optional('matn_ar_diac')}, ${partsColumns}
  FROM hadith h JOIN hadith_book b ON b.id=h.book_id
  ${partsJoin}
  WHERE h.book_id=? ORDER BY h.id`, book.id);

function textParts(row) {
  const whole = { lead: '', narration: row.text_ar_diac || row.text_ar || '', notes: '' };
  if (row.lead_end == null || row.notes_start == null || row.lead_end < 0 || row.lead_end > row.notes_start || row.notes_start > row.text_ar.length) return whole;
  const shown = row.text_ar_diac || row.text_ar;
  const marks = /[\u064B-\u065F\u0670\u06D6-\u06ED]/;
  let offsets = null;
  if (shown !== row.text_ar) {
    if (shown.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') !== row.text_ar) return whole;
    offsets = [];
    for (let i = 0; i < shown.length; i += 1) if (!marks.test(shown[i])) offsets.push(i);
    offsets.push(shown.length);
  }
  const at = (n) => offsets ? offsets[n] : n;
  return { lead: shown.slice(0, at(row.lead_end)), narration: shown.slice(at(row.lead_end), at(row.notes_start)), notes: shown.slice(at(row.notes_start)) };
}

function splitEnglish(report, matn) {
  if (!report) return null;
  if (!matn) return { chain: '', matn: report };
  const at = report.lastIndexOf(matn);
  return at < 0 ? { chain: '', matn: report } : { chain: report.slice(0, at).trim(), matn: report.slice(at).trim() };
}

function readableHtml(html) {
  const blocks = 'nav|header|p|div|section|h[1-6]|dl|dt|dd|ol|ul|li|details|summary';
  return html
    .replace(new RegExp(`>\\s*(<(?:${blocks})\\b)`, 'g'), '>\n$1')
    .replace(new RegExp(`(</(?:${blocks})>)`, 'g'), '$1\n')
    .trimEnd();
}

function render(row) {
  const id = row.id;
  const number = row.hadith_num || String(id);
  const parts = textParts(row);
  const english = splitEnglish(row.text_en, row.matn_en);
  const chains = get(`SELECT c.path_idx,c.pos,c.narrator_id,c.name,n.name_en,n.death_hijri
    FROM hadith_chain c LEFT JOIN narrator n ON n.id=c.narrator_id WHERE c.hadith_id=? ORDER BY c.path_idx,c.pos`, id);
  const paths = [...Map.groupBy(chains, (item) => item.path_idx).entries()];
  const surfaceDiac = narratorColumns.has('surface_diac') ? 'hn.surface_diac' : 'NULL AS surface_diac';
  const surfaces = get(`SELECT hn.pos,hn.narrator_id,hn.surface,${surfaceDiac},n.name_en
    FROM hadith_narrator hn LEFT JOIN narrator n ON n.id=hn.narrator_id WHERE hn.hadith_id=? ORDER BY hn.pos`, id);
  const subjects = get('SELECT label_en,label_ar FROM hadith_subject WHERE hadith_id=? ORDER BY label_en', id);
  const glosses = get('SELECT word_en,word_ar FROM hadith_gloss WHERE hadith_id=?', id);
  const refs = hasReferences ? get(`SELECT r.source_marker,e.work_title_ar,e.publisher_ar,e.publication_place_ar,e.edition_statement_ar,e.year_hijri,e.year_gregorian,e.volume_count
    FROM hadith_reference r JOIN hadith_edition e ON e.id=r.edition_id WHERE r.hadith_id=? ORDER BY r.reference_ordinal`, id) : [];
  const pages = row.page_start ? `vol. ${esc(row.page_start.replace('/', ', p. '))}${row.page_end && row.page_end !== row.page_start ? `–${esc(row.page_end)}` : ''}` : '';
  const chapter = row.chapter_en || row.chapter_ar ? `<div class="hr-chapter">${row.chapter_en ? `<p class="hr-chapter__en">${rich(row.chapter_en)}</p>` : ''}${row.chapter_ar ? `<p class="hr-chapter__ar" lang="ar" dir="rtl">${arabic(row.chapter_ar)}</p>` : ''}</div>` : '';
  const transmission = paths.length ? `<section class="hr-panel hr-panel--chain" aria-labelledby="isnad-heading"><h2 class="hr-panel__title" id="isnad-heading">Transmission</h2>${paths.map(([, nodes], i) => {
    const compiler = nodes.length > 1 ? nodes.at(-1) : null;
    const recited = (compiler ? nodes.slice(0, -1) : nodes).slice().reverse();
    return `<div class="hr-chain-block">${paths.length > 1 ? `<p class="hr-chain__label">Chain ${i + 1} of ${paths.length}</p>` : ''}${compiler ? `<p class="hr-chain__compiler">Compiled by ${esc(compiler.name_en || compiler.name)}, who heard it from:</p>` : ''}<ol class="hr-chain">${recited.map((n, j) => `<li class="ladder-node"><span class="hr-chain__n" aria-hidden="true">${j + 1}</span><span class="hr-chain__who">${n.narrator_id ? `<a class="ladder-card__name" href="/narrators/${n.narrator_id}/">${esc(n.name_en || n.name)}</a>` : `<span class="ladder-card__name is-unlinked">${esc(n.name || 'Unidentified transmitter')}</span>`}</span>${n.death_hijri ? `<span class="hr-chain__death">d. ${n.death_hijri} AH</span>` : ''}</li>`).join('')}</ol></div>`;
  }).join('')}<p class="hr-panel__note">Names as the Rijal Register identifies them.${surfaces.length ? ' Source narrator forms are listed below.' : ''}</p>${surfaces.length ? `<details class="source-narrators"><summary>Source narrator name forms <span>${surfaces.length} indexed forms</span></summary><ol>${surfaces.map((n) => `<li><span class="source-narrators__position">${n.pos + 1}</span><span class="source-narrators__en">${esc(n.name_en || 'No register match')}</span><span class="source-narrators__ar" lang="ar" dir="rtl">${arabic(n.surface_diac || n.surface)}</span></li>`).join('')}</ol></details>` : ''}</section>` : '';
  const more = [];
  if (Number(row.parallel_count) + Number(row.witness_count) + Number(row.variant_count) > 0) more.push(`<details class="hr-more__item"><summary>Parallel reports <span>${Number(row.parallel_count) + Number(row.witness_count) + Number(row.variant_count)} recorded</span></summary><ul class="hr-counts"><li><span>Mutabaʿat — same companion, another route</span><span>${Number(row.parallel_count).toLocaleString()}</span></li><li><span>Shawahid — similar report from a different companion</span><span>${Number(row.witness_count).toLocaleString()}</span></li><li><span>Wording variants</span><span>${Number(row.variant_count).toLocaleString()}</span></li></ul></details>`);
  if (glosses.length) more.push(`<details class="hr-more__item"><summary>Uncommon words <span>${glosses.length}</span></summary><dl class="hr-glosses">${glosses.map((g) => `<div><dd>${esc(g.word_en)}</dd><dt lang="ar" dir="rtl">${arabic(g.word_ar)}</dt></div>`).join('')}</dl></details>`);
  if (subjects.length) more.push(`<details class="hr-more__item"><summary>Subjects <span>${subjects.length}</span></summary><ul class="hr-subjects">${subjects.map((s) => `<li>${esc(s.label_en)}</li>`).join('')}</ul></details>`);
  if (row.matn_ar && row.matn_ar.trim() !== row.text_ar.trim()) more.push(`<details class="hr-more__item"><summary>The matn alone, in Arabic</summary><p class="hr-more__ar" lang="ar" dir="rtl">${arabic(row.matn_ar_diac || row.matn_ar)}</p></details>`);
  const lead = /[\u0600-\u06FF]/.test(parts.lead.replace(/\[\d+\/\d+\]/g, '')) ? `<details class="hr-refs__more"><summary>As headed in the edition</summary><p class="hr-refs__ar" lang="ar" dir="rtl">${arabic(parts.lead)}</p><p class="hr-refs__note">The edition's headings and front matter before this narration, as printed.</p></details>` : '';
  const notes = parts.notes.trim() ? `<details class="hr-refs__more"><summary>Editor's notes</summary><p class="hr-refs__ar" lang="ar" dir="rtl">${arabic(parts.notes)}</p><p class="hr-refs__note">The printed edition's footnotes, reproduced as given.</p></details>` : '';
  const printed = refs[0] ? `<div class="edition-reference-summary"><span>${esc(row.book_en)} · First edition · ${refs[0].volume_count} volumes · ${refs[0].year_hijri} AH / ${refs[0].year_gregorian} CE</span><span class="edition-reference-summary__pages">${refs.map((r) => esc(r.source_marker)).join(' ')}</span><span class="edition-reference-summary__ar" lang="ar" dir="rtl">${esc(refs[0].work_title_ar)} · ${esc(refs[0].publisher_ar)} · ${esc(refs[0].publication_place_ar)} · ${esc(refs[0].edition_statement_ar)}</span></div>` : '<span class="ledger-meta">No printed page marker recorded</span>';
  return `<article class="hr" data-hadith-id="${id}"><nav class="hr-trail hr-head__top" aria-label="Breadcrumb"><a class="hr-trail__back hr-head__back" href="/hadith/collection/al-shama-il-al-muhammadiyah/">‹ Al-Shama'il al-Muhammadiyah</a><span aria-hidden="true">/</span><a href="/hadith/">Hadith library</a><span aria-hidden="true">/</span><span aria-current="page">Hadith ${esc(number)}</span></nav><header class="hr-head hr-rhead edition-hero"><p class="hr-rhead__overline">Corpus record ${id}</p><div class="hr-rhead__row"><span class="hr-rhead__num" aria-hidden="true">${esc(number)}</span><div><h1 class="hr-head__title hr-rhead__title"><a href="/hadith/collection/al-shama-il-al-muhammadiyah/">${esc(row.book_en)}</a></h1><p class="hr-head__title-ar hr-rhead__ar" lang="ar" dir="rtl">${arabic(row.book_ar)}</p></div></div><p class="hr-head__meta hr-rhead__facts"><span>Hadith ${esc(number)}</span>${pages ? `<i aria-hidden="true">·</i><span>${pages}</span>` : ''}</p></header>${chapter}<section class="hr-text" aria-labelledby="report-heading"><h2 id="report-heading" class="hr-visually-hidden">The report</h2><div class="hr-leaf critical-spread"><div class="hr-leaf__en critical-col--en"><p class="hr-leaf__label">English <span>· machine translation</span></p>${english ? `${english.chain ? `<p class="hr-leaf__chain facing-prose facing-prose--en">${rich(english.chain)}</p><span class="hr-leaf__rule" aria-hidden="true"></span>` : ''}<div class="hr-leaf__matn facing-prose facing-prose--en" id="matn-heading">${rich(english.matn)}</div>` : '<p class="facing-prose--empty">No English is recorded for this report.</p>'}<p class="hr-leaf__note">English rendering: machine translation, not reviewed. The Arabic is the source text.</p></div><div class="hr-leaf__ar critical-col--ar"><p class="hr-leaf__label">Arabic <span lang="ar">· الأصل</span></p><div class="facing-prose facing-prose--ar" lang="ar" dir="rtl">${arabic(parts.narration)}</div></div></div></section><div class="hr-panels">${transmission}<section class="hr-panel hr-panel--refs" aria-labelledby="refs-heading"><h2 class="hr-panel__title" id="refs-heading">References &amp; source notes</h2><dl class="hr-refs"><div><dt>Citation</dt><dd>${esc(row.book_en)}${row.hadith_num ? `, no. ${esc(row.hadith_num)}` : ''}${pages ? `, ${pages}` : ''}</dd></div><div><dt>Printed edition</dt><dd>${printed}</dd></div><div><dt>Corpus record</dt><dd>HadithCritic ${id}</dd></div></dl>${lead}${notes}<p class="hr-refs__note">The Arabic is the source text, from the Ifta' Sunnah platform; the English rendering is unreviewed machine translation.</p></section></div>${more.length ? `<section class="hr-more" aria-labelledby="apparatus-heading"><h2 class="hr-more__title" id="apparatus-heading">More on this report</h2>${more.join('')}</section>` : ''}<nav class="hr-pager edition-pager"><a href="/hadith/collection/al-shama-il-al-muhammadiyah/">Back to Al-Shama'il al-Muhammadiyah</a></nav></article>`;
}

const chapters = structure.kitabs[0].chapters;
if (chapters.length !== 56) throw new Error(`Expected 56 Shamā'il chapters, found ${chapters.length}.`);
if (!overwrite) {
  const existing = chapters.find((chapter) => fs.existsSync(path.join(chapterOutput, `${String(chapter.n).padStart(2, '0')}.html`)));
  if (existing) throw new Error(`Refusing to overwrite chapter ${existing.n}.html; pass --overwrite to replace existing chapter HTML sources.`);
}

const chapterPages = chapters.map((chapter, index) => {
  const chapterRows = rows.filter((row) => row.id >= chapter.first && row.id <= chapter.last);
  if (chapterRows.length !== chapter.count) {
    throw new Error(`Chapter ${chapter.n} expects ${chapter.count} narrations, but the corpus supplied ${chapterRows.length}.`);
  }
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  const title = chapter.title_en || chapter.title_ar || `Chapter ${chapter.n}`;
  const top = `<header class="hr-chapter-page__head"><a class="hr-chapter-page__back" href="/hadith/collection/al-shama-il-al-muhammadiyah/">Back to all 56 chapters</a><p class="hr-chapter-page__eyebrow">Chapter ${chapter.n} of ${chapters.length} · ${chapter.count} narrations</p><h1>${rich(title)}</h1><p class="hr-chapter-page__ar" lang="ar" dir="rtl">${arabic(chapter.title_ar || '')}</p></header>`;
  const pager = `<nav class="hr-chapter-page__pager" aria-label="Chapter navigation">${previous ? `<a rel="prev" href="/hadith/collection/al-shama-il-al-muhammadiyah/chapter/${previous.n}/">← ${esc(previous.title_en || `Chapter ${previous.n}`)}</a>` : '<span></span>'}<a href="/hadith/collection/al-shama-il-al-muhammadiyah/">Chapter list</a>${next ? `<a rel="next" href="/hadith/collection/al-shama-il-al-muhammadiyah/chapter/${next.n}/">${esc(next.title_en || `Chapter ${next.n}`)} →</a>` : '<span></span>'}</nav>`;
  const content = `${pageStyles}<div class="hl hadith-record-page"><div class="hl-wrap hadith-container"><div class="hr-chapter-page">${top}${chapterRows.map(render).join('\n')}${pager}</div></div></div>`;
  return {
    n: chapter.n,
    title_en: chapter.title_en,
    title_ar: chapter.title_ar,
    first: chapter.first,
    last: chapter.last,
    count: chapter.count,
    file: `chapters/${String(chapter.n).padStart(2, '0')}.html`,
    html: `${readableHtml(content)}\n`,
  };
});

fs.mkdirSync(chapterOutput, { recursive: true });
for (const page of chapterPages) fs.writeFileSync(path.join(output, page.file), page.html, 'utf8');
fs.writeFileSync(path.join(output, 'chapter-index.json'), `${JSON.stringify(chapterPages.map(({ html, ...chapter }) => chapter), null, 2)}\n`, 'utf8');
// Remove the generated per-hadith sources after all 56 replacement pages are safely written.
for (const file of fs.readdirSync(output)) {
  if (/^\d+\.html$/.test(file)) fs.unlinkSync(path.join(output, file));
}
const oldIndex = path.join(output, 'index.json');
if (fs.existsSync(oldIndex)) fs.unlinkSync(oldIndex);
db.close();
console.log(`Exported ${rows.length} narrations into ${chapterPages.length} editable Al-Shama'il chapter HTML files in ${path.relative(process.cwd(), chapterOutput)}.`);
