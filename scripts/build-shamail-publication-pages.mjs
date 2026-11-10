#!/usr/bin/env node
/* Build the 56 editable Al-Shama'il pages from the publication JSON. */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/data/hadith-pages/al-shama-il-al-muhammadiyah');
const sourcePath = path.join(root, 'publication-source.json');
const referencePath = path.join(root, 'user-supplied/HadithCritic_Shamail_Chapter_1_Avrea_Refined.html');
const collectionUrl = '/hadith/collection/al-shama-il-al-muhammadiyah/';
const chapterUrl = (n) => `${collectionUrl}chapter/${n}/`;
const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pad = (n) => String(n).padStart(2, '0');

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const collection = source.collection;
const book = source.books?.find((item) => Array.isArray(item.babs));
if (!collection || !book || book.babs.length !== 56) throw new Error(`Expected 56 chapters in publication JSON; found ${book?.babs?.length ?? 0}.`);
const records = book.babs.flatMap((bab) => bab.records ?? []);
if (records.length !== 415) throw new Error(`Expected 415 narrations in publication JSON; found ${records.length}.`);
const reference = fs.readFileSync(referencePath, 'utf8');
for (const marker of ['<section class="hero" aria-labelledby="chapter-title">', '<div class="toolbar-holder">', '<main id="main-content" class="chapter">', '<footer class="footer">']) {
  if (!reference.includes(marker)) throw new Error(`Chapter 1 reference is missing its ${marker} shell.`);
}

function narratorMarkup(narrators, pathIndex, pathCount, record) {
  if (!Array.isArray(narrators) || !narrators.length) throw new Error(`Narration ${record.id} has an empty transmission path.`);
  const ordered = [...narrators].reverse();
  const nodes = ordered.map((narrator, index) => {
    const name = narrator.en || narrator.normalized_name_ar || 'Unidentified transmitter';
    const role = index === 0
      ? '<span class="role">Earliest transmitter</span>'
      : index === ordered.length - 1 ? '<span class="role">Compiler</span>' : '';
    return `<li${narrator.narrator_id ? ` data-narrator-id="${esc(narrator.narrator_id)}"` : ''}><span class="chain-step">${pad(index + 1)}</span><span class="chain-en">${esc(name)}${role}</span><span class="chain-ar" lang="ar" dir="rtl">${esc(narrator.normalized_name_ar || '')}</span></li>`;
  }).join('');
  const title = pathCount > 1 ? `Transmission path ${pathIndex + 1} of ${pathCount}` : 'Transmission path';
  return `<div class="path"><p class="path-title">${title}</p><ol class="chain">${nodes}</ol></div>`;
}

function englishMarkup(record) {
  const isnad = record.display_isnad_en || '';
  const matn = record.display_matn_en || '';
  if (!isnad && !matn) return `<p class="matn">${esc(record.display_text_en || record.raw_text_en || '')}</p>`;
  return `${isnad ? `<div class="isnad-label">Isnad</div><p class="isnad">${esc(isnad)}</p>` : ''}${matn ? `<div class="matn-label">Matn</div><p class="matn">${esc(matn)}</p>` : ''}`;
}

function referencesMarkup(record) {
  const page = record.page_reference ? `1/${record.page_reference}` : 'No page locator recorded';
  const occurrence = record.source_number_occurrence > 1
    ? `<div class="refrow"><dt>Number occurrence</dt><dd>${record.source_number_occurrence}</dd></div>` : '';
  const notes = (record.review?.unresolved ?? []).map((note) => `<p>${esc(note)}</p>`).join('');
  const marker = String.fromCodePoint(0x642, 0x627, 0x644, 0x20, 0x623, 0x628, 0x648, 0x20, 0x639, 0x64a, 0x633, 0x649);
  const commentaryAt = (record.raw_text_ar || '').indexOf(marker);
  const commentary = commentaryAt < 0 ? '' : `<div class="editorial-note"><strong>Compiler's commentary</strong><div class="arabic" lang="ar" dir="rtl"><p class="matn">${esc(record.raw_text_ar.slice(commentaryAt).trim())}</p></div></div>`;
  const editorial = `${commentary}${notes ? `<div class="editorial-note"><strong>Editorial note</strong>${notes}</div>` : ''}`;
  return `<section class="panel references" aria-labelledby="refs-${esc(record.id)}"><div class="panel-header"><h3 class="panel-title" id="refs-${esc(record.id)}">References &amp; footnotes</h3><span class="panel-meta">No. ${esc(record.source_number)}</span></div><dl class="refrows"><div class="refrow"><dt>Collection</dt><dd>${esc(collection.title_en)}</dd></div><div class="refrow"><dt>Hadith number</dt><dd>${esc(record.source_number)}</dd></div>${occurrence}<div class="refrow"><dt>Edition</dt><dd>${esc(collection.edition)}</dd></div><div class="refrow"><dt>Edition page</dt><dd>${esc(page)}</dd></div><div class="refrow"><dt>Source record</dt><dd>${esc(record.id)}</dd></div></dl>${editorial}<div class="bottom-action"><button class="copy-btn" type="button" data-copy="${esc(record.id)}" aria-label="Copy narration ${esc(record.source_number)}">Copy narration</button><a class="permalink" href="#hadith-${esc(record.id)}">Permalink &#8599;</a></div></section>`;
}

function hadithMarkup(record, total) {
  const page = record.page_reference ? `p. ${record.page_reference}` : '';
  const chains = record.chains ?? [];
  const paths = chains.map((chain, index) => narratorMarkup(chain.narrators, index, chains.length, record)).join('');
  const arabic = record.display_text_ar || record.raw_text_ar || '';
  return `<article class="hadith" id="hadith-${esc(record.id)}" aria-labelledby="label-${esc(record.id)}" data-hadith="${esc(record.id)}">
  <div class="hadith-label"><div class="hadith-count" id="label-${esc(record.id)}"><span>Hadith</span><strong>${esc(record.source_number)}</strong><span>/ ${total}</span></div><div class="hadith-cite">${esc(collection.short_name)}${page ? ` &middot; ${page}` : ''}</div></div>
  <div class="reading-sheet"><div class="bilingual">
    <div class="language-column column-en english" lang="en" dir="ltr"><div class="language-label">English</div>${englishMarkup(record)}</div>
    <div class="language-column column-ar arabic" lang="ar" dir="rtl"><div class="language-label"><span>&#x627;&#x644;&#x639;&#x631;&#x628;&#x64A;&#x629;</span></div><p class="matn">${esc(arabic)}</p></div>
  </div></div>
  <div class="details-grid"><section class="panel transmission" aria-labelledby="tx-${esc(record.id)}"><div class="panel-header"><h3 class="panel-title" id="tx-${esc(record.id)}">Transmission overview</h3><span class="panel-meta">${chains.length} ${chains.length === 1 ? 'path' : 'paths'}</span></div>${paths}</section>${referencesMarkup(record)}</div>
</article>`;
}

function heroMarkup(chapter, chapterCount) {
  const title = chapter.title_en || `Chapter ${chapter.sequence}`;
  const firstPage = chapter.records[0]?.page_reference;
  const lastPage = chapter.records.at(-1)?.page_reference;
  const pages = firstPage ? `Edition pages ${firstPage}${lastPage && lastPage !== firstPage ? `&ndash;${lastPage}` : ''}` : `${chapter.records.length} narrations`;
  const number = pad(chapter.sequence);
  return `<section class="hero" aria-labelledby="chapter-title"><div class="hero-inner"><div class="breadcrumb"><a href="/hadith/">Corpus</a><span class="slash">/</span><a href="${collectionUrl}">${esc(collection.short_name)}</a><span class="slash">/</span><span>Chapter ${number}</span></div><div class="hero-grid"><div><div class="eyebrow">${esc(collection.title_en)} &middot; Chapter ${number}</div><h1 id="chapter-title">${esc(title)}</h1><p class="hero-desc">Read all ${chapter.records.length} narrations in Arabic and English, with their transmission paths and references.</p></div><div class="hero-right"><div class="hero-ar" lang="ar" dir="rtl">${esc(chapter.title_ar || '')}</div><div class="hero-author">${esc(collection.author.name_en)}</div></div></div><div class="hero-footer"><span>${number} / ${chapterCount} chapters</span><span>${chapter.records.length} narrations</span><span>${pages}</span></div></div></section>`;
}

function toolbarMarkup(chapter) {
  const options = chapter.records.map((record) => `<option value="hadith-${esc(record.id)}">Hadith ${esc(record.source_number)}</option>`).join('');
  return `<div class="toolbar-holder"><div class="toolbar"><span class="toolbar-title">Chapter ${pad(chapter.sequence)} &middot; Read the narrations</span><div class="toolbar-controls"><label for="jump" style="position:absolute;width:1px;height:1px;overflow:hidden">Jump to hadith</label><select class="jump" id="jump"><option value="">Jump to a narration</option>${options}</select><div class="segmented" role="group" aria-label="Language display"><button type="button" data-mode-button="parallel" aria-pressed="true">Both</button><button type="button" data-mode-button="english" aria-pressed="false">English</button><button type="button" data-mode-button="arabic" aria-pressed="false">&#x627;&#x644;&#x639;&#x631;&#x628;&#x64A;&#x629;</button></div></div></div></div>`;
}

function mainMarkup(chapter) {
  const title = chapter.title_en || `Chapter ${chapter.sequence}`;
  const previous = chapter.sequence > 1 ? `<a href="${chapterUrl(chapter.sequence - 1)}">Previous chapter</a>` : '<span></span>';
  const next = chapter.sequence < book.babs.length ? `<a href="${chapterUrl(chapter.sequence + 1)}">Next chapter</a>` : '<span></span>';
  return `<main id="main-content" class="chapter"><div class="chapter-intro"><div><h2>${esc(title)}</h2><p>All ${chapter.records.length} reports, in the compilation's original order.</p></div><a href="#hadith-${esc(chapter.records[0].id)}">Start reading &#8595;</a></div>${chapter.records.map((record) => hadithMarkup(record, chapter.records.length)).join('\n')}<nav class="chapter-intro" aria-label="Chapter navigation"><div>${previous}</div><a href="${collectionUrl}">All chapters</a><div>${next}</div></nav></main>`;
}

const interactionScript = `<script>
(()=>{
 const root=document.documentElement;
 const modeButtons=[...document.querySelectorAll('[data-mode-button]')];
 function setMode(mode){root.dataset.mode=mode;modeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.modeButton===mode)));try{localStorage.setItem('shamail-reading-mode',mode)}catch(e){}}
 let mode='parallel';try{mode=localStorage.getItem('shamail-reading-mode')||'parallel'}catch(e){}if(!['english','arabic','parallel'].includes(mode))mode='parallel';setMode(mode);
 modeButtons.forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.modeButton)));
 const jump=document.getElementById('jump');jump?.addEventListener('change',()=>{if(jump.value)document.getElementById(jump.value)?.scrollIntoView({behavior:'smooth',block:'start'});jump.value=''});
 const progress=document.getElementById('progress');function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);updateProgress();
 async function copy(text){try{await navigator.clipboard.writeText(text)}catch(e){const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();document.execCommand('copy');area.remove()}}
 document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const article=button.closest('article');const english=[...article.querySelectorAll('.english .isnad,.english .matn')].map(node=>node.innerText.trim()).filter(Boolean).join('\\n\\n');const arabic=article.querySelector('.arabic .matn')?.innerText.trim()||'';await copy([english,arabic].filter(Boolean).join('\\n\\n'));const previous=button.textContent;button.textContent='Copied';setTimeout(()=>button.textContent=previous,1700)}));
})();
</script>`;

const shell = reference
  .replace(/<title>[\s\S]*?<\/title>/, '<title>__PAGE_TITLE__</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="__PAGE_DESCRIPTION__">')
  // BaseLayout supplies the real site navigation. Strip any header chrome
  // carried by the editable reference so it cannot render as a second navbar.
  .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '')
  .replace(/\.site-header\s*\{[^}]*\}/g, '')
  // Chapter pages keep reading modes and copy controls, but have no print UI.
  .replace(/<button\b[^>]*(?:id=["']print["']|data-print)[^>]*>[\s\S]*?<\/button>/gi, '')
  .replace(/<section class="hero" aria-labelledby="chapter-title">[\s\S]*?<\/section>/, '__HERO__')
  .replace(/<div class="toolbar-holder">[\s\S]*?(?=<main id="main-content" class="chapter">)/, '__TOOLBAR__')
  .replace(/<main id="main-content" class="chapter">[\s\S]*?<\/main>/, '__MAIN__')
  .replace(/<script>[\s\S]*?<\/script>/, '__SCRIPT__');

const entries = [];
for (const [index, chapter] of book.babs.entries()) {
  const n = chapter.sequence ?? index + 1;
  if (n !== index + 1 || !chapter.records?.length) throw new Error(`Unexpected sequence or empty chapter at position ${index + 1}.`);
  const page = shell
    .replace('__PAGE_TITLE__', `Chapter ${n} - ${esc(chapter.title_en)} | ${esc(collection.title_en)} - HadithCritic`)
    .replace('__PAGE_DESCRIPTION__', `Read all ${chapter.records.length} narrations in Chapter ${n} of ${esc(collection.title_en)}, with their Arabic and English texts, transmission paths, and references.`)
    .replace('__HERO__', heroMarkup(chapter, book.babs.length))
    .replace('__TOOLBAR__', toolbarMarkup(chapter))
    .replace('__MAIN__', mainMarkup(chapter))
    .replace('__SCRIPT__', interactionScript);
  const relative = `chapters/${String(n).padStart(2, '0')}.html`;
  fs.writeFileSync(path.join(root, relative), page, 'utf8');
  entries.push({ n, title_en: chapter.title_en, title_ar: chapter.title_ar, first: Number(chapter.records[0].id), last: Number(chapter.records.at(-1).id), count: chapter.records.length, file: relative });
}
fs.writeFileSync(path.join(root, 'chapter-index.json'), `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
console.log(`Built ${entries.length} chapter pages containing ${records.length} narrations from ${path.basename(sourcePath)}.`);
