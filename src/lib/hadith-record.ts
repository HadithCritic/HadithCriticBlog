/**
 * The critical edition record for one narration, rendered in the browser.
 *
 * /hadith/[id] is a shell: the Worker knows the id in the URL and nothing else,
 * because there are 276,347 narrations and no database behind the site to ask.
 * Everything below the layout chrome is built here from the static corpus.
 *
 * The markup is a faithful port of what the page used to render server side,
 * class for class, because the stylesheet is the same stylesheet. Its rules had
 * to move from the page's scoped block to `is:global` in the same change: a
 * node created by script never carries the page's `data-astro-cid` attribute,
 * so a scoped rule cannot reach it, and the page would have rendered unstyled.
 *
 * Section ids matter too. `#matn-heading`, `#report-heading`, `#isnad-heading`
 * and `#apparatus-heading` are the scrollspy's targets and are linked from
 * articles, so they are emitted whether or not this module wrote them.
 */

import {
  CorpusUnavailableError,
  getHadithDetail,
  getHadithNeighbours,
  type ChainNode,
  type HadithDetail,
  type HadithNarratorSurface
} from './corpus-client';
import { escapeHtml } from './snippet';
import { renderArabic, renderRich, toPlainText } from './format-text';

/** Western digits as Arabic-Indic, for numbers set inside Arabic text. */
const arabicDigits = (value: string) => value.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const heroTitle = (detail: HadithDetail) =>
  toPlainText(detail.hadith.chapter_en) || detail.hadith.book_en;

/** "Musnad Ahmad № 1234", the form used in the citation and the breadcrumb. */
export function referenceLabel(detail: HadithDetail): string {
  const { hadith } = detail;
  return `${hadith.book_en}${hadith.hadith_num ? ` № ${hadith.hadith_num}` : ''}`;
}

/** Chain rows arrive flat and ordered; a branch is a run sharing a path_idx. */
function groupPaths(chain: ChainNode[]): Map<number, ChainNode[]> {
  const paths = new Map<number, ChainNode[]>();
  for (const node of chain) {
    if (!paths.has(node.path_idx)) paths.set(node.path_idx, []);
    paths.get(node.path_idx)!.push(node);
  }
  return paths;
}

/**
 * The English report is the chain followed by the matn, and wherever the
 * dataset separates a matn its English is a verbatim run inside the report
 * (true of every record in the corpus). So the report splits exactly at that
 * run: nothing is reworded, and a record without a separate matn shows its
 * report whole.
 */
function splitEnglish(report: string | null, matn: string | null): { chain: string; matn: string } | null {
  if (!report) return null;
  if (!matn) return { chain: '', matn: report };
  const at = report.lastIndexOf(matn);
  if (at < 0) return { chain: '', matn: report };
  return { chain: report.slice(0, at).trim(), matn: report.slice(at).trim() };
}

/**
 * Previous and next narration in the collection. Rendered empty and hidden;
 * `fillPager` writes the links once the neighbours are read, so the record
 * itself never waits on them.
 */
function pagerMarkup(place: 'top' | 'bottom'): string {
  return `<nav class="edition-pager edition-pager--${place}" data-record-pager aria-label="Neighbouring narrations in this collection" hidden></nav>`;
}

function headMarkup(detail: HadithDetail, id: number): string {
  const { hadith } = detail;
  const collection = `/hadith/collection/${escapeHtml(hadith.book_slug)}/`;
  return `
    <header class="hr-head edition-hero">
      <div class="hr-head__art" aria-hidden="true"></div>
      <div class="hr-head__top">
        <a class="hr-head__back" href="${collection}"><span aria-hidden="true">←</span> ${escapeHtml(hadith.book_en)}</a>
        ${pagerMarkup('top')}
      </div>
      <div class="hr-head__titles">
        <div class="hr-head__en">
          <h1 class="hr-head__title">
            <a href="${collection}">${escapeHtml(hadith.book_en)}</a>${
              hadith.hadith_num ? `<span class="hr-visually-hidden">, hadith ${escapeHtml(hadith.hadith_num)}</span>` : ''
            }
          </h1>
          <p class="hr-head__meta">
            <span data-kitab-en hidden></span>
            ${hadith.hadith_num ? `<span>Hadith ${escapeHtml(hadith.hadith_num)}</span>` : ''}
            <span>Corpus record ${id}</span>
          </p>
        </div>
        ${
          hadith.book_ar
            ? `<div class="hr-head__ar" lang="ar" dir="rtl">
                 <p class="hr-head__title-ar">${escapeHtml(hadith.book_ar)}</p>
                 <p class="hr-head__meta">
                   <span data-kitab-ar hidden></span>
                   ${hadith.hadith_num ? `<span>حديث ${escapeHtml(arabicDigits(hadith.hadith_num))}</span>` : ''}
                 </p>
               </div>`
            : ''
        }
      </div>
    </header>`;
}

/** The chapter heading, English first; the Arabic is the source's own heading. */
function chapterMarkup(detail: HadithDetail): string {
  const { hadith } = detail;
  if (!hadith.chapter_en && !hadith.chapter_ar) return '';
  // "Chapter:" is the translation's own label; it is set apart, not removed.
  const label = /^(Chapter:)\s*/.exec(hadith.chapter_en || '');
  const english = label
    ? `<span class="hr-chapter__label">${label[1]}</span> ${renderRich(hadith.chapter_en.slice(label[0].length))}`
    : renderRich(hadith.chapter_en || '');
  return `
    <div class="hr-chapter">
      ${hadith.chapter_en ? `<p class="hr-chapter__en">${english}</p>` : '<span></span>'}
      ${hadith.chapter_ar ? `<p class="hr-chapter__ar" lang="ar" dir="rtl">${renderArabic(hadith.chapter_ar)}</p>` : ''}
    </div>`;
}

/**
 * The leaf: English on the left and first in the DOM, the full Arabic report
 * beside it for checking. Below 780px the Arabic leads, by grid placement only.
 */
function leafMarkup(detail: HadithDetail): string {
  const { hadith } = detail;
  const english = splitEnglish(hadith.text_en, hadith.matn_en);
  const arabic = hadith.text_ar_diac || hadith.text_ar;
  return `
    <section class="hr-text" aria-labelledby="report-heading">
      <h2 id="report-heading" class="hr-visually-hidden">The report</h2>
      <div class="hr-leaf critical-spread">
        <div class="hr-leaf__en critical-col--en">
          ${
            english
              ? `${english.chain ? `<p class="hr-leaf__chain facing-prose facing-prose--en">${renderRich(english.chain)}</p><span class="hr-leaf__rule" aria-hidden="true"></span>` : ''}
                 <div class="hr-leaf__matn facing-prose facing-prose--en" id="matn-heading">${renderRich(english.matn)}</div>`
              : '<p class="facing-prose--empty">No English is recorded for this report.</p>'
          }
          <p class="hr-leaf__note">English rendering: machine translation, not reviewed. The Arabic is the source text.</p>
        </div>
        <div class="hr-leaf__ar critical-col--ar">
          <div class="facing-prose facing-prose--ar" lang="ar" dir="rtl">${renderArabic(arabic)}</div>
        </div>
      </div>
    </section>`;
}

/** One chain, as it is recited: the compiler's own teacher first, back to the earliest name. */
function chainList(nodes: ChainNode[]): string {
  const compiler = nodes.length > 1 ? nodes[nodes.length - 1] : null;
  const recited = (compiler ? nodes.slice(0, -1) : nodes).slice().reverse();
  const name = (node: ChainNode) =>
    node.narrator_id
      ? `<a class="ladder-card__name" href="/narrators/${node.narrator_id}/">${escapeHtml(node.name_en || node.name)}</a>`
      : `<span class="ladder-card__name is-unlinked">${escapeHtml(node.name || 'Unidentified transmitter')}</span>
         <span class="hr-chain__unresolved">Not identified in the register</span>`;
  return `
    ${
      compiler
        ? `<p class="hr-chain__compiler">Compiled by ${
            compiler.narrator_id
              ? `<a href="/narrators/${compiler.narrator_id}/">${escapeHtml(compiler.name_en || compiler.name)}</a>`
              : escapeHtml(compiler.name_en || compiler.name)
          }, who heard it from:</p>`
        : ''
    }
    <ol class="hr-chain">
      ${recited
        .map(
          (node, i) => `
        <li class="ladder-node">
          <span class="hr-chain__n" aria-hidden="true">${i + 1}</span>
          <span class="hr-chain__who">${name(node)}</span>
          ${node.death_hijri ? `<span class="hr-chain__death">d. ${node.death_hijri} AH</span>` : ''}
        </li>`
        )
        .join('')}
    </ol>`;
}

function chainPanel(paths: Map<number, ChainNode[]>, detail: HadithDetail): string {
  const chains = [...paths.values()];
  return `
    <section class="hr-panel hr-panel--chain" aria-labelledby="isnad-heading">
      <h2 class="hr-panel__title" id="isnad-heading">Transmission</h2>
      ${chains
        .map(
          (nodes, i) => `
        <div class="hr-chain-block">
          ${chains.length > 1 ? `<p class="hr-chain__label">Chain ${i + 1} of ${chains.length}</p>` : ''}
          ${chainList(nodes)}
        </div>`
        )
        .join('')}
      <p class="hr-panel__note">Names as the Rijāl Register identifies them. The forms the report itself uses are listed below.</p>
      ${sourceNarratorMarkup(detail.sourceNarrators)}
    </section>`;
}

function sourceNarratorMarkup(surfaces: HadithNarratorSurface[]): string {
  if (!surfaces.length) return '';
  return `
    <details class="source-narrators">
      <summary>Source narrator name forms <span>${surfaces.length} indexed forms</span></summary>
      <p class="source-narrators__note">Arabic forms are transcribed from the source dataset. English names are register cross-references; they are not a translation of the Arabic forms.</p>
      <ol>
        ${surfaces.map((entry) => `
          <li>
            <span class="source-narrators__position">${entry.pos + 1}</span>
            <span class="source-narrators__en">${entry.narrator_id ? `<a href="/narrators/${entry.narrator_id}/">${escapeHtml(entry.name_en || 'Open Rijāl dossier')}</a>` : escapeHtml(entry.name_en || 'No register match')}</span>
            <span class="source-narrators__ar" lang="ar" dir="rtl">${renderArabic(entry.surface_diac || entry.surface)}</span>
          </li>`).join('')}
      </ol>
    </details>`;
}

function refsPanel(detail: HadithDetail, id: number): string {
  const { hadith } = detail;
  const rows: [string, string][] = [
    ['Reference', `<a href="/hadith/collection/${escapeHtml(hadith.book_slug)}/">${escapeHtml(hadith.book_en)}</a>${hadith.hadith_num ? ` ${escapeHtml(hadith.hadith_num)}` : ''}`],
    ['Printed edition', referenceSummaryMarkup(detail)],
    ['Corpus record', `HadithCritic ${id}`]
  ];
  const structure = structureMarkup(detail);
  return `
    <section class="hr-panel hr-panel--refs" aria-labelledby="refs-heading">
      <h2 class="hr-panel__title" id="refs-heading">References &amp; source notes</h2>
      <dl class="hr-refs">
        ${rows.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join('')}
        <div data-kitab-row hidden><dt>Kitāb</dt><dd data-kitab-ref></dd></div>
        ${structure ? `<div><dt>In the book</dt><dd>${structure}</dd></div>` : ''}
      </dl>
      <p class="hr-refs__note">The Arabic is the source text, from the Ifta’ Sunnah platform; the English rendering is unreviewed machine translation.</p>
    </section>`;
}

/** What the dataset records beyond text and chain, folded away until asked for. */
function moreSection(detail: HadithDetail, matnIsDistinct: boolean): string {
  const { hadith, glosses, subjects } = detail;
  const counts = [
    ['Mutābaʿāt (متابعات)', 'The same companion, reached through another route', Number(hadith.parallel_count || 0)],
    ['Shawāhid (شواهد)', 'A similar report from a different companion', Number(hadith.witness_count || 0)],
    ['Wording variants (روايات وألفاظ)', 'Reports recorded as differing in wording', Number(hadith.variant_count || 0)]
  ] as const;
  const total = counts.reduce((sum, [, , n]) => sum + n, 0);
  const blocks: string[] = [];

  if (total > 0) {
    blocks.push(`
      <details class="hr-more__item">
        <summary>Parallel reports <span>${total.toLocaleString()} recorded</span></summary>
        <ul class="hr-counts">
          ${counts
            .map(([title, desc, n]) => `<li><span><strong>${escapeHtml(title)}</strong> ${escapeHtml(desc)}</span><span class="hr-counts__n">${n.toLocaleString()}</span></li>`)
            .join('')}
        </ul>
        <p class="hr-more__note">Counts as classified in the source dataset. HadithCritic has not reviewed these links.</p>
      </details>`);
  }
  if (glosses.length > 0) {
    blocks.push(`
      <details class="hr-more__item">
        <summary>Uncommon words <span>${glosses.length}</span></summary>
        <dl class="hr-glosses">
          ${glosses.map((g) => `<div><dd>${escapeHtml(g.word_en)}</dd><dt lang="ar" dir="rtl">${escapeHtml(g.word_ar)}</dt></div>`).join('')}
        </dl>
      </details>`);
  }
  if (subjects.length > 0) {
    blocks.push(`
      <details class="hr-more__item">
        <summary>Subjects <span>${subjects.length}</span></summary>
        <ul class="hr-subjects">
          ${subjects.map((s) => `<li><a href="/hadith/?subject=${encodeURIComponent(s.label_en)}">${escapeHtml(s.label_en)}</a></li>`).join('')}
        </ul>
        <p class="hr-more__note">Subject headings from the source dataset. Each one searches the corpus.</p>
      </details>`);
  }
  if (matnIsDistinct) {
    blocks.push(`
      <details class="hr-more__item">
        <summary>The matn alone, in Arabic</summary>
        <p class="hr-more__ar" lang="ar" dir="rtl">${renderArabic(hadith.matn_ar_diac || hadith.matn_ar || '')}</p>
        <p class="hr-more__note">The wording without its chain, as the source dataset separates it.</p>
      </details>`);
  }
  if (!blocks.length) return '';
  return `
    <section class="hr-more" aria-labelledby="apparatus-heading">
      <h2 class="hr-more__title" id="apparatus-heading">More on this report</h2>
      ${blocks.join('')}
    </section>`;
}

export function renderHadithRecord(detail: HadithDetail, id: number): string {
  const { hadith } = detail;
  const paths = groupPaths(detail.chain);
  const matnIsDistinct =
    Boolean(hadith.matn_ar) && String(hadith.matn_ar).trim() !== String(hadith.text_ar).trim();

  return `
    <article class="hr">
      ${headMarkup(detail, id)}
      ${chapterMarkup(detail)}
      ${leafMarkup(detail)}
      <div class="hr-panels">
        ${paths.size > 0 ? chainPanel(paths, detail) : ''}
        ${refsPanel(detail, id)}
      </div>
      ${moreSection(detail, matnIsDistinct)}
      ${pagerMarkup('bottom')}
    </article>`;
}

function structureMarkup(detail: HadithDetail): string {
  const { hadith } = detail;
  if (!hadith.kitab_id) return '';
  return `
    <nav class="edition-source-path" aria-label="Compilation structure">
      <span class="edition-source-path__item">Kitāb ${hadith.kitab_ordinal}</span>
      <span class="edition-source-path__title" lang="ar" dir="rtl">${renderArabic(hadith.kitab_ar || '')}</span>
      ${
        hadith.bab_id
          ? `<span class="edition-source-path__separator" aria-hidden="true">/</span>
             <span class="edition-source-path__item">Bāb ${hadith.bab_ordinal}</span>
             <span class="edition-source-path__title" lang="ar" dir="rtl">${renderArabic(hadith.bab_ar || '')}</span>`
          : `<span class="edition-source-path__note">No separate Bāb label recorded for this report</span>`
      }
    </nav>`;
}

function referenceSummaryMarkup(detail: HadithDetail): string {
  const reference = detail.references[0];
  if (!reference) return '<span class="ledger-meta">No printed page marker recorded</span>';
  const markers = detail.references.map((item) => escapeHtml(item.source_marker)).join(' ');
  return `
    <div class="edition-reference-summary">
      <span>${escapeHtml(detail.hadith.book_en)} · First edition · ${reference.volume_count} volumes · ${reference.year_hijri} AH / ${reference.year_gregorian} CE</span>
      <span class="edition-reference-summary__pages">${markers}</span>
      <span class="edition-reference-summary__ar" lang="ar" dir="rtl">${escapeHtml(reference.work_title_ar)} · ${escapeHtml(reference.publisher_ar)} · ${escapeHtml(reference.publication_place_ar)} · ${escapeHtml(reference.edition_statement_ar)}</span>
    </div>`;
}

/** A record that cannot be shown. The badge says why, because they differ. */
function degraded(badge: string, title: string, body: string): string {
  return `
    <div class="hadith-degraded">
      <span class="hadith-degraded__badge">${escapeHtml(badge)}</span>
      <h1 class="hadith-degraded__title">${escapeHtml(title)}</h1>
      <p class="hadith-degraded__text">${escapeHtml(body)}</p>
      <div class="hadith-degraded__actions">
        <a class="hc-btn" href="/hadith/">← Return to the corpus</a>
      </div>
    </div>`;
}

/* -------------------------------------------------------------------------- */
/* Behaviour                                                                   */
/* -------------------------------------------------------------------------- */


interface KitabEntry { n: number; title_ar: string; title_en: string | null; first: number; last: number }

/**
 * The kitab a record belongs to, from the collection's structure file (built
 * from the Ifta' Sunnah platform's table of contents). Collections without one
 * simply show no kitab line.
 */
async function fillKitab(detail: HadithDetail): Promise<void> {
  const id = Number(detail.hadith.id);
  const slug = detail.hadith.book_slug;
  try {
    const response = await fetch(`/data/collection-structure/${encodeURIComponent(slug)}.json`);
    if (!response.ok) return;
    const structure = (await response.json()) as { kitabs: KitabEntry[] };
    const kitab = structure.kitabs.find((k) => id >= k.first && id <= k.last);
    if (!kitab) return;
    const href = `/hadith/collection/${encodeURIComponent(slug)}/kitab/${kitab.n}/`;
    const en = document.querySelector<HTMLElement>('[data-kitab-en]');
    if (en) {
      en.innerHTML = `<a href="${href}">Book ${kitab.n}${kitab.title_en ? ` · ${escapeHtml(kitab.title_en)}` : ''}</a>`;
      en.hidden = false;
    }
    const ar = document.querySelector<HTMLElement>('[data-kitab-ar]');
    if (ar && kitab.title_ar) {
      ar.textContent = kitab.title_ar;
      ar.hidden = false;
    }
    const row = document.querySelector<HTMLElement>('[data-kitab-row]');
    const ref = document.querySelector<HTMLElement>('[data-kitab-ref]');
    if (row && ref) {
      ref.innerHTML = `<a href="${href}">Book ${kitab.n}${kitab.title_en ? `, ${escapeHtml(kitab.title_en)}` : ''}</a> <span lang="ar" dir="rtl">${escapeHtml(kitab.title_ar)}</span>`;
      row.hidden = false;
    }
  } catch {
    // The record is complete without its kitab line.
  }
}

/** Writes the neighbouring narrations into both pagers. A failure leaves them hidden. */
async function fillPager(detail: HadithDetail): Promise<void> {
  const pagers = Array.from(document.querySelectorAll<HTMLElement>('[data-record-pager]'));
  if (!pagers.length) return;
  try {
    const { prev, next } = await getHadithNeighbours(Number(detail.hadith.book_id), Number(detail.hadith.id));
    if (!prev && !next) return;
    const label = (item: { id: number; hadith_num: string | null }) =>
      item.hadith_num ? `No. ${escapeHtml(item.hadith_num)}` : `Record ${item.id}`;
    const markup = `
      ${prev ? `<a class="edition-pager__link" href="/hadith/${prev.id}/" rel="prev"><span aria-hidden="true">←</span> <span class="edition-pager__dir">Previous</span> ${label(prev)}</a>` : '<span></span>'}
      ${next ? `<a class="edition-pager__link edition-pager__link--next" href="/hadith/${next.id}/" rel="next"><span class="edition-pager__dir">Next</span> ${label(next)} <span aria-hidden="true">→</span></a>` : '<span></span>'}`;
    for (const pager of pagers) {
      pager.innerHTML = markup;
      pager.hidden = false;
    }
  } catch {
    // The record is complete without its neighbours; the pagers stay hidden.
  }
}

/**
 * Deep links land on a fragment that does not exist until this has run, so the
 * browser's own scroll-to-anchor has already failed by now. Repeat it.
 */
async function honourFragment(): Promise<void> {
  const id = location.hash.slice(1);
  if (!id) return;
  await document.fonts.ready;
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
  document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
}

export async function initHadithRecord(): Promise<void> {
  const container = document.querySelector('.hadith-container') as HTMLElement | null;
  if (!container) return;

  const id = Number(container.dataset.hadithId);
  if (!Number.isFinite(id) || id <= 0) {
    container.innerHTML = degraded(
      'Not a reference',
      'Not a narration reference',
      'That address does not name a record in the corpus. The corpus index lists every collection.'
    );
    return;
  }

  try {
    const detail = await getHadithDetail(id);

    if (!detail) {
      container.innerHTML = degraded(
        'No such record',
        `Narration #${id} is not in this corpus`,
        'No record carries that identifier. It may belong to a different corpus version, or the link may be mistyped.'
      );
      document.title = `Narration #${id} not found | HadithCritic`;
      return;
    }

    container.innerHTML = renderHadithRecord(detail, id);

    // The shell could not know the collection or the chapter, so the tab and
    // the address bar are corrected once the record is in hand.
    const reference = referenceLabel(detail);
    document.title = `${reference} · Hadith ${id} | HadithCritic Critical Edition`;

    honourFragment();
    void fillPager(detail);
    void fillKitab(detail);
  } catch (error) {
    container.innerHTML = degraded(
      'Corpus Unavailable',
      `Narration #${id} could not be loaded`,
      error instanceof CorpusUnavailableError
        ? 'The static corpus could not be reached, so this record cannot be displayed. Articles and the rest of the site are unaffected.'
        : 'Something went wrong reading this record from the corpus.'
    );
  }
}
