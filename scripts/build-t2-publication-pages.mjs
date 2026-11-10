#!/usr/bin/env node
/*
 * Build the two T2 compilation readers from their checked-in publication JSON.
 * The corpus is opened read-only only to resolve narrator-register links; the
 * public pages are complete static HTML and make no database requests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { openNarratorResolver } from './lib/narrator-resolver.mjs';
import { partsMarkup } from './lib/reader-parts.mjs';
import { renderCollection } from './lib/t2-collection-template.mjs';

const configs = [
  { slug: 'musnad-sad-ibn-abi-waqqas', source: 'musnad-sad-ibn-abi-waqqas', itemNoun: 'Chapter', expected: 9 },
  { slug: 'birr-al-walidayn', source: 'birr-al-walidayn', itemNoun: 'Chapter', expected: 45 },
  { slug: 'musnad-khalifa-ibn-khayyat', source: 'musnad-khalifa-ibn-khayyat', itemNoun: 'Section', expected: 47 },
];
const resolver = openNarratorResolver();
const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const readableHtml = html => html
  .replace(/>\s*(<(?:nav|header|p|div|section|h[1-6]|dl|dt|dd|ol|ul|li|details|summary)\b)/g, '>\n$1')
  .replace(/(<\/(?:nav|header|p|div|section|h[1-6]|dl|dt|dd|ol|ul|li|details|summary)>)/g, '$1\n')
  .trimEnd();
const readerReference = fs.readFileSync('src/data/hadith-pages/al-shama-il-al-muhammadiyah/user-supplied/HadithCritic_Shamail_Chapter_1_Avrea_Refined.html', 'utf8');
const shellStart = readerReference.search(/<!doctype html/i);
if (shellStart < 0) throw new Error('The completed Shamāʾil reader shell is unavailable.');
const shell = readerReference.slice(shellStart)
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>__TITLE__</title>')
  .replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="__DESCRIPTION__">')
  .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '')
  .replace(/\.site-header\s*\{[^}]*\}/g, '')
  .replace(/<button\b[^>]*(?:id=["']print["']|data-print)[^>]*>[\s\S]*?<\/button>/gi, '')
  .replace(/<section class="hero" aria-labelledby="chapter-title">[\s\S]*?<\/section>/, '__HERO__')
  .replace(/<div class="toolbar-holder">[\s\S]*?(?=<main id="main-content" class="chapter">)/, '__TOOLBAR__')
  .replace(/<main id="main-content" class="chapter">[\s\S]*?<\/main>/, '__MAIN__')
  .replace(/<script>[\s\S]*?<\/script>/, '__SCRIPT__');
if (shell === readerReference.slice(shellStart)) throw new Error('Could not prepare the Shamāʾil reader shell.');

// The supplied translations use single asterisks for emphasis. Escape the
// text first, then render that limited formatting instead of showing markup.
const formatText = value => esc(value ?? '').replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
function chainMarkup(chains, collection) {
  if (!Array.isArray(chains) || !chains.length) return '<p class="chain-missing">No transmission path is supplied for this entry.</p>';
  return chains.map((chain, pathIndex) => {
    const nodes = [...chain].reverse();
    const list = nodes.map((node, index) => {
      const id = node._narratorId ?? null;
      const name = node.en || node.ar || 'Unidentified transmitter';
      const isCompiler = index === nodes.length - 1 && /al-bukhārī|al-bukhari|khalīfa b\. khayyāṭ|khalifa b\. khayyat/i.test(name)
        && /al-bukhārī|al-bukhari|khalīfa ibn khayyāṭ|khalifa ibn khayyat/i.test(collection.title_en);
      const label = index === 0 ? '<span class="role">Earliest transmitter</span>' : isCompiler ? '<span class="role">Compiler</span>' : '';
      const linkedName = id ? `<a href="/narrators/${id}/" data-narrator-id="${id}">${formatText(name)}</a>` : formatText(name);
      return `<li${id ? ` data-narrator-id="${id}"` : ''}><span class="chain-step">${String(index + 1).padStart(2, '0')}</span><span class="chain-en">${linkedName}${label}</span><span class="chain-ar" lang="ar" dir="rtl">${formatText(node.ar || '')}</span></li>`;
    }).join('');
    return `<div class="path"><p class="path-title">Transmission path${chains.length > 1 ? ` ${pathIndex + 1} of ${chains.length}` : ''}</p><ol class="chain">${list}</ol></div>`;
  }).join('');
}
function reportMarkup(record, total, source) {
  const id = String(record.id);
  const material = record.preceding_source_material;
  const preface = material ? `<details class="panel references" style="margin:0 0 24px"><summary class="panel-title">${esc(material.title_en)} · source text before entry ${esc(record.number ?? id)}</summary><div class="english"><p class="matn">${formatText((material.text_en || '').replace(/\s*\[p\.\s*\d+\]\s*/gi, ' ').trim())}</p></div><div class="arabic" lang="ar" dir="rtl"><p class="matn">${formatText((material.text_ar || '').replace(/\s*⦗ص:\s*\d+⦘\s*/g, ' ').trim())}</p></div>${material.page_breaks?.length ? `<p>Printed page breaks: ${material.page_breaks.map(page => esc(page)).join(', ')}</p>` : ''}</details>` : '';
  const number = record.number ?? id;
  const page = record.page?.page ? `Vol. ${record.page.volume}, p. ${record.page.page}` : 'No page locator recorded';
  const english = partsMarkup({ isnad: record.display_isnad_en, matn: record.display_matn_en }, record.en, formatText);
  const arabicText = partsMarkup({ isnad: record.display_isnad_ar, matn: record.display_matn_ar }, record.ar, formatText);
  const paths = chainMarkup(record.chains, source.compilation);
  const pageBreaks = record.source_page_breaks?.length
    ? `<div class="refrow"><dt>Printed page breaks</dt><dd>${record.source_page_breaks.map(page => esc(page)).join(', ')}</dd></div>` : '';
  const chainOnly = source.compilation.id === 'sad-ibn-abi-waqqas' && !record.display_matn_en && !record.display_matn_ar
    ? '<div class="editorial-note"><strong>Source note</strong><p>This numbered entry contains a transmission path without a separate matn in the supplied edition.</p></div>' : '';
  const commentaryMarker = 'قال أبو عيسى';
  const commentaryIndex = (record.ar || '').indexOf(commentaryMarker);
  const commentary = commentaryIndex < 0 ? '' : `<div class="editorial-note"><strong>Compiler's commentary</strong><div class="arabic" lang="ar" dir="rtl"><p class="matn">${formatText(record.ar.slice(commentaryIndex))}</p></div></div>`;
  return `${preface}<article class="hadith" id="hadith-${esc(id)}" aria-labelledby="label-${esc(id)}" data-hadith="${esc(id)}">
    <div class="hadith-label"><div class="hadith-count" id="label-${esc(id)}"><span>Entry</span><strong>${esc(number)}</strong><span>/ ${total}</span></div><div class="hadith-cite">${esc(source.compilation.title_en)} ${page ? `&middot; ${esc(page)}` : ''}</div></div>
    <div class="reading-sheet"><div class="bilingual">
      <div class="language-column column-en english" lang="en" dir="ltr"><div class="language-label">English</div>${english}</div>
      <div class="language-column column-ar arabic" lang="ar" dir="rtl"><div class="language-label"><span>العربية</span></div>${arabicText}</div>
    </div></div>
    <div class="details-grid"><section class="panel transmission" aria-labelledby="tx-${esc(id)}"><div class="panel-header"><h3 class="panel-title" id="tx-${esc(id)}">Transmission overview</h3><span class="panel-meta">${(record.chains || []).length} ${(record.chains || []).length === 1 ? 'path' : 'paths'}</span></div>${paths}<p class="chain-register-note">Linked names open their Rijāl Register entries. Unlinked names remain as supplied in the source transcription.</p></section>
    <section class="panel references" aria-labelledby="refs-${esc(id)}"><div class="panel-header"><h3 class="panel-title" id="refs-${esc(id)}">References &amp; footnotes</h3><span class="panel-meta">No. ${esc(number)}</span></div><dl class="refrows"><div class="refrow"><dt>Compilation</dt><dd>${esc(source.compilation.title_en)}</dd></div><div class="refrow"><dt>Source number</dt><dd>${esc(number)}</dd></div><div class="refrow"><dt>Edition</dt><dd>${esc(source.compilation.edition || 'Edition details were not recorded in the supplied source.')}</dd></div><div class="refrow"><dt>Edition page</dt><dd>${esc(page)}</dd></div><div class="refrow"><dt>Source record</dt><dd>${esc(id)}</dd></div>${pageBreaks}</dl>${chainOnly}${commentary}<div class="bottom-action"><button class="copy-btn" type="button" data-copy="${esc(id)}" aria-label="Copy entry ${esc(number)}">Copy narration</button><a class="permalink" href="#hadith-${esc(id)}">Permalink &#8599;</a></div></section></div>
  </article>`;
}
const interactionScript = `<script>
(()=>{const root=document.documentElement;const buttons=[...document.querySelectorAll('[data-mode-button]')];function setMode(mode){root.dataset.mode=mode;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modeButton===mode)));try{localStorage.setItem('shamail-reading-mode',mode)}catch(e){}}let mode='parallel';try{mode=localStorage.getItem('shamail-reading-mode')||'parallel'}catch(e){}if(!['english','arabic','parallel'].includes(mode))mode='parallel';setMode(mode);buttons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.modeButton)));const jump=document.getElementById('jump');jump?.addEventListener('change',()=>{if(jump.value)document.getElementById(jump.value)?.scrollIntoView({behavior:'smooth',block:'start'});jump.value=''});const progress=document.getElementById('progress');function update(){const max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.width=(max>0?scrollY/max*100:0)+'%'}addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const article=button.closest('article');const en=[...article.querySelectorAll('.english p.isnad, .english p.matn')].map(p=>p.innerText.trim()).filter(Boolean).join(String.fromCharCode(10,10));const ar=[...article.querySelectorAll('.arabic p.isnad, .arabic p.matn')].map(p=>p.innerText.trim()).filter(Boolean).join(String.fromCharCode(10,10));try{await navigator.clipboard.writeText([en,ar].filter(Boolean).join('\\n\\n'))}catch(e){}const old=button.textContent;button.textContent='Copied';setTimeout(()=>button.textContent=old,1600)}))})();
</script>`;

for (const config of configs) {
  const root = path.resolve('src/data/hadith-pages', config.source);
  const source = JSON.parse(fs.readFileSync(path.join(root, 'publication-source.json'), 'utf8'));
  resolver.linkNarratorIds(source);
  const recordsById = new Map(source.records.map(record => [String(record.id), record]));
  if (source.books.length !== config.expected) throw new Error(`${config.slug}: expected ${config.expected} chapters/sections, found ${source.books.length}.`);
  if (source.sections.length !== config.expected) throw new Error(`${config.slug}: expected ${config.expected} source sections, found ${source.sections.length}.`);
  const entries = source.books.map((book, index) => {
    const sectionNumbers = book.sectionNumbers ?? [book.number];
    const sections = sectionNumbers.map(n => source.sections.find(section => Number(section.number) === Number(n))).filter(Boolean);
    const records = sections.flatMap(section => section.recordIds.map(id => recordsById.get(String(id))).filter(Boolean));
    if (!records.length) throw new Error(`${config.slug}: empty section ${book.number}.`);
    const section = sections[0];
    return {
      n: Number(book.number ?? index + 1),
      title_en: book.titleEn || section.titleEn || `${config.itemNoun} ${book.number ?? index + 1}`,
      title_ar: book.titleAr || section.titleAr || '',
      first: String(records[0].id),
      last: String(records.at(-1).id),
      count: records.length,
      file: `chapters/${String(book.number ?? index + 1).padStart(2, '0')}.html`,
      records,
    };
  });
  const listedIds = entries.flatMap(entry => entry.records.map(record => String(record.id)));
  if (listedIds.length !== source.records.length || new Set(listedIds).size !== source.records.length) {
    throw new Error(`${config.slug}: chapter index does not cover every source record exactly once.`);
  }
  const chapterOutput = path.join(root, 'chapters');
  fs.mkdirSync(chapterOutput, { recursive: true });
  const chapterCount = entries.length;
  for (const [index, entry] of entries.entries()) {
    const previous = entries[index - 1], next = entries[index + 1];
    const firstPage = entry.records[0].page?.page;
    const lastPage = entry.records.at(-1).page?.page;
    const pages = firstPage ? `Edition pages ${firstPage}${lastPage && lastPage !== firstPage ? `–${lastPage}` : ''}` : `${entry.count} entries`;
    const title = `Chapter ${entry.n} - ${entry.title_en} | ${source.compilation.title_en} - HadithCritic`;
    const desc = `Read ${entry.count} source entries in ${config.itemNoun.toLowerCase()} ${entry.n} of ${source.compilation.title_en}, with Arabic and English text, linked transmitters, and references.`;
    const hero = `<section class="hero" aria-labelledby="chapter-title"><div class="hero-inner"><div class="breadcrumb"><a href="/hadith/">Corpus</a><span class="slash">/</span><a href="/hadith/collection/${config.slug}/">${esc(source.compilation.title_en)}</a><span class="slash">/</span><span>${config.itemNoun} ${String(entry.n).padStart(2,'0')}</span></div><div class="hero-grid"><div><div class="eyebrow">${esc(source.compilation.title_en)} · ${config.itemNoun} ${String(entry.n).padStart(2,'0')}</div><h1 id="chapter-title">${esc(entry.title_en)}</h1><p class="hero-desc">Read ${entry.count} entries in Arabic and English, with their transmission paths and source references.</p></div><div class="hero-right"><div class="hero-ar" lang="ar" dir="rtl">${esc(entry.title_ar)}</div><div class="hero-author">${esc(source.compilation.author?.name_en || '')}</div></div></div><div class="hero-footer"><span>${String(entry.n).padStart(2,'0')} / ${chapterCount} ${config.itemNoun.toLowerCase()}s</span><span>${entry.count} entries</span><span>${pages}</span></div></div></section>`;
    const options = entry.records.map(record => `<option value="hadith-${esc(record.id)}">Entry ${esc(record.number ?? record.id)}</option>`).join('');
    const toolbar = `<div class="toolbar-holder"><div class="toolbar"><span class="toolbar-title">${config.itemNoun} ${String(entry.n).padStart(2,'0')} · Read the entries</span><div class="toolbar-controls"><label for="jump" style="position:absolute;width:1px;height:1px;overflow:hidden">Jump to entry</label><select class="jump" id="jump"><option value="">Jump to an entry</option>${options}</select><div class="segmented" role="group" aria-label="Language display"><button type="button" data-mode-button="parallel" aria-pressed="true">Both</button><button type="button" data-mode-button="english" aria-pressed="false">English</button><button type="button" data-mode-button="arabic" aria-pressed="false">العربية</button></div></div></div></div>`;
    const main = `<main id="main-content" class="chapter"><div class="chapter-intro"><div><h2>${esc(entry.title_en)}</h2><p>All ${entry.count} source entries, in the compilation's supplied order.</p></div><a href="#hadith-${esc(entry.first)}">Start reading ↓</a></div>${entry.records.map(record => reportMarkup(record, entry.count, source)).join('\n')}<nav class="chapter-intro" aria-label="Chapter navigation"><div>${previous ? `<a href="/hadith/collection/${config.slug}/chapter/${previous.n}/">Previous ${config.itemNoun.toLowerCase()}</a>` : '<span></span>'}</div><a href="/hadith/collection/${config.slug}/">All ${config.itemNoun.toLowerCase()}s</a><div>${next ? `<a href="/hadith/collection/${config.slug}/chapter/${next.n}/">Next ${config.itemNoun.toLowerCase()}</a>` : '<span></span>'}</div></nav></main>`;
    const html = shell.replace('__TITLE__', esc(title)).replace('__DESCRIPTION__', esc(desc)).replace('__HERO__', hero).replace('__TOOLBAR__', toolbar).replace('__MAIN__', main).replace('__SCRIPT__', interactionScript);
    if (html.includes('__MAIN__') || /data-print|id=["']print/.test(html)) throw new Error(`${config.slug} chapter ${entry.n}: shell was not fully replaced or contains print UI.`);
    fs.writeFileSync(path.join(root, entry.file), `${readableHtml(html)}\n`, 'utf8');
  }
  const index = entries.map(({ records, ...item }) => item);
  fs.writeFileSync(path.join(root, 'chapter-index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  const narrationCount = source.records.filter(record => !(config.slug === 'birr-al-walidayn' && record.id === '0u1')).length;
  fs.writeFileSync(path.join(root, 'collection.html'), `${renderCollection(config, source, index, narrationCount)}\n`, 'utf8');
  const { audit, linkedForms: linked, totalForms } = resolver.buildAudit(source, path.basename(root) + '/publication-source.json');
  fs.writeFileSync(path.join(root, 'narrator-link-audit.json'), `${JSON.stringify(audit, null, 2)}
`, 'utf8');
  console.log(`Built ${config.slug}: ${entries.length} ${config.itemNoun.toLowerCase()} pages, ${narrationCount} narrations, ${linked}/${totalForms} unique narrator forms linked.`);
}
resolver.close();
