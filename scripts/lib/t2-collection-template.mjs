import fs from 'node:fs';

// Use the same stylesheet as the completed Al-Shama'il collection page.
const reference = fs.readFileSync('src/data/hadith-pages/al-shama-il-al-muhammadiyah/collection.html', 'utf8');
const style = reference.match(/<style\b[^>]*>[\s\S]*?<\/style>/i)?.[0];
if (!style) throw new Error('Al-Shama’il collection stylesheet is missing');
const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);

export function renderCollection(config, source, entries, total) {
  const title = source.compilation.title_en;
  const compiler = source.compilation.author?.name_en || ({
    'birr-al-walidayn': 'Muḥammad ibn Ismāʿīl al-Bukhārī',
    'musnad-khalifa-ibn-khayyat': 'Khalīfa ibn Khayyāṭ',
    'musnad-sad-ibn-abi-waqqas': 'Aḥmad ibn Ibrāhīm al-Dawraqī',
  })[config.slug];
  const dates = { 'birr-al-walidayn': '256', 'musnad-khalifa-ibn-khayyat': '240', 'musnad-sad-ibn-abi-waqqas': '246' };
  const noun = config.itemNoun.toLowerCase();
  const url = `/hadith/collection/${config.slug}/`;
  const recordNoun = config.recordNoun || 'entry';
  const recordPlural = config.recordPlural || (recordNoun === 'entry' ? 'entries' : `${recordNoun}s`);
  const date = config.date || dates[config.slug];
  const feature = config.features || [
    {
      title: 'Follow the transmission.',
      description: 'Explore the narrators in each supplied transmission path and open linked entries in the Rijal Register.',
    },
    {
      title: 'Let the Arabic speak.',
      description: 'Choose parallel reading, English alone, or the original Arabic.',
    },
  ];
  const editionNotes = config.editionNotes || [{
    label: 'Source',
    text: source.compilation.edition || 'Edition details were not recorded in the supplied source.',
  }];
  const rows = entries.map(item => `<a data-filter-row data-search="${esc([item.title_en, item.title_ar, item.n].join(' '))}" href="${esc(item.href || `${url}chapter/${item.n}/`)}" class="chapter-row"><span class="chapter-num">${String(item.n).padStart(2, '0')}</span><span class="chapter-name"><strong>${esc(item.title_en)}</strong><small lang="ar" dir="rtl">${esc(item.title_ar)}</small></span><span class="chapter-count">${item.count} ${item.countNoun || (item.count === 1 ? recordNoun : recordPlural)}</span><span aria-hidden="true" class="arrow">↗</span></a>`).join('');
  const heroDescription = config.heroDescription
    || `Explore the collection in its original ${noun} order, with Arabic and English narrations, identifiable transmitters, and source references.`;
  const indexDescription = config.indexDescription
    || `Read directly by ${noun}. Each ${noun} opens as one continuous reading page with Arabic and English text.`;
  const featureIntro = config.featureIntro
    || 'Read the Arabic and English together, with transmission paths and source references close at hand.';

  return `${style}<div id="main"><section class="collection-hero"><div class="hero-ridge" aria-hidden="true"></div><div class="frame hero-layout hero-layout--simple"><div class="hero-copy"><span class="eyebrow">HadithCritic · Hadith Corpus</span><h1 class="hero-title">${esc(title)}</h1><div class="hero-author"><span class="hero-author__label">${config.authority ? 'Authority' : 'Compiled by'}</span><strong>${esc(compiler)}</strong>${date ? `<span class="hero-author__date">d. ${date} AH</span>` : ''}</div><p>${esc(heroDescription)}</p><div class="hero-actions"><a class="pill-btn primary" href="${url}chapter/1/">Begin reading&nbsp; ↗</a><a class="pill-btn" href="#chapters">Explore ${entries.length} ${noun}${entries.length === 1 ? '' : 's'}&nbsp; ↓</a></div></div></div></section>
  <section class="frame stats-section" aria-label="Collection summary"><div class="stats-strip"><div class="stat"><strong>${entries.length}</strong><span>${esc(config.itemNoun)}${entries.length === 1 ? '' : 's'}<br>in order</span></div><div class="stat"><strong>${Number(total).toLocaleString('en-US')}</strong><span>Recorded<br>narrations</span></div><div class="stat"><strong>${date || '—'}</strong><span>${date ? (config.authority ? 'AH · Death of<br>the authority' : 'AH · Death of<br>the compiler') : 'Compiler<br>date unavailable'}</span></div></div></section>
  <section id="chapters" class="frame home-main"><div class="section-intro"><div><span class="eyebrow">The complete index</span><h2>Discover a ${noun}.</h2></div><p>${esc(indexDescription)}</p></div><div class="chapter-tools"><label class="search-box"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 5 5"/></svg><input data-filter-input type="search" placeholder="Search ${entries.length} ${noun}${entries.length === 1 ? '' : 's'} · English or Arabic" autocomplete="off" aria-label="Search ${noun}s"></label><span class="result-text" id="result-count"></span></div><div class="chapters">${rows}</div><p class="empty-state" id="empty-state" hidden>No ${noun}s match your search.</p></section>
  <section class="feature-section"><div class="frame"><div class="feature-header"><span class="eyebrow">Designed for close reading</span><h2>A more legible way into the texts.</h2><p>${esc(featureIntro)}</p></div><div class="feature-grid"><div class="feature-large"><div><h3>${esc(feature[0].title)}</h3><p>${esc(feature[0].description)}</p></div></div><div class="feature-side"><div><h3>${esc(feature[1].title)}</h3><p>${esc(feature[1].description)}</p></div></div></div></div></section><section class="frame source-row"><h2>About the edition.</h2><div>${editionNotes.map(note => `<p><b>${esc(note.label)}.</b> ${esc(note.text)}</p>`).join('')}</div></section></div>
  <script>(()=>{const input=document.querySelector('[data-filter-input]'),rows=[...document.querySelectorAll('[data-filter-row]')],count=document.querySelector('#result-count'),none=document.querySelector('#empty-state');const norm=s=>(s||'').normalize('NFKD').replace(/[\u0300-\u036f\u064b-\u065f]/g,'').toLocaleLowerCase().trim();const update=()=>{let n=0;const q=norm(input.value);rows.forEach(row=>{const match=norm(row.dataset.search||row.textContent).includes(q);row.hidden=!match;if(match)n++});count.textContent=n+' shown · '+rows.length+' total';none.hidden=n>0};input.addEventListener('input',update);update()})()</script>`;
}
