#!/usr/bin/env node
/* Full source-to-HTML audit for the generated Al-Shama'il chapter pages. */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';

const root = path.resolve('src/data/hadith-pages/al-shama-il-al-muhammadiyah');
const source = JSON.parse(fs.readFileSync(path.join(root, 'publication-source.json'), 'utf8'));
const index = JSON.parse(fs.readFileSync(path.join(root, 'chapter-index.json'), 'utf8'));
const book = source.books[0];
const fail = (message) => { throw new Error(message); };
const attrs = (node) => Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
const classes = (node) => (attrs(node).class ?? '').split(/\s+/).filter(Boolean);
const hasClass = (node, name) => classes(node).includes(name);
function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
}
function findAll(node, predicate) {
  const found = [];
  walk(node, (child) => { if (predicate(child)) found.push(child); });
  return found;
}
function first(node, predicate) {
  return findAll(node, predicate)[0] ?? null;
}
function text(node) {
  if (!node) return '';
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes ?? []).map(text).join('');
}
const tag = (name) => (node) => node.tagName === name;
const cls = (name) => (node) => hasClass(node, name);
const sourceRecords = book.babs.flatMap((chapter) => chapter.records);
if (book.babs.length !== 56 || sourceRecords.length !== 415) fail(`Source count mismatch: ${book.babs.length} chapters, ${sourceRecords.length} narrations.`);
if (index.length !== 56) fail(`Chapter index has ${index.length} chapters.`);
const seen = new Set();
let pathCount = 0;
let chainNodeCount = 0;
const route = '/hadith/collection/al-shama-il-al-muhammadiyah/';

for (const [chapterIndex, chapter] of book.babs.entries()) {
  const n = chapterIndex + 1;
  const entry = index[chapterIndex];
  if (entry.n !== n || entry.count !== chapter.records.length || entry.file !== `chapters/${String(n).padStart(2, '0')}.html`) fail(`Chapter index mismatch at chapter ${n}.`);
  const file = path.join(root, entry.file);
  if (!fs.existsSync(file)) fail(`Missing chapter page ${entry.file}.`);
  const html = fs.readFileSync(file, 'utf8');
  const document = parse(html);
  if (html.includes('<header class="site-header">')) fail(`Chapter ${n} contains the duplicate embedded site navbar.`);
  if (/id="print"|>\s*Print\s*</i.test(html)) fail(`Chapter ${n} still contains a Print control.`);
  const articles = findAll(document, (node) => node.tagName === 'article' && hasClass(node, 'hadith'));
  if (articles.length !== chapter.records.length) fail(`Chapter ${n} contains ${articles.length} articles; expected ${chapter.records.length}.`);
  if (!/max-width:\s*740px/.test(html) || !/max-width:\s*420px/.test(html)) fail(`Chapter ${n} is missing reference responsive breakpoints.`);
  if (!html.includes('data-mode-button="parallel"') || !html.includes('shamail-reading-mode') || !html.includes('navigator.clipboard')) fail(`Chapter ${n} is missing reading-mode or copy behavior.`);
  if (/machine translation|Original text|translation review|review status|source transcription/i.test(html)) fail(`Chapter ${n} contains a prohibited status or transcription label.`);

  for (const [recordIndex, record] of chapter.records.entries()) {
    const article = articles[recordIndex];
    const a = attrs(article);
    if (a['data-hadith'] !== record.id || a.id !== `hadith-${record.id}`) fail(`Chapter ${n}, item ${recordIndex + 1}: misattributed record ID.`);
    if (seen.has(record.id)) fail(`Duplicate narration ${record.id}.`);
    seen.add(record.id);
    const english = first(article, cls('english'));
    const arabic = first(article, cls('arabic'));
    const enIsnad = first(english, cls('isnad'));
    const enMatn = first(english, cls('matn'));
    const arMatn = first(arabic, cls('matn'));
    if ((enIsnad ? text(enIsnad) : '') !== (record.display_isnad_en || '')) fail(`Narration ${record.id}: English isnad mismatch.`);
    const expectedEnMatn = record.display_matn_en || ((!record.display_isnad_en) ? (record.display_text_en || record.raw_text_en || '') : '');
    if ((enMatn ? text(enMatn) : '') !== expectedEnMatn) fail(`Narration ${record.id}: English matn/report mismatch.`);
    if (!arMatn || text(arMatn) !== (record.display_text_ar || record.raw_text_ar || '')) fail(`Narration ${record.id}: Arabic text mismatch.`);

    const paths = findAll(first(article, cls('transmission')), cls('path'));
    if (paths.length !== (record.chains ?? []).length) fail(`Narration ${record.id}: ${paths.length} visible paths, expected ${(record.chains ?? []).length}.`);
    pathCount += paths.length;
    for (const [p, expectedChain] of record.chains.entries()) {
      const list = first(paths[p], cls('chain'));
      const nodes = findAll(list, tag('li'));
      const expectedNodes = [...expectedChain.narrators].reverse();
      if (nodes.length !== expectedNodes.length) fail(`Narration ${record.id}, path ${p + 1}: chain length mismatch.`);
      for (const [i, node] of nodes.entries()) {
        const actual = attrs(node);
        const expected = expectedNodes[i];
        if ((actual['data-narrator-id'] ?? null) !== (expected.narrator_id == null ? null : String(expected.narrator_id))) fail(`Narration ${record.id}, path ${p + 1}, step ${i + 1}: narrator ID/order mismatch.`);
        const name = first(node, cls('chain-en'));
        const arabicName = first(node, cls('chain-ar'));
        const role = first(name, cls('role'));
        if (!text(name).includes(expected.en || expected.normalized_name_ar || 'Unidentified transmitter')) fail(`Narration ${record.id}, path ${p + 1}, step ${i + 1}: English narrator name missing.`);
        if (text(arabicName) !== (expected.normalized_name_ar || '')) fail(`Narration ${record.id}, path ${p + 1}, step ${i + 1}: Arabic narrator name mismatch.`);
        if (i === 0 && text(role) !== 'Earliest transmitter') fail(`Narration ${record.id}, path ${p + 1}: earliest transmitter is not at the top.`);
        if (i === nodes.length - 1 && nodes.length > 1 && text(role) !== 'Compiler') fail(`Narration ${record.id}, path ${p + 1}: compiler is not at the bottom.`);
      }
      chainNodeCount += nodes.length;
    }

    const rows = findAll(first(article, cls('references')), cls('refrow'));
    const rowValues = new Map(rows.map((row) => [text(first(row, tag('dt'))).trim(), text(first(row, tag('dd'))).trim()]));
    if (rowValues.get('Hadith number') !== String(record.source_number)) fail(`Narration ${record.id}: source number missing from references.`);
    if (rowValues.get('Source record') !== record.id) fail(`Narration ${record.id}: source record reference mismatch.`);
    if (record.page_reference && rowValues.get('Edition page') !== `1/${record.page_reference}`) fail(`Narration ${record.id}: edition page reference mismatch.`);
    if (rowValues.get('Edition') !== source.collection.edition) fail(`Narration ${record.id}: edition metadata mismatch.`);
    const notes = record.review?.unresolved ?? [];
    const noteText = findAll(first(article, cls('references')), cls('editorial-note')).map(text).join(' ');
    for (const note of notes) if (!noteText.includes(note)) fail(`Narration ${record.id}: editorial note omitted.`);
    const commentaryMarker = String.fromCodePoint(0x642, 0x627, 0x644, 0x20, 0x623, 0x628, 0x648, 0x20, 0x639, 0x64a, 0x633, 0x649);
    const commentaryAt = (record.raw_text_ar || '').indexOf(commentaryMarker);
    if (commentaryAt >= 0 && !noteText.includes(record.raw_text_ar.slice(commentaryAt).trim())) fail(`Narration ${record.id}: compiler commentary omitted or altered.`);
  }

  const chapterLinks = findAll(document, (node) => node.tagName === 'a').map((node) => attrs(node).href).filter((href) => href?.startsWith(`${route}chapter/`));
  for (const href of chapterLinks) {
    const target = Number(href.slice(`${route}chapter/`.length).replaceAll('/', ''));
    if (!Number.isInteger(target) || target < 1 || target > 56) fail(`Chapter ${n}: invalid chapter link ${href}.`);
  }
  if (!html.includes(`href="${route}"`)) fail(`Chapter ${n}: collection homepage link is missing.`);
}

if (seen.size !== 415 || sourceRecords.some((record) => !seen.has(record.id))) fail(`Narration coverage mismatch: found ${seen.size} unique of 415.`);
console.log(`Verified 56 chapters, 415 unique narrations, ${pathCount} transmission paths, and ${chainNodeCount} chain nodes.`);
