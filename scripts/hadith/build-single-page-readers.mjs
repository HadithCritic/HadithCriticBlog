#!/usr/bin/env node
/*
 * Builds the single-page reader of every collection that is one run of narrations with no chapters of its
 * own: a fascicle, a notebook, a short book. The page follows the reader of Ṣaḥīfat Hammām ibn Munabbih, whose
 * stylesheet it reuses: an index of every narration beside the text, one narration at a time or all of them
 * in a continuous view, and the edition notes and opening material on a separate tab.
 *
 * Collections with chapters (a musnad by Companion, a sunan by bāb) keep their chapter pages and are built by
 * scripts/hadith/build-abu-hanifa-mubarak-pages.mjs. The list of single-page collections is SINGLE_PAGE in
 * scripts/hadith/lib/renovated-readers.mjs; both builders read it, so a collection is built by exactly one of them.
 *
 * Reads  src/data/hadith/pages/<slug>/publication-source.json
 * Writes src/data/hadith/pages/<slug>/reader.html and reader-meta.json, and src/pages/hadith/collection/<slug>.astro
 *
 * Usage: node scripts/hadith/build-single-page-readers.mjs [slug ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { toPlainEnglish } from './lib/plain-english.mjs';
import { resolveParts } from './lib/reader-parts.mjs';
import { secondCenturyConfigs, treatiseConfigs } from './lib/compilation-adapters.mjs';
import { SINGLE_PAGE } from './lib/renovated-readers.mjs';

const root = path.resolve('src/data/hadith/pages');
const only = process.argv.slice(2);
const configs = [...secondCenturyConfigs, ...treatiseConfigs];
const titles = new Map(JSON.parse(fs.readFileSync('src/data/hadith/reader-editions.json', 'utf8')).map(item => [item.slug, item]));
const shellStyle = fs.readFileSync(path.join(root, 'sahifat-hammam-ibn-munabbih/reader.html'), 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const tidy = value => String(value ?? '').replace(/[\u200c\u200f]/g, '').replace(/[ \t]+/g, ' ').trim();
const slugId = id => String(id).replace(/[:.]/g, '-');
const plural = (count, noun) => `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`;

const EXTRA_STYLE = `
.sf-shell a.sf-link-main{color:var(--paperInk)}
.sf-shell .sf-page__en,.sf-shell .sf-page__ar{margin:0}
.sf-shell .sf-part{display:block;font:600 10px/1.4 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--paperMuted);margin:0 0 9px}
.sf-shell .sf-page__col--ar .sf-part{letter-spacing:0;font-size:11px}
.sf-shell .sf-isnad{margin:0 0 22px;font-size:.8em;line-height:1.62;font-style:italic;color:var(--paperMuted)}
.sf-shell .sf-page__col--ar .sf-isnad{font-style:normal}
.sf-shell .sf-matn{margin:0}.sf-shell .sf-matn+.sf-matn{margin-top:.9em}
.sf-shell .sf-tochead{padding:15px 16px 7px;font:600 10px/1.45 var(--ui);letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.sf-shell .sf-heading-line{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;align-items:baseline;margin:0 0 16px;padding:13px 18px;border:1px solid var(--rule);border-radius:10px;background:var(--s1)}
.sf-shell .sf-heading-line b{font:500 17px/1.35 var(--serif);color:var(--ink)}
.sf-shell .sf-heading-line span{font:400 19px/1.6 var(--arabic);color:var(--muted)}
.sf-shell .sf-heading-line[hidden]{display:none}
.sf-shell .sf-notes{margin:14px 0 0;padding:14px 18px;border:1px solid var(--rule-low);border-radius:10px;font:400 13px/1.65 var(--ui);color:var(--muted)}
.sf-shell .sf-notes strong{display:block;font:600 10px/1.4 var(--ui);letter-spacing:.14em;text-transform:uppercase;color:var(--quiet);margin-bottom:6px}
.sf-shell .sf-notes p{margin:0}.sf-shell .sf-notes p+p{margin-top:8px}.sf-shell .sf-notes[hidden]{display:none}
.sf-shell .sf-about__panel h5{margin:18px 0 6px;font:600 11px/1.4 var(--ui);letter-spacing:.1em;text-transform:uppercase;color:var(--quiet)}
.sf-shell .sf-about__panel h5:first-of-type{margin-top:0}
.sf-shell .sf-about__panel p{margin:0;font:400 14px/1.7 var(--ui);color:var(--muted)}
.sf-shell .sf-intro-par[lang=ar]{font:400 20px/2 var(--arabic);margin-top:14px}
`;

function reportsOf(config, source) {
  const groups = config.groupsFor(source);
  const reading = groups.filter(group => group.kind !== 'apparatus');
  if (reading.length !== 1) throw new Error(`${config.slug}: a single-page reader needs one run of narrations, found ${reading.length} divisions.`);
  const group = reading[0];
  const opening = [];
  const frame = item => opening.push({ title: item.title_en || 'Source text', page: item.page ?? null, en: toPlainEnglish(tidy(item.en)), ar: tidy(item.ar) });
  (group.frames_before ?? []).forEach(frame);
  const reports = group.records.map(record => {
    const text = config.textFor(record);
    const resolvedParts = record.no_split ? { en: {}, ar: {} } : resolveParts(text, config.partsFor(record));
    const parts = { ...resolvedParts, ...(record.no_split_ar ? { ar: {} } : {}) };
    const side = language => {
      const isnad = tidy(parts[language].isnad);
      const matn = tidy(parts[language].matn);
      const whole = isnad || matn ? { isnad, matn } : { isnad: '', matn: tidy(text[language]) };
      const more = (record.continuations ?? []).map(item => tidy(language === 'en' ? item.text_en : item.text_ar)).filter(Boolean);
      return { isnad: whole.isnad, matn: [whole.matn, ...more].filter(Boolean).join('\n\n') };
    };
    const en = side('en');
    const ar = side('ar');
    if (!en.matn && !en.isnad || !ar.matn && !ar.isnad) throw new Error(`${config.slug}: report ${record.id} is missing one of its languages.`);
    const lead = record.lead ?? [];
    lead.filter(item => item.kind === 'frame').forEach(frame);
    const heading = lead.filter(item => item.kind === 'heading').at(-1);
    const number = String(config.numberFor(record));
    const notes = [
      ...(record.translator_notes ?? []),
      ...(record.notes ?? []),
      ...(record.flags ?? []).map(flag => `Source flag: ${flag}`),
      ...(record.remarks ?? []).map(item => item.en).filter(Boolean),
      ...(record.footnotes ?? []).map(item => item.en).filter(Boolean),
    ].map(note => toPlainEnglish(tidy(note)));
    return {
      id: `hadith-${slugId(record.id)}`,
      label: number,
      noun: record.noun || source.compilation.unit_noun || 'Narration',
      page: record.page ?? null,
      ...(heading ? { heading: { en: toPlainEnglish(heading.en), ar: heading.ar } } : {}),
      isnad_en: toPlainEnglish(en.isnad), matn_en: toPlainEnglish(en.matn),
      isnad_ar: ar.isnad, matn_ar: ar.matn,
      whole_en: Boolean(record.no_split), whole_ar: Boolean(record.no_split || record.no_split_ar),
      ...(notes.length ? { notes } : {}),
      preview: toPlainEnglish(en.matn || en.isnad).replace(/\*/g, '').replace(/\s+/g, ' ').slice(0, 96),
    };
  });
  (group.frames_after ?? []).forEach(frame);
  for (const appendix of groups.filter(item => item.kind === 'apparatus')) {
    for (const section of appendix.sections ?? []) opening.push({ title: section.title_en || appendix.title_en, page: section.page ?? null, en: toPlainEnglish(tidy(section.en)), ar: tidy(section.ar) });
  }
  return { reports, opening };
}

function titleLines(title) {
  const at = title.indexOf(' of ');
  if (at > 0) return [title.slice(0, at), title.slice(at + 1)];
  const words = title.split(' ');
  if (words.length < 3) return [title];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

function markup(config, source, reports, opening) {
  const meta = source.compilation;
  const title = titles.get(config.slug)?.title_en ?? meta.title_en;
  const titleAr = titles.get(config.slug)?.title_ar ?? meta.title_ar ?? '';
  const short = meta.short_name || title;
  const unit = (meta.unit_noun || 'Narration').toLowerCase();
  const notes = config.notesFor(source).filter(note => note.text && note.label !== 'Coverage');
  const facts = notes.filter(note => note.text.length <= 110);
  const prose = notes.filter(note => note.text.length > 110);
  const blurb = meta.description_en || `${title}, presented in Arabic and English in the order of the source.`;
  const count = reports.length;
  const firstTitle = `${reports[0].noun} ${reports[0].label}`;
  const openingMarkup = opening.length
    ? `<div class="sf-about__full"><h4>The opening and closing material</h4><p>Title pages, the chain through which the copy was transmitted, and notes that frame the text are kept here. They are not counted among the ${unit}s.</p>${opening.map((item, index) => `<details><summary>${String(index + 1).padStart(2, '0')} &nbsp; ${esc(item.title)}${item.page ? ` · p. ${esc(item.page)}` : ''} <span>Read full text ↓</span></summary>${item.en ? `<p class="sf-intro-par">${esc(item.en)}</p>` : ''}${item.ar ? `<p class="sf-intro-par" lang="ar" dir="rtl">${esc(item.ar)}</p>` : ''}</details>`).join('')}</div>`
    : '';
  return `<div class="sf-shell">
<a class="sf-skip" href="#sf-main">Skip to the text</a>

<section class="sf-hero" aria-labelledby="sf-title"><div class="sf-container sf-hero__layout"><div>
<div class="sf-crumb"><a href="/hadith/">Hadith library</a><b>/</b><span>Collections</span><b>/</b><span>${esc(short)}</span></div>
<p class="sf-kicker">The early hadith corpus &nbsp; / &nbsp; ${esc(meta.kind_en || 'A reading edition')}</p>
<h1 class="sf-title" id="sf-title">${titleLines(title).map(line => `<span>${esc(line)}</span>`).join('')}</h1>
<p class="sf-subtitle">${esc(toPlainEnglish(blurb))}</p>
<div class="sf-hero__links"><a class="sf-link-main" href="#sf-main">Begin reading <span aria-hidden="true">↗</span></a><a class="sf-link-sub" href="#sf-main" id="sf-about-link">About this edition ↗</a></div>
</div><aside class="sf-summary" aria-label="Edition overview"><div><div class="sf-summary__eyebrow">Inside this edition</div><div class="sf-summary__num">${count}</div><div class="sf-summary__label">${esc(unit)}s in one undivided text</div></div><dl class="sf-summary__rows"><div class="sf-summary__row"><dt>${config.authority ? 'Attributed to' : 'Compiler'}</dt><dd>${esc(config.compiler)}</dd></div><div class="sf-summary__row"><dt>Death date</dt><dd>${esc(config.death)} AH</dd></div><div class="sf-summary__row"><dt>Languages</dt><dd>Arabic / English</dd></div><div class="sf-summary__row"><dt>Arrangement</dt><dd>Source order</dd></div></dl></aside>
</div></section>
<div class="sf-container" id="sf-main" tabindex="-1">
<div class="sf-section-head"><div><p class="sf-kicker" style="margin:0">${esc(titleAr)}</p><h2>The reading room</h2></div><div class="sf-section-head__hint">Find a ${esc(unit)}, switch languages, or move through the text one entry at a time.</div></div>
<div class="sf-reader">
<aside class="sf-rail" id="sf-rail" aria-label="Contents"><div class="sf-rail__top"><h3 class="sf-rail__title">Contents <span>${count}</span></h3><label class="sf-rail__search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input type="search" id="sf-search" autocomplete="off" placeholder="Search text or number" aria-label="Search the text"></label><p class="sf-rail__count" id="sf-results-count">${plural(count, 'entry').replace('entrys', 'entries')} · In source order</p></div><div class="sf-rail__list" id="sf-toc" role="group" aria-label="Choose an entry"></div><div class="sf-rail__foot"><span>Edition notes are separate</span><button type="button" id="sf-rail-about">View →</button><button type="button" id="sf-close-index" class="sf-mobile-index">Close ✕</button></div></aside>
<div class="sf-workspace">
<div class="sf-toolbar"><button class="sf-tool-sm sf-mobile-index" id="sf-open-index" type="button" aria-expanded="false" aria-controls="sf-rail">Contents</button><div class="sf-toolbar__tabs" role="tablist" aria-label="Reader section"><button type="button" class="sf-tab is-active" id="sf-tab-read" aria-selected="true" role="tab">Read the text</button><button type="button" class="sf-tab" id="sf-tab-about" aria-selected="false" role="tab">About &amp; transmission</button></div><div class="sf-toolbar__right"><div class="sf-mode" role="group" aria-label="Reading language"><button type="button" data-mode="parallel" class="is-active" aria-pressed="true">Both</button><button type="button" data-mode="en" aria-pressed="false">English</button><button type="button" data-mode="ar" aria-pressed="false">العربية</button></div><div class="sf-stepper" role="group" aria-label="Text size"><button id="sf-smaller" aria-label="Reduce text size" type="button">−</button><span>Text</span><button id="sf-bigger" aria-label="Increase text size" type="button">+</button></div><button class="sf-tool-sm" id="sf-continuous" type="button" aria-pressed="false">Continuous ↗</button></div></div>
<section class="sf-reading" id="sf-reading" aria-label="Reader"><div class="sf-reading__header"><div><span class="sf-reading__label" id="sf-location">${esc(short)} · 1 of ${count}</span><h3 class="sf-reading__title" id="sf-report-title">${esc(firstTitle)}</h3></div><div class="sf-reading__actions"><button type="button" id="sf-copy-link">Copy link</button><button type="button" id="sf-copy-text">Copy text</button></div></div><div class="sf-progress"><span id="sf-progress-fill"></span></div>
<div class="sf-heading-line" id="sf-heading" hidden><b></b><span lang="ar" dir="rtl"></span></div>
<article class="sf-page" id="sf-current" data-mode="parallel" aria-live="polite"><div class="sf-page__col sf-page__col--en"><div class="sf-page__meta"><span>English</span><span>Translation</span></div><div class="sf-page__en" id="sf-english"></div></div><div class="sf-page__col sf-page__col--ar"><div class="sf-page__meta"><span>العربية</span><span>Source text</span></div><div class="sf-page__ar" lang="ar" dir="rtl" id="sf-arabic"></div></div></article>
<div class="sf-notes" id="sf-notes" hidden></div>
<div class="sf-reader-note"><span id="sf-source-note"></span><span><strong>Note:</strong> Edition details and opening material are in About &amp; transmission.</span></div><nav class="sf-navnext" aria-label="Move between entries"><button type="button" class="sf-nextbtn" id="sf-prev" disabled><span class="sf-nextbtn__eyebrow">← Previous</span><span class="sf-nextbtn__title" id="sf-prev-title"></span><span class="sf-nextbtn__excerpt" id="sf-prev-excerpt"></span></button><button type="button" class="sf-nextbtn" id="sf-next"><span class="sf-nextbtn__eyebrow">Next →</span><span class="sf-nextbtn__title" id="sf-next-title"></span><span class="sf-nextbtn__excerpt" id="sf-next-excerpt"></span></button></nav>
<div class="sf-bottomline"><span>Prefer a long-form document?</span><button type="button" id="sf-stream-from-bottom">Read the whole text continuously ↗</button></div></section>
<section class="sf-stream" id="sf-stream" aria-label="Continuous reading"><div class="sf-stream__head"><div><h3>The whole text</h3><p>${plural(count, 'entry').replace('entrys', 'entries')} · English and Arabic · In source order</p></div><button type="button" id="sf-exit-stream">Single-entry view</button></div><div id="sf-stream-list"></div></section>
<section class="sf-about" id="sf-about" aria-label="Edition and introduction"><div class="sf-about__hero"><p class="sf-kicker">Context &amp; provenance</p><h3>About this edition.</h3><p>${esc(toPlainEnglish(blurb))}</p></div>
<div class="sf-about__grid"><div class="sf-about__panel"><h4>The edition</h4><ul class="sf-source-list"><li><span>Text</span><strong>${esc(title)}</strong></li><li><span>${config.authority ? 'Attributed to' : 'Compiler'}</span><strong>${esc(config.compiler)} (d. ${esc(config.death)} AH)</strong></li>${facts.map(note => `<li><span>${esc(note.label)}</span><strong>${esc(toPlainEnglish(note.text))}</strong></li>`).join('')}<li><span>Extent</span><strong>${plural(count, unit)}</strong></li></ul></div><div class="sf-about__panel"><h4>How the text is presented</h4>${prose.map(note => `<h5>${esc(note.label)}</h5><p>${esc(toPlainEnglish(note.text))}</p>`).join('')}</div></div>
${openingMarkup}</section>
</div></div></div>

</div><div id="sf-toast" class="sf-toast" role="status" aria-live="polite"></div>
<script type="application/json" id="sf-data">${JSON.stringify({ short, reports }).replace(/</g, '\\u003c')}</script>
<script>
${READER_SCRIPT}
</script>`;
}

const READER_SCRIPT = String.raw`(()=>{'use strict';
const data=JSON.parse(document.getElementById('sf-data').textContent);const reports=data.reports;const $=(s)=>document.querySelector(s);const $$=(s)=>[...document.querySelectorAll(s)];
const state={index:0,mode:'parallel',stream:false,about:false,size:0,query:''};
const el={rail:$('#sf-rail'),toc:$('#sf-toc'),search:$('#sf-search'),count:$('#sf-results-count'),current:$('#sf-current'),english:$('#sf-english'),arabic:$('#sf-arabic'),location:$('#sf-location'),title:$('#sf-report-title'),source:$('#sf-source-note'),heading:$('#sf-heading'),notes:$('#sf-notes'),progress:$('#sf-progress-fill'),prev:$('#sf-prev'),next:$('#sf-next'),pTitle:$('#sf-prev-title'),nTitle:$('#sf-next-title'),pExcerpt:$('#sf-prev-excerpt'),nExcerpt:$('#sf-next-excerpt'),about:$('#sf-about'),reading:$('#sf-reading'),stream:$('#sf-stream'),streamList:$('#sf-stream-list'),toast:$('#sf-toast')};
const numbered=r=>/\d/.test(r.label);
function label(r){return numbered(r)?r.noun+' '+r.label:r.noun;}
function cite(r){return [data.short,numbered(r)?'no. '+r.label:'unnumbered',r.page?'p. '+r.page:''].filter(Boolean).join(' · ');}
// The section a report stands under is the last heading at or before it.
const headingAt=[];let running=null;reports.forEach((r,i)=>{if(r.heading)running=r.heading;headingAt[i]=running;});
function paragraphs(node,cls,raw,emphasis){for(const part of String(raw||'').split(/\n\n+/)){if(!part.trim())continue;const p=document.createElement('p');p.className=cls;for(const chunk of part.split(/(ﷺ)/g)){if(!chunk)continue;if(chunk==='ﷺ'){const s=document.createElement('span');s.className='sf-honorific';s.textContent=chunk;p.appendChild(s);continue;}if(!emphasis){p.appendChild(document.createTextNode(chunk));continue;}for(const bit of chunk.split(/(\*[^*\n]*[A-Za-z][^*\n]*\*)/g)){if(!bit)continue;if(bit.length>2&&bit[0]==='*'&&bit.at(-1)==='*'){const em=document.createElement('em');em.textContent=bit.slice(1,-1);p.appendChild(em);}else p.appendChild(document.createTextNode(bit));}}node.appendChild(p);}}
function fill(node,isnad,matn,english,whole=false){node.replaceChildren();const tag=(text)=>{const s=document.createElement('span');s.className='sf-part';s.textContent=text;node.appendChild(s);};if(whole){tag(english?'Source text':'النص الكامل');paragraphs(node,'sf-matn',[isnad,matn].filter(Boolean).join(' '),english);return;}if(isnad){tag(english?'Isnad':'الإسناد');paragraphs(node,'sf-isnad',isnad,english);tag(english?'Matn':'المتن');}paragraphs(node,'sf-matn',matn,english);}
function setHash(){const id=reports[state.index].id;if(location.hash!=='#'+id)history.replaceState(null,'','#'+id);}
function toast(msg){el.toast.textContent=msg;el.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.toast.classList.remove('show'),2200);}
function scrollRail(){const chosen=el.toc.querySelector('.is-active');if(chosen&&el.rail.offsetParent!==null){const box=el.toc.getBoundingClientRect(),item=chosen.getBoundingClientRect();if(item.top<box.top||item.bottom>box.bottom)el.toc.scrollTop+=item.top-box.top-box.height/3;}}
function renderToc(){const q=state.query.trim().toLocaleLowerCase();el.toc.replaceChildren();let count=0;const fragment=document.createDocumentFragment();reports.forEach((r,i)=>{const hay=[r.label,r.noun,r.page||'',r.isnad_en,r.matn_en,r.isnad_ar,r.matn_ar,headingAt[i]?headingAt[i].en:''].join(' ');
if(q&&!hay.toLocaleLowerCase().includes(q))return;count++;if(r.heading&&!q){const h=document.createElement('div');h.className='sf-tochead';h.textContent=r.heading.en;fragment.appendChild(h);}const b=document.createElement('button');b.type='button';b.className='sf-tocitem'+(i===state.index&&!state.about?' is-active':'');b.dataset.index=i;b.setAttribute('aria-current',i===state.index&&!state.about?'true':'false');
const num=document.createElement('span');num.className='sf-tocitem__num';num.textContent=numbered(r)?r.label.padStart(2,'0'):'—';const body=document.createElement('span');body.className='sf-tocitem__body';const name=document.createElement('span');name.className='sf-tocitem__name';name.textContent=label(r);const excerpt=document.createElement('span');excerpt.className='sf-tocitem__excerpt';excerpt.textContent=r.preview;body.append(name,excerpt);b.append(num,body);b.addEventListener('click',()=>{go(i);closeIndex();});fragment.appendChild(b);});el.toc.append(fragment);if(!count){const empty=document.createElement('div');empty.className='sf-tocempty';empty.textContent='Nothing matches this search. Try another word or a number.';el.toc.append(empty);}el.count.textContent=q?count+' matching '+(count===1?'entry':'entries'):reports.length+' entries · In source order';}
function notesNode(node,r){node.replaceChildren();node.hidden=!(r.notes&&r.notes.length);if(node.hidden)return;const s=document.createElement('strong');s.textContent='Notes';node.appendChild(s);for(const note of r.notes){const p=document.createElement('p');p.textContent=note;node.appendChild(p);}}
function renderCurrent(){const r=reports[state.index];el.location.textContent=data.short+' · '+(state.index+1)+' of '+reports.length;el.title.textContent=label(r);const head=headingAt[state.index];el.heading.hidden=!head;if(head){el.heading.querySelector('b').textContent=head.en;el.heading.querySelector('span').textContent=head.ar||'';}fill(el.english,r.isnad_en,r.matn_en,true,r.whole_en);fill(el.arabic,r.isnad_ar,r.matn_ar,false,r.whole_ar);notesNode(el.notes,r);el.source.textContent=cite(r);el.progress.style.width=((state.index+1)/reports.length*100)+'%';el.prev.disabled=state.index===0;el.next.disabled=state.index===reports.length-1;for(const [delta,t,x] of [[-1,el.pTitle,el.pExcerpt],[1,el.nTitle,el.nExcerpt]]){const next=reports[state.index+delta];t.textContent=next?label(next):'';x.textContent=next?next.preview:'';}renderToc();scrollRail();}
function go(i,{scroll=true}={}){if(i<0||i>=reports.length)return;state.index=i;state.about=false;if(state.stream){const target=document.getElementById(reports[i].id);if(target){target.scrollIntoView({behavior:'smooth',block:'start'});renderToc();}else{toggleStream(false);renderCurrent();}}else{renderCurrent();if(scroll)$('#sf-main').scrollIntoView({behavior:'smooth',block:'start'});}setHash();tabs();}
function closeIndex(){el.rail.classList.remove('is-mobile-open');$('#sf-open-index').setAttribute('aria-expanded','false');}
function tabs(){$('#sf-tab-about').classList.toggle('is-active',state.about);$('#sf-tab-read').classList.toggle('is-active',!state.about);$('#sf-tab-about').setAttribute('aria-selected',state.about);$('#sf-tab-read').setAttribute('aria-selected',!state.about);el.about.classList.toggle('is-open',state.about);el.reading.classList.toggle('is-hidden',state.about||state.stream);el.stream.classList.toggle('is-open',!state.about&&state.stream);el.rail.classList.toggle('is-hidden',state.about);el.rail.parentElement.classList.toggle('sf-reader--about',state.about);$$('[data-mode]').forEach(b=>{if(!b.matches('button'))return;const yes=b.dataset.mode===state.mode;b.classList.toggle('is-active',yes);b.setAttribute('aria-pressed',yes);});el.current.dataset.mode=state.mode;el.streamList.querySelectorAll('.sf-page').forEach(p=>p.dataset.mode=state.mode);}
function setAbout(yes){state.about=yes;if(yes){state.stream=false;$('#sf-continuous').textContent='Continuous ↗';$('#sf-continuous').setAttribute('aria-pressed','false');}closeIndex();tabs();renderToc();$('#sf-main').scrollIntoView({behavior:'smooth'});if(!yes)renderCurrent();}
function pageNode(r){const page=document.createElement('article');page.className='sf-page';page.dataset.mode=state.mode;for(const [key,name,detail] of [['en','English','Translation'],['ar','العربية','Source text']]){const col=document.createElement('div');col.className='sf-page__col sf-page__col--'+key;const meta=document.createElement('div');meta.className='sf-page__meta';const l=document.createElement('span');l.textContent=name;const d=document.createElement('span');d.textContent=detail;meta.append(l,d);const content=document.createElement('div');content.className='sf-page__'+key;if(key==='ar'){content.lang='ar';content.dir='rtl';}fill(content,r['isnad_'+key],r['matn_'+key],key==='en',r['whole_'+key]);col.append(meta,content);page.append(col);}return page;}
function toggleStream(on){state.stream=on;state.about=false;if(on&&!el.streamList.childElementCount){const frag=document.createDocumentFragment();reports.forEach((r)=>{if(r.heading){const head=document.createElement('div');head.className='sf-heading-line';const b=document.createElement('b');b.textContent=r.heading.en;const s=document.createElement('span');s.lang='ar';s.dir='rtl';s.textContent=r.heading.ar||'';head.append(b,s);frag.append(head);}const item=document.createElement('section');item.className='sf-stream-entry';item.id=r.id;const h=document.createElement('div');h.className='sf-stream-entry__head';const title=document.createElement('h4');title.textContent=label(r)+(r.page?' · p. '+r.page:'');const link=document.createElement('button');link.type='button';link.textContent='Copy link ↗';link.addEventListener('click',()=>copy(window.location.href.split('#')[0]+'#'+r.id));h.append(title,link);item.append(h,pageNode(r));if(r.notes&&r.notes.length){const n=document.createElement('div');n.className='sf-notes';notesNode(n,r);item.append(n);}frag.append(item);});el.streamList.append(frag);}$('#sf-continuous').textContent=on?'Single entry ↗':'Continuous ↗';$('#sf-continuous').setAttribute('aria-pressed',String(on));tabs();if(on)document.getElementById(reports[state.index].id)?.scrollIntoView({behavior:'smooth',block:'start'});else{renderCurrent();$('#sf-main').scrollIntoView({behavior:'smooth'});}}
function copy(txt){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(txt).then(()=>toast('Copied to clipboard')).catch(()=>fallbackCopy(txt));}else fallbackCopy(txt);}
function fallbackCopy(txt){const input=document.createElement('textarea');input.value=txt;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();const done=document.execCommand('copy');input.remove();toast(done?'Copied to clipboard':'Unable to copy automatically');}
$('#sf-search').addEventListener('input',e=>{state.query=e.target.value;renderToc();});$('#sf-prev').addEventListener('click',()=>go(state.index-1));$('#sf-next').addEventListener('click',()=>go(state.index+1));$('#sf-copy-link').addEventListener('click',()=>copy(location.href.split('#')[0]+'#'+reports[state.index].id));$('#sf-copy-text').addEventListener('click',()=>{const r=reports[state.index];copy([cite(r),[r.isnad_en,r.matn_en].filter(Boolean).join(' ').replace(/\*/g,''),[r.isnad_ar,r.matn_ar].filter(Boolean).join(' ')].join('\n\n'));});
$$('.sf-mode button').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;tabs();}));$('#sf-smaller').addEventListener('click',()=>size(-1));$('#sf-bigger').addEventListener('click',()=>size(1));function size(step){state.size=Math.max(-3,Math.min(5,state.size+step));document.querySelector('.sf-shell').style.setProperty('--enSize',(23+state.size*1.5)+'px');document.querySelector('.sf-shell').style.setProperty('--arSize',(29+state.size*2)+'px');}
$('#sf-tab-about').addEventListener('click',()=>setAbout(true));$('#sf-tab-read').addEventListener('click',()=>setAbout(false));$('#sf-about-link').addEventListener('click',e=>{e.preventDefault();setAbout(true);});$('#sf-rail-about').addEventListener('click',()=>setAbout(true));$('#sf-continuous').addEventListener('click',()=>toggleStream(!state.stream));$('#sf-stream-from-bottom').addEventListener('click',()=>toggleStream(true));$('#sf-exit-stream').addEventListener('click',()=>toggleStream(false));
$('#sf-open-index').addEventListener('click',()=>{el.rail.classList.toggle('is-mobile-open');$('#sf-open-index').setAttribute('aria-expanded',el.rail.classList.contains('is-mobile-open'));});$('#sf-close-index').addEventListener('click',closeIndex);
window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));const idx=reports.findIndex(r=>r.id===id);if(idx!==-1)go(idx,{scroll:false});});window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='Escape')closeIndex();if(!state.stream&&!state.about&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();go(state.index+(e.key==='ArrowRight'?1:-1));}});
const initialId=decodeURIComponent(location.hash.slice(1));const start=reports.findIndex(r=>r.id===initialId);if(start!==-1)state.index=start;renderCurrent();tabs();
})();`;

for (const slug of [...SINGLE_PAGE].filter(item => !only.length || only.includes(item))) {
  const config = configs.find(item => item.slug === slug);
  if (!config) throw new Error(`${slug}: no reader configuration.`);
  const target = path.join(root, slug);
  const source = JSON.parse(fs.readFileSync(path.join(target, 'publication-source.json'), 'utf8'));
  const { reports, opening } = reportsOf(config, source);
  const ids = reports.map(report => report.id);
  if (new Set(ids).size !== ids.length) throw new Error(`${slug}: report anchors are not unique.`);
  const title = titles.get(slug)?.title_en ?? source.compilation.title_en;
  const unit = (source.compilation.unit_noun || 'Narration').toLowerCase();
  const html = [
    '<!-- Built by scripts/hadith/build-single-page-readers.mjs from publication-source.json. Do not edit by hand. -->',
    `<style>${shellStyle}${EXTRA_STYLE}</style>`,
    markup(config, source, reports, opening),
  ].join('\n');
  fs.writeFileSync(path.join(target, 'reader.html'), `${html}\n`, 'utf8');
  fs.writeFileSync(path.join(target, 'reader-meta.json'), `${JSON.stringify({
    count: reports.length, units: { count: 1, noun: 'section' }, title,
    description: `${title}: ${plural(reports.length, unit)} on one page, in Arabic and English with source references.`,
  }, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.resolve('src/pages/hadith/collection', `${slug}.astro`), `---\nimport ReaderEdition from "../../../components/hadith/ReaderEdition.astro";\n---\n\n<ReaderEdition slug="${slug}" />\n`, 'utf8');
  for (const stale of ['chapters', 'collection.html', 'chapter-index.json', 'narrator-link-audit.json']) fs.rmSync(path.join(target, stale), { recursive: true, force: true });
  console.log(`Built ${slug}: one page, ${reports.length} entries, ${reports.filter(report => report.heading).length} headings, ${opening.length} opening passages.`);
}
