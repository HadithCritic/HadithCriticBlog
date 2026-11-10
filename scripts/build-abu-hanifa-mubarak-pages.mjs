#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { normAr, normEn, openNarratorResolver } from './lib/narrator-resolver.mjs';
import { toPlainEnglish } from './lib/plain-english.mjs';
import { renderCollection } from './lib/t2-collection-template.mjs';
import { writeCollectionPage } from './lib/collection-page.mjs';
import { resolveParts, partsMarkup } from './lib/reader-parts.mjs';
import { additionalConfigs,secondCenturyConfigs } from './lib/compilation-adapters.mjs';

const baseConfigs = [
  {
    slug: 'musnad-abu-hanifa',
    noun: 'Book',
    compiler: 'Abū Ḥanīfa al-Nuʿmān ibn Thābit',
    death: 150,
    expectedGroups: 33,
    expectedRecords: 523,
    sourceMetaKey: 'compilation',
    sourceId: 'musnad-abu-hanifa',
    groupsFor: source => source.books.map(book => ({ ...book, records: book.records })),
    textFor: record => ({ en: record.text_en, ar: record.text_ar }),
    partsFor: record => ({
      en: { isnad: record.isnad_en, matn: record.matn_en },
      ar: { isnad: record.isnad_ar, matn: record.matn_ar },
    }),
    numberFor: record => record.display_number ?? record.source_number ?? 'Unnumbered',
    locatorFor: () => ({ volume: null, page: null }),
    editionFor: source => [source.compilation.editor, source.compilation.publisher].filter(Boolean).join(', '),
  },
  {
    slug: 'musnad-abd-allah-ibn-al-mubarak',
    noun: 'Chapter',
    compiler: 'ʿAbd Allāh ibn al-Mubārak',
    death: 181,
    expectedGroups: 13,
    expectedRecords: 275,
    sourceMetaKey: 'collection',
    sourceId: 'abd-allah-ibn-al-mubarak',
    groupsFor: source => source.books.flatMap(book => (book.babs ?? []).map(bab => ({ ...bab, records: bab.records }))),
    textFor: record => ({
      en: record.display_text_en || record.raw_text_en,
      ar: record.display_text_ar || record.raw_text_ar,
    }),
    partsFor: record => ({
      en: { isnad: record.display_isnad_en || record.isnad_en, matn: record.display_matn_en || record.matn_en },
      ar: { isnad: record.display_isnad_ar || record.isnad_ar, matn: record.display_matn_ar || record.matn_ar },
    }),
    numberFor: record => record.number ?? 'Unnumbered',
    locatorFor: record => ({
      volume: record.source_record_metadata?.volume ?? record.source?.volume ?? null,
      page: record.page_reference ?? null,
    }),
    editionFor: source => source.collection.edition,
  },
];
const configs = [...baseConfigs, ...additionalConfigs, ...secondCenturyConfigs];

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const pad = number => String(number).padStart(2, '0');
const countText = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`;
const readableHtml = html => html
  .replace(/>\s*(<(?:nav|header|p|div|section|h[1-6]|dl|dt|dd|ol|ul|li|details|summary)\b)/g, '>\n$1')
  .replace(/(<\/(?:nav|header|p|div|section|h[1-6]|dl|dt|dd|ol|ul|li|details|summary)>)/g, '$1\n')
  .trimEnd();
// Italics only wrap text that has a Latin letter, so Arabic and bare asterisks ("* * *") are never altered.
const formatText = value => esc(value).replace(/\*([^*\n]*[A-Za-z][^*\n]*)\*/g, '<em>$1</em>');
// English display text follows the Khayyat convention (plain ASCII names, "b." for "ibn").
const formatEn = value => formatText(toPlainEnglish(value));
const metadataFor = (source, config) => ({ ...source[config.sourceMetaKey], ...(config.metadataOverride ?? {}) });
const slugId = id => String(id).replace(/[:.]/g, "-");
const MATCH_BLOCKED_STATUS = /unresolved|anonymous|unidentified|unknown|disputed|uncertain|not_fully|not_confirmed|partially|namesake/i;

function narratorPairsFor(record) {
  return Array.isArray(record.narrators)
    ? record.narrators.map(node => ({ en: node.en || '', ar: node.ar || '' }))
    : (record.narrators?.en ?? []).map((name, index) => ({
      en: name || '',
      ar: record.narrators?.ar?.[index] ?? '',
    }));
}

function parseEnglishTransmitterForms(isnad, expectedCount) {
  if (!isnad || expectedCount === 0) return [];
  const names = String(isnad)
    .replace(/\[\s*p\.\s*\d+\s*\]\s*/gi, '')
    .split(/;\s*|,\s*\(?\s*(?:and\s+)?from\s*\)?\s+/i)
    .map(clause => clause
      .replace(/^\s*from\s+/i, '')
      .replace(/\s*\((?:may (?:God|Allah) be pleased with him|God be pleased with him|ؓ)\)/gi, '')
      .replace(/\s*,?\s*(?:who|and who)\s+(?:said|narrated|reported|related|informed|recounted)\b[\s\S]*$/i, '')
      .replace(/\s+(?:narrated|informed|related|reported|transmitted)\s+(?:to\s+)?(?:us|me|him|her|them)\s*$/i, '')
      .replace(/\s+(?:said|told)\s*(?:to us)?\s*:?\s*$/i, '')
      .replace(/^[,;:\s]+|[,;:\s]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean);
  return names.length === expectedCount ? names : [];
}

function normalizeArabicSurface(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\p{M}/gu, '')
    .replace(/ـ/g, '')
    .replace(/[^\p{Script=Arabic}\p{L}\p{N}]+/gu, '')
    .toLowerCase();
}

function sourceEnglishName(node, narratorPairs) {
  if (node.en) return node.en;
  const arabic = normalizeArabicSurface(node.ar);
  if (!arabic) return '';
  const matches = narratorPairs.filter(pair =>
    pair.en && normalizeArabicSurface(pair.ar) === arabic);
  return matches.length === 1 ? matches[0].en : '';
}

function readableContext(value) {
  const text = String(value ?? '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}

function getReaderShell(referencePath) {
  const reference = fs.readFileSync(referencePath, 'utf8');
  const start = reference.search(/<!doctype html/i);
  if (start < 0) throw new Error(`Reader shell has no document: ${referencePath}`);
  const document = reference.slice(start)
    .replace(/<title>[\s\S]*?<\/title>/i, '<title>__TITLE__</title>')
    .replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="__DESCRIPTION__">')
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/\.site-header\s*\{[^}]*\}/g, '')
    .replace(/<button\b[^>]*(?:id=["']print["']|data-print)[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<section class="hero" aria-labelledby="chapter-title">[\s\S]*?<\/section>/, '__HERO__')
    .replace(/<div class="toolbar-holder">[\s\S]*?(?=<main id="main-content" class="chapter">)/, '__TOOLBAR__')
    .replace(/<main id="main-content" class="chapter">[\s\S]*?<\/main>/, '__MAIN__')
    .replace(/<script>[\s\S]*?<\/script>/, '__SCRIPT__')
    .replace('</style>', '.chain-source-text{margin:0 0 16px}.chain-source-text summary{cursor:pointer;font:600 10px/1.4 var(--uifont);color:#343a35}.chain-source-text .chain-en{font:400 11px/1.6 var(--uifont);color:#555c57}.chain-source-text .chain-ar{font:400 15px/1.8 var(--arabic);color:#555c57;direction:rtl;text-align:right}.chain-source-text div+div{margin-top:8px}.source-flags ul{margin:6px 0 0;padding-left:18px}.source-flags li{margin:2px 0}.note-item+.note-item{margin-top:10px}.note-item .chain-ar,.note-item .chain-en{margin-top:4px}.source-frame{margin:0 0 24px}.source-frame .panel-title{margin:0 0 14px;font:600 13px/1.4 var(--uifont)}</style>');
  if (document === reference.slice(start) || ['__HERO__', '__TOOLBAR__', '__MAIN__', '__SCRIPT__'].some(marker => !document.includes(marker))) {
    throw new Error('Could not prepare the existing compilation reader shell.');
  }
  return document;
}

// Display-order (earliest transmitter first) path nodes for one record, computed once
// so the narrator resolver and the renderer see exactly the same chain items.
function preparePaths(record, config) {
  const parts = config.partsFor(record);
  const narratorPairs = narratorPairsFor(record);
  const paths = (record.chains ?? []).map(chain => {
    let nodes = Array.isArray(chain) ? chain : (chain.narrators ?? []);
    if (!nodes.length && chain.context === 'opening') nodes = narratorPairs;
    const sourceNames = chain.context === 'opening'
      ? parseEnglishTransmitterForms(chain.source_isnad_en || parts.en.isnad, nodes.length)
      : [];
    const labeled = nodes.map((node, nodeIndex) => ({
      ...node,
      en: toPlainEnglish(sourceEnglishName(node, narratorPairs) || sourceNames[nodeIndex] || ''),
    }));
    if (chain.direction === 'as_written_later_to_earlier') labeled.reverse();
    return { chain, nodes: labeled };
  });
  const formNames = parseEnglishTransmitterForms(parts.en.isnad, narratorPairs.length);
  const forms = !paths.length && narratorPairs.length
    // Supplied narrator lists follow the isnad as written (latest first); show earliest first like the paths.
    ? narratorPairs.map((node, index) => ({
      ...node,
      en: toPlainEnglish(sourceEnglishName(node, narratorPairs) || formNames[index] || ''),
    })).reverse()
    : [];
  return { paths, forms };
}

const stripArabicDiacritics = value => String(value ?? '').replace(/[ً-ٰٟۖ-ۭـ]/g, '');
// Matching-only cleanup: honorifics, trailing "he said", parenthetical glosses. Display text is untouched.
function matchNode(node, resolver, trustSourceIds = false) {
  const arSource = node.normalized_name_ar || node.ar || '';
  const ar = stripArabicDiacritics(arSource)
    .replace(/رضي الله (?:عنه|عنها|عنهم|عنهما)|صلى الله عليه وسلم|عليه السلام|[ؓؑﷺ﵁]/g, ' ')
    .replace(/[\s،]*قال[ت]?\s*:?\s*$/, '')
    .replace(/[،,:]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const en = String(node.en || '').replace(/\s*\([^)]*\)/g, '').replace(/[ؓؑﷺ﵁]/g, '').trim();
  const blocked = MATCH_BLOCKED_STATUS.test(node.identity_status || '') || Boolean(node.link_blocked);
  // Some sources carry Rijal Register identifiers; honor them only where the adapter says to.
  return trustSourceIds && node.narrator_id != null && resolver.hasNarrator(node.narrator_id) ? { en, ar, blocked, narrator_id: node.narrator_id } : { en, ar, blocked };
}

// The resolver expects each chain as written (latest narrator first) and reverses it itself.
function linkPreparedPaths(preparedByRecord, resolver, trustSourceIds = false, conservative = false) {
  const matchSource = { records: [] };
  const links = [];
  for (const [id, prepared] of preparedByRecord) {
    const chains = [...prepared.paths.map(path => path.nodes), ...(prepared.forms.length ? [prepared.forms] : [])];
    const matchChains = chains.map(nodes => [...nodes].reverse().map(node => ({ node, match: matchNode(node, resolver, trustSourceIds) })));
    matchSource.records.push({ id, chains: matchChains.map(chain => chain.map(item => item.match)) });
    links.push(...matchChains.flat());
  }
  resolver.linkNarratorIds(matchSource);
  for (const { node, match } of links) {
    if (!match._narratorId || match.blocked) continue;
    if (conservative && !passesLinkGuard(match, match._narratorId, resolver)) continue;
    node._narratorId = match._narratorId;
  }
}

// Conservative linking for sources that name transmitters in short forms: the register entry must be
// one the name itself can point to, and a bare one-word name must belong to a well-attested narrator.
const MIN_BARE_NAME_HADITH_COUNT = 100;
function passesLinkGuard(match, id, resolver) {
  if (match.narrator_id != null) return true;
  if (!resolver.narratorCandidates(match).has(id)) return false;
  // A node whose English and Arabic forms point to different register entries is misaligned in the source.
  const byEnglish = resolver.narratorCandidates({ en: match.en, ar: '' });
  const byArabic = resolver.narratorCandidates({ en: '', ar: match.ar });
  if (byEnglish.size && byArabic.size && ![...byEnglish].some(candidate => byArabic.has(candidate))) return false;
  const name = (match.en ? normEn(match.en) : normAr(match.ar)).replace(/^(?:al|ال)\s+/, '');
  const bare = name.split(' ').filter(Boolean).length <= 1 || /^(?:abu|umm|ibn|ابو|ام|بن)\s+\S+$/.test(name);
  return !bare || resolver.hadithCount(id) >= MIN_BARE_NAME_HADITH_COUNT;
}

function auditSource(preparedByRecord) {
  return {
    records: [...preparedByRecord].map(([id, prepared]) => ({
      id,
      chains: [...prepared.paths.map(path => [...path.nodes].reverse()), ...(prepared.forms.length ? [[...prepared.forms].reverse()] : [])],
    })),
  };
}

function pageLabel(locator) {
  if (locator.page == null || locator.page === '') return '';
  return locator.volume ? `Vol. ${locator.volume}, p. ${locator.page}` : `p. ${locator.page}`;
}

function continuationMarkup(record) {
  return (record.continuations ?? []).map(item => `<div class="bilingual continuation"><div class="language-column column-en english" lang="en" dir="ltr"><div class="language-label">${esc(item.title_en)}</div><p class="matn">${formatEn(item.text_en)}</p></div><div class="language-column column-ar arabic" lang="ar" dir="rtl"><div class="language-label"><span>العربية</span></div><p class="matn">${formatText(item.text_ar)}</p></div></div>`).join('');
}

function reportMarkup(record, group, config, total, source, prepared) {
  const id = String(record.id);
  const key = slugId(id);
  const number = config.numberFor(record);
  const text = config.textFor(record);
  const parts = record.no_split ? { en: {}, ar: {} } : resolveParts(text, config.partsFor(record));
  const partMarkup = (language, value) => partsMarkup(parts[language], value, language === 'en' ? formatEn : formatText, record.no_isnad_reason);
  if (!text.en || !text.ar) throw new Error(`${config.slug}: report ${id} is missing one of its supplied languages.`);
  const page = pageLabel(config.locatorFor(record));
  const metadata = metadataFor(source, config);
  const cite = `${esc(metadata.short_name || metadata.title_en)} &middot; ${page ? esc(page) : `${config.noun} ${esc(group.number)}`}`;
  const noteText = [
    ...(record.notes ?? []),
    ...(record.transmission_note ? [record.transmission_note] : []),
    ...(record.source_number_note_en ? [record.source_number_note_en] : []),
  ];
  const collectionNotes = new Map((source.collection_notes ?? []).map(note => [note.id, note.text_en]));
  const noteIds = [...new Set([...(record.source_note_ids ?? []), ...(record.note_ids ?? [])])];
  for (const noteId of noteIds) {
    if (collectionNotes.has(noteId)) noteText.push(collectionNotes.get(noteId));
  }
  const notes = noteText.length
    ? `<div class="editorial-note"><strong>Source and transmission notes</strong>${noteText.map(note => `<p>${formatEn(note)}</p>`).join('')}</div>`
    : '';
  const secondaryIsnads = (record.secondary_isnads_en ?? []).map((isnad, index) =>
    `<div class="editorial-note"><strong>Additional transmission ${index + 1}</strong><p>${formatEn(isnad)}</p></div>`).join('');
  const arBlock = value => value ? `<div class="chain-ar" lang="ar" dir="rtl">${formatText(value)}</div>` : '';
  const enBlock = value => value ? `<div class="chain-en" lang="en" dir="ltr">${formatEn(value)}</div>` : '';
  const flagNote = (record.flags ?? []).length
    ? `<div class="editorial-note source-flags"><strong>Source flags</strong><ul>${record.flags.map(flag => `<li>${formatEn(flag)}</li>`).join('')}</ul></div>`
    : '';
  const remarkNote = (record.remarks ?? []).map(item =>
    `<div class="editorial-note"><strong>Remark attached in the source${item.kind ? `: ${esc(item.kind)}` : ''}</strong>${enBlock(item.en)}${arBlock(item.ar)}</div>`).join('');
  const translatorNote = (record.translator_notes ?? []).length
    ? `<div class="editorial-note"><strong>Translator note</strong>${record.translator_notes.map(note => `<p>${formatEn(note)}</p>`).join('')}</div>`
    : '';
  const footnoteNote = (record.footnotes ?? []).length
    ? `<div class="editorial-note"><strong>Footnotes</strong>${record.footnotes.map(item => `<div class="note-item">${item.marker != null || item.kind ? `<span class="role">${esc([item.marker, item.kind].filter(item2 => item2 != null && item2 !== '').join(' · '))}</span>` : ''}${enBlock(item.en)}${arBlock(item.ar)}</div>`).join('')}</div>`
    : '';
  const glossaryNote = (record.glossary ?? []).length
    ? `<div class="editorial-note"><strong>Glossary entries for this report</strong>${record.glossary.map(item => `<div class="note-item">${arBlock(item.term_ar)}${enBlock(item.definition_en)}${arBlock(item.definition_ar)}</div>`).join('')}</div>`
    : '';
  const chainItem = (node, index, earliest) => {
    const en = node.en || '';
    const narratorId = node._narratorId;
    const enText = formatText(en);
    const enName = narratorId
      ? `<a href="/narrators/${esc(narratorId)}/" data-narrator-id="${esc(narratorId)}">${enText}</a>`
      : enText;
    const english = enName || '<span class="role">English form not separately aligned</span>';
    const label = node.role_label ? `<span class="role">${esc(node.role_label)}</span>` : earliest && index === 0 ? '<span class="role">Earliest transmitter</span>' : '';
    return `<li${narratorId ? ` data-narrator-id="${esc(narratorId)}"` : ''}><span class="chain-step">${String(index + 1).padStart(2, '0')}</span><span class="chain-en">${english}${label}</span><span class="chain-ar" lang="ar" dir="rtl">${formatText(node.ar || '')}</span></li>`;
  };
  const paths = prepared.paths.map(({ chain, nodes }, index) => {
    const labels = nodes.map((node, nodeIndex) => chainItem(node, nodeIndex, true)).join('');
    const context = chain.context && chain.context !== 'opening'
      ? `<span class="role">${esc(readableContext(chain.context))}</span>`
      : '';
    const sourceIsnad = [
      chain.source_isnad_en ? `<div class="chain-en" lang="en" dir="ltr">${formatEn(chain.source_isnad_en)}</div>` : '',
      chain.source_isnad_ar ? `<div class="chain-ar" lang="ar" dir="rtl">${formatText(chain.source_isnad_ar)}</div>` : '',
    ].join('');
    const sourceIsnadDisclosure = sourceIsnad
      ? `<details class="editorial-note chain-source-text"><summary>Source wording as supplied</summary>${sourceIsnad}</details>`
      : '';
    const pathTitle = `<p class="path-title">Transmission path${record.chains.length > 1 ? ` ${index + 1} of ${record.chains.length}` : ''}</p>`;
    const directionNote = chain.direction === 'as_written_later_to_earlier'
      ? '<span class="role">Earliest to latest</span>'
      : '';
    const pathContent = labels
      ? `<ol class="chain">${labels}</ol>`
      : '<p class="chain-missing">No separately aligned transmitter names are supplied for this path.</p>';
    return `<div class="path">${pathTitle}${context}${directionNote}${sourceIsnadDisclosure}${pathContent}</div>`;
  }).join('');
  const narratorForms = prepared.forms.length
    ? `<div class="path"><p class="path-title">Transmission path</p><ol class="chain">${prepared.forms.map((node, index) => chainItem(node, index, true)).join('')}</ol></div>`
    : '';
  const transmissionFallback = paths || narratorForms || secondaryIsnads
    ? ''
    : '<p class="chain-missing">No separate transmission-path annotation is supplied for this report.</p>';
  const occurrence = record.source_number_occurrence > 1
    ? `<div class="refrow"><dt>Number occurrence</dt><dd>${record.source_number_occurrence}</dd></div>`
    : '';
  const pathCount = record.chains?.length ?? 0;
  const panelMeta = pathCount
    ? `${pathCount} ${pathCount === 1 ? 'path' : 'paths'}`
    : prepared.forms.length
      ? '1 path'
      : 'No path data';
  const edition = config.editionFor(source);
  const referenceRows = [
    `<div class="refrow"><dt>Compilation</dt><dd>${esc(metadata.title_en)}</dd></div>`,
    `<div class="refrow"><dt>Heading</dt><dd>${esc(group.title_en)}</dd></div>`,
    `<div class="refrow"><dt>Source number</dt><dd>${esc(number)}</dd></div>`,
    occurrence,
    `<div class="refrow"><dt>Edition</dt><dd>${esc(edition || 'Edition details were not recorded in the supplied source.')}</dd></div>`,
    `<div class="refrow"><dt>Edition page</dt><dd>${esc(page || 'No page locator recorded')}</dd></div>`,
    `<div class="refrow"><dt>Source record</dt><dd>${esc(record.source_id ?? id)}</dd></div>`,
    ...(record.extra_refs ?? []).map(item => `<div class="refrow"><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`),
  ].join('');
  return `<article class="hadith" id="hadith-${esc(key)}" aria-labelledby="label-${esc(key)}" data-hadith="${esc(key)}">
  <div class="hadith-label"><div class="hadith-count" id="label-${esc(key)}"><span>${esc(record.noun || metadataFor(source, config).unit_noun || 'Entry')}</span><strong>${esc(number)}</strong><span>/ ${total}</span></div><div class="hadith-cite">${cite}</div></div>
  <div class="reading-sheet"><div class="bilingual">
    <div class="language-column column-en english" lang="en" dir="ltr"><div class="language-label">English</div>${partMarkup('en', text.en)}</div>
    <div class="language-column column-ar arabic" lang="ar" dir="rtl"><div class="language-label"><span>العربية</span></div>${partMarkup('ar', text.ar)}</div>
  </div>${continuationMarkup(record)}</div>
  <div class="details-grid">
    <section class="panel transmission" aria-labelledby="tx-${esc(key)}">
      <div class="panel-header"><h3 class="panel-title" id="tx-${esc(key)}">Transmission overview</h3><span class="panel-meta">${panelMeta}</span></div>
      ${transmissionFallback}${paths}${narratorForms}${secondaryIsnads}${notes}${flagNote}${remarkNote}${translatorNote}
      <p class="chain-register-note">Linked names open their Rijāl Register entries. Unlinked names remain as supplied in the source transcription.</p>
    </section>
    <section class="panel references" aria-labelledby="refs-${esc(key)}">
      <div class="panel-header"><h3 class="panel-title" id="refs-${esc(key)}">References &amp; footnotes</h3><span class="panel-meta">No. ${esc(number)}</span></div>
      <dl class="refrows">${referenceRows}</dl>
      ${footnoteNote}${glossaryNote}
      ${noteIds.length ? `<p class="editorial-note">Source note identifiers: ${noteIds.map(esc).join(', ')}</p>` : ''}
      <div class="bottom-action"><button class="copy-btn" type="button" data-copy="${esc(key)}" aria-label="Copy entry ${esc(number)}">Copy narration</button><a class="permalink" href="#hadith-${esc(key)}">Permalink &#8599;</a></div>
    </section>
  </div>
</article>`;
}

const sourceBlock = item => `<div class="bilingual continuation"><div class="language-column column-en english" lang="en" dir="ltr"><div class="language-label">${esc(item.title_en || 'English')}${item.page ? ` · p. ${esc(item.page)}` : ''}</div>${item.en ? `<p class="matn">${formatEn(item.en)}</p>` : ''}</div><div class="language-column column-ar arabic" lang="ar" dir="rtl"><div class="language-label"><span>العربية</span></div>${item.ar ? `<p class="matn">${formatText(item.ar)}</p>` : ''}</div></div>`;
const noteListMarkup = items => (items ?? []).length
  ? `<div class="editorial-note"><strong>Footnotes</strong>${items.map(item => `<div class="note-item">${item.marker != null || item.kind ? `<span class="role">${esc([item.marker, item.kind].filter(part => part != null && part !== '').join(' · '))}</span>` : ''}${item.en ? `<div class="chain-en" lang="en" dir="ltr">${formatEn(item.en)}</div>` : ''}${item.ar ? `<div class="chain-ar" lang="ar" dir="rtl">${formatText(item.ar)}</div>` : ''}</div>`).join('')}</div>`
  : '';
const frameMarkup = frame => `<section class="source-frame reading-sheet" aria-label="${esc(frame.title_en)}">${sourceBlock(frame)}${noteListMarkup(frame.footnotes)}</section>`;
const glossaryMarkup = entries => `<div class="editorial-note"><strong>Glossary</strong>${entries.map(item => `<div class="note-item">${item.term_ar ? `<div class="chain-ar" lang="ar" dir="rtl">${formatText(item.term_ar)}</div>` : ''}${item.definition_en ? `<div class="chain-en" lang="en" dir="ltr">${formatEn(item.definition_en)}</div>` : ''}${item.definition_ar ? `<div class="chain-ar" lang="ar" dir="rtl">${formatText(item.definition_ar)}</div>` : ''}</div>`).join('')}</div>`;
const sectionMarkup = section => `<section class="source-frame reading-sheet" aria-label="${esc(section.title_en)}"><h3 class="panel-title">${esc(section.title_en)}</h3>${section.en || section.ar ? sourceBlock({ ...section, title_en: 'English' }) : ''}${noteListMarkup(section.footnotes)}${section.glossary ? glossaryMarkup(section.glossary) : ''}</section>`;

function chapterMarkup(entry, entries, config, source, shell, preparedByRecord) {
  const index = entries.findIndex(item => item.number === entry.number);
  const previous = entries[index - 1];
  const next = entries[index + 1];
  const collection = metadataFor(source, config);
  const url = `/hadith/collection/${config.slug}/`;
  const reportOptions = entry.records.map(record => {
    const label = config.numberFor(record);
    return `<option value="hadith-${esc(slugId(record.id))}">Entry ${esc(label)}</option>`;
  }).join('');
  const unitNoun = entry.noun || config.noun;
  const noun = unitNoun.toLowerCase();
  const reportCount = entry.sections ? `${entry.sections.length} ${entry.sections.length === 1 ? 'section' : 'sections'}` : `${entry.records.length} ${entry.records.length === 1 ? 'entry' : 'entries'}`;
  const title = `${unitNoun} ${entry.number} - ${entry.title_en} | ${collection.title_en} - HadithCritic`;
  const description = `Read ${reportCount} in ${noun} ${entry.number} of ${collection.title_en}, with Arabic and English text, linked transmitters, and references.`;
  const edition = config.editionFor(source);
  const pages = entry.records.flatMap(record => String(config.locatorFor(record).page ?? '').split('-').map(Number)).filter(Number.isFinite);
  const editionSpan = pages.length
    ? `Edition pages ${Math.min(...pages)}${Math.max(...pages) !== Math.min(...pages) ? `–${Math.max(...pages)}` : ''}`
    : edition;
  const hero = `<section class="hero" aria-labelledby="chapter-title"><div class="hero-inner"><div class="breadcrumb"><a href="/hadith/">Corpus</a><span class="slash">/</span><a href="${url}">${esc(collection.short_name || collection.title_en)}</a><span class="slash">/</span><span>${unitNoun} ${pad(entry.number)}</span></div><div class="hero-grid"><div><div class="eyebrow">${esc(collection.title_en)} · ${unitNoun} ${pad(entry.number)}</div><h1 id="chapter-title">${esc(entry.title_en)}</h1><p class="hero-desc">Read ${reportCount} in Arabic and English, with their transmission paths and source references.</p></div><div class="hero-right"><div class="hero-ar" lang="ar" dir="rtl">${esc(entry.title_ar)}</div><div class="hero-author">${esc(config.compiler)}</div></div></div><div class="hero-footer"><span>${pad(entry.number)} / ${entries.length} ${config.noun.toLowerCase()}s</span><span>${reportCount}</span>${editionSpan ? `<span>${esc(editionSpan)}</span>` : ''}</div></div></section>`;
  const toolbar = `<div class="toolbar-holder"><div class="toolbar"><span class="toolbar-title">${unitNoun} ${pad(entry.number)} · ${entry.sections ? 'Read the sections' : 'Read the entries'}</span><div class="toolbar-controls"><label for="jump" style="position:absolute;width:1px;height:1px;overflow:hidden">Jump to entry</label><select class="jump" id="jump"><option value="">Jump to an entry</option>${reportOptions}</select><div class="segmented" role="group" aria-label="Language display"><button type="button" data-mode-button="parallel" aria-pressed="true">Both</button><button type="button" data-mode-button="english" aria-pressed="false">English</button><button type="button" data-mode-button="arabic" aria-pressed="false">العربية</button></div></div></div></div>`;
  const before = (entry.frames_before ?? []).map(frameMarkup).join('');
  const after = (entry.frames_after ?? []).map(frameMarkup).join('');
  const sections = (entry.sections ?? []).map(sectionMarkup).join('');
  const records = entry.records.map(record => reportMarkup(record, entry, config, entry.records.length, source, preparedByRecord.get(String(record.id)))).join('\n');
  const pager = `<nav class="chapter-intro" aria-label="${config.noun} navigation"><div>${previous ? `<a href="${url}chapter/${previous.number}/">Previous ${(previous.noun || config.noun).toLowerCase()}</a>` : '<span></span>'}</div><a href="${url}">All ${config.noun.toLowerCase()}s</a><div>${next ? `<a href="${url}chapter/${next.number}/">Next ${(next.noun || config.noun).toLowerCase()}</a>` : '<span></span>'}</div></nav>`;
  const main = `<main id="main-content" class="chapter"><div class="chapter-intro"><div><h2>${esc(entry.title_en)}</h2><p>${entry.sections ? `All ${entry.sections.length} sections of the editor's material, in the source order.` : `All ${entry.records.length} source entries, in the compilation's supplied order.`}</p>${arabicHeadingMarkup(entry.title_ar)}</div>${entry.records.length ? `<a href="#hadith-${esc(slugId(entry.records[0].id))}">Start reading ↓</a>` : ''}</div>${before}${sections}${records}${after}${pager}</main>`;
  const script = `<script>
(()=>{const root=document.documentElement;const buttons=[...document.querySelectorAll('[data-mode-button]')];const setMode=mode=>{root.dataset.mode=mode;buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.modeButton===mode)));try{localStorage.setItem('shamail-reading-mode',mode)}catch{}};let mode='parallel';try{mode=localStorage.getItem('shamail-reading-mode')||mode}catch{}if(!['parallel','english','arabic'].includes(mode))mode='parallel';setMode(mode);buttons.forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.modeButton)));const jump=document.getElementById('jump');jump?.addEventListener('change',()=>{if(jump.value)document.getElementById(jump.value)?.scrollIntoView({behavior:'smooth',block:'start'});jump.value=''});const progress=document.getElementById('progress');function update(){const max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.width=(max>0?scrollY/max*100:0)+'%'}addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const article=button.closest('article');const en=[...article.querySelectorAll('.english p.isnad, .english p.matn')].map(item=>item.innerText.trim()).filter(Boolean).join(String.fromCharCode(10,10));const ar=[...article.querySelectorAll('.arabic p.isnad, .arabic p.matn')].map(item=>item.innerText.trim()).filter(Boolean).join(String.fromCharCode(10,10));try{await navigator.clipboard.writeText([en,ar].filter(Boolean).join(String.fromCharCode(10,10)))}catch{return}const previous=button.textContent;button.textContent='Copied';setTimeout(()=>button.textContent=previous,1600)}))})();
</script>`;
  const html = shell.replace('__TITLE__', esc(title)).replace('__DESCRIPTION__', esc(description))
    .replace('__HERO__', hero).replace('__TOOLBAR__', toolbar).replace('__MAIN__', main).replace('__SCRIPT__', script);
  if (/__(?:TITLE|DESCRIPTION|HERO|TOOLBAR|MAIN|SCRIPT)__/.test(html)) throw new Error(`${config.slug} ${config.noun.toLowerCase()} ${entry.number}: template was not fully rendered.`);
  return `${readableHtml(html)}\n`;
}

function arabicHeadingMarkup(title) {
  return title ? `<p class="chapter-intro__ar" lang="ar" dir="rtl">${esc(title)}</p>` : '';
}

function collectionMarkup(source, entries, config) {
  const metadata = metadataFor(source, config);
  const count = entries.reduce((sum, entry) => sum + entry.records.length, 0);
  const notes = config.notesFor
    ? config.notesFor(source, metadata)
    : config.slug === 'musnad-abu-hanifa'
    ? [
      { label: 'Edition', text: metadata.edition || '' },
      { label: 'Editor and publisher', text: [metadata.editor, metadata.publisher].filter(Boolean).join(', ') },
      { label: 'Source note', text: metadata.source_note || '' },
      { label: 'Transmission note', text: `${String(metadata.transmission_overview_note || '').replace(/\s*No external biographical identity matching is asserted\.?/i, '').trim()} Where a transmitter name matches an entry in the Rijāl Register it links there; unlinked names remain as supplied.`.trim() },
    ]
    : [
      { label: 'Edition', text: metadata.edition || '' },
      ...(source.collection_notes ?? []).map(note => ({ label: 'Editorial note', text: note.text_en })),
    ];
  const collectionSource = {
    compilation: {
      title_en: metadata.title_en,
      author: { name_en: config.compiler },
      edition: config.editionFor(source),
    },
  };
  const unitNoun = metadata.unit_noun;
  const flat = entries.filter(entry => entry.records.length);
  const listEntries = Boolean(unitNoun) && flat.length === 1;
  const excerpt = value => String(value ?? '').replace(/[\u200c\u200f\s]+/g, ' ').trim().slice(0, 64);
  const urlBase = `/hadith/collection/${config.slug}/chapter/${flat[0]?.number}/`;
  const entryItems = listEntries ? flat[0].records.map((record, index) => ({
    n: index + 1,
    href: `${urlBase}#hadith-${slugId(record.id)}`,
    title_en: `${record.noun || unitNoun} ${config.numberFor(record)}`,
    title_ar: excerpt(record.text_ar),
    count: 1,
    meta: record.page ? `p. ${record.page}` : '',
  })) : null;
  const items = entryItems ?? entries.map(entry => ({
    n: entry.number,
    title_en: entry.title_en,
    title_ar: entry.title_ar,
    count: entry.sections ? entry.sections.length : entry.records.length,
    ...(entry.sections ? { countNoun: entry.sections.length === 1 ? 'section' : 'sections' } : {}),
  }));
  const collectionConfig = {
    slug: config.slug,
    itemNoun: listEntries ? unitNoun : config.noun,
    heroDescription: metadata.description_en || undefined,
    authority: Boolean(config.authority),
    date: String(config.death),
    editionNotes: notes.filter(note => note.text),
  };
  return renderCollection(collectionConfig, collectionSource, items, count);
}

const sourceRoot = path.resolve('src/data/hadith-pages');
const chapterReference = path.join(sourceRoot, 'musnad-khalifa-ibn-khayyat/chapters/01.html');
const readerShell = getReaderShell(chapterReference);

// One title per local edition, shared with the /hadith cards (src/data/reader-editions.json).
const localTitles = new Map(JSON.parse(fs.readFileSync('src/data/reader-editions.json', 'utf8')).map(item => [item.slug, item.title_en]));
const resolver = openNarratorResolver();
const only = process.argv.slice(2);
for (const config of configs.filter(item => !only.length || only.includes(item.slug))) {
  const root = path.join(sourceRoot, config.slug);
  const sourcePath = path.join(root, 'publication-source.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const metadata = metadataFor(source, config);
  if (!metadata || !Array.isArray(source.books)) throw new Error(`${config.slug}: publication source is incomplete.`);
  const groups = config.groupsFor(source);
  const entries = groups.map((group, index) => ({
    number: Number(group.number ?? group.sequence ?? index + 1),
    title_en: group.title_en || `${config.noun} ${index + 1}`,
    title_ar: group.title_ar || '',
    records: (group.records ?? []).map(config.normalizeRecord ?? (record => record)),
    ...(group.kind === 'apparatus' ? { sections: group.sections, noun: 'Appendix' } : {}),
    frames_before: group.frames_before, frames_after: group.frames_after,
  }));
  const records = entries.flatMap(entry => entry.records);
  if (metadata.id !== config.sourceId || entries.length !== config.expectedGroups || records.length !== config.expectedRecords) {
    throw new Error(`${config.slug}: expected ${config.expectedGroups} headings and ${config.expectedRecords} reports; found ${entries.length} and ${records.length}.`);
  }
  const ids = records.map(record => String(record.id));
  if (new Set(ids).size !== ids.length) throw new Error(`${config.slug}: source report IDs are not unique.`);
  if (entries.some(entry => !entry.records.length && !entry.sections)) throw new Error(`${config.slug}: a heading contains no reports.`);
  const slugs = ids.map(slugId);
  if (new Set(slugs).size !== slugs.length || slugs.some(slug => !/^[\w-]+$/.test(slug))) throw new Error(`${config.slug}: report anchors are not unique URL-safe ids.`);
  const preparedByRecord = new Map(records.map(record => [String(record.id), preparePaths(record, config)]));
  linkPreparedPaths(preparedByRecord, resolver, Boolean(config.trustSourceNarratorIds), Boolean(config.conservativeLinking));
  fs.mkdirSync(path.join(root, 'chapters'), { recursive: true });

  const index = entries.map(entry => ({
    n: entry.number,
    title_en: entry.title_en,
    title_ar: entry.title_ar,
    ...(entry.records.length ? { first: slugId(entry.records[0].id), last: slugId(entry.records.at(-1).id) } : {}),
    noun: entry.noun || config.noun,
    count: entry.sections ? entry.sections.length : entry.records.length,
    ...(entry.sections ? { unit: 'sections' } : {}),
    file: `chapters/${pad(entry.number)}.html`,
  }));
  for (const entry of entries) {
    const file = path.join(root, 'chapters', `${pad(entry.number)}.html`);
    const html = chapterMarkup(entry, entries, config, source, readerShell, preparedByRecord);
    for (const record of entry.records) {
      const text = config.textFor(record);
      const parts = record.no_split ? { en: {}, ar: {} } : resolveParts(text, config.partsFor(record));
      for (const language of ['en', 'ar']) {
        const { isnad, matn } = parts[language];
        const format = language === 'en' ? formatEn : formatText;
        const expected = isnad || matn
          ? [isnad, matn].filter(Boolean).map(value => format(value.trim()))
          : [format(text[language])];
        for (const value of expected) {
          if (!html.includes(value)) {
            throw new Error(`${config.slug}: rendered ${language} isnad/matn does not match source report ${record.id}.`);
          }
        }
      }
    }
    fs.writeFileSync(file, html, 'utf8');
  }
  fs.writeFileSync(path.join(root, 'chapter-index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(root, 'collection.html'), `${collectionMarkup(source, entries, config)}\n`, 'utf8');
  writeCollectionPage(config.slug, localTitles.get(config.slug) ?? metadata.title_en);
  const { audit, linkedForms, totalForms, linkedOccurrences, totalOccurrences } = resolver.buildAudit(auditSource(preparedByRecord), `${config.slug}/publication-source.json`);
  fs.writeFileSync(path.join(root, 'narrator-link-audit.json'), `${JSON.stringify(audit, null, 2)}
`, 'utf8');
  console.log(`Built ${config.slug}: ${entries.length} ${config.noun.toLowerCase()} pages, ${records.length} bilingual reports, ${linkedForms}/${totalForms} unique narrator forms and ${linkedOccurrences}/${totalOccurrences} chain items linked.`);
}
resolver.close();
