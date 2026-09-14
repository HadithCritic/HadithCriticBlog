/**
 * Corpus search, running in the reader's browser.
 *
 * /hadith is a prerendered shell: a catalogue of the thirty-three compilations
 * and a form. This module is what turns a query in that form into results,
 * reading the static SQLite corpus over HTTP range requests. No request reaches
 * a database server, and none ever did reach one from here after a search, the
 * page used to be server rendered against a hosted database, and this is what
 * replaced it.
 *
 * Three behaviours are load-bearing and easy to lose:
 *
 *   **The URL is the state.** Every search writes a shareable URL, and every
 *   load reads one. /hadith?q=عائشة&book=27&page=3 has to survive a refresh, a
 *   paste into another tab, and the back button, because those links are cited
 *   in articles.
 *
 *   **The pager is anchors.** They carry a real href to the same URL the module
 *   would push, so middle-click and "open in new tab" work and the control is a
 *   link rather than a div with a listener.
 *
 *   **The markup matches what the server used to emit.** The rules for these
 *   classes live in the page's `is:global` block, because a node created here
 *   never carries the page's `data-astro-cid` attribute and a scoped rule would
 *   not reach it.
 */

import {
  CorpusUnavailableError,
  getNarratorsByIds,
  onCorpusStatus,
  searchHadith,
  type HadithSearchResult,
  type HadithSearchRow,
  type SearchScope
} from './corpus-client';
import { CORPUS_META } from './corpus-config';
import { escapeHtml, makeSnippet } from './snippet';
import { toPlainText } from './format-text';

const SCOPES: readonly SearchScope[] = ['all', 'matn', 'arabic', 'english'];
const PAGE_SIZE = 25;

interface SearchState {
  q: string;
  scope: SearchScope;
  phrase: boolean;
  book: number;
  narrator: number;
  subject: string;
  page: number;
}

const readState = (search: string): SearchState => {
  const p = new URLSearchParams(search);
  const scope = (p.get('scope') || 'all') as SearchScope;
  return {
    q: (p.get('q') || '').trim(),
    scope: SCOPES.includes(scope) ? scope : 'all',
    phrase: p.get('phrase') === '1',
    book: Math.max(0, parseInt(p.get('book') || '', 10) || 0),
    narrator: Math.max(0, parseInt(p.get('narrator') || '', 10) || 0),
    subject: (p.get('subject') || '').trim(),
    page: Math.max(1, parseInt(p.get('page') || '1', 10) || 1)
  };
};

const hasFilter = (state: SearchState) =>
  Boolean(state.q) || state.book > 0 || state.narrator > 0 || Boolean(state.subject);

function stateToSearch(state: SearchState): string {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.scope !== 'all') p.set('scope', state.scope);
  if (state.phrase) p.set('phrase', '1');
  if (state.book > 0) p.set('book', String(state.book));
  if (state.narrator > 0) p.set('narrator', String(state.narrator));
  if (state.subject) p.set('subject', state.subject);
  if (state.page > 1) p.set('page', String(state.page));
  const query = p.toString();
  return query ? `/hadith?${query}` : '/hadith';
}

/* -------------------------------------------------------------------------- */
/* Markup                                                                      */
/* -------------------------------------------------------------------------- */

function recordCard(row: HadithSearchRow, query: string, index: number, revealCap: number): string {
  const chapter = toPlainText(row.chapter_en || '');
  const snippetEn =
    row.snippet_en ?? makeSnippet(toPlainText(row.matn_en || row.text_en || ''), query, { window: 260 });
  const snippetAr = row.snippet_ar ?? makeSnippet(row.matn_ar || row.text_ar || '', query, { window: 200 });

  return `
    <li class="corpus-result hc-reveal" style="--reveal-delay:${Math.min(index, revealCap)}">
      <article class="corpus-record-card">
        <a class="corpus-record-card__hitarea" href="/hadith/${row.id}">
          <div class="corpus-record-card__top">
            <div class="corpus-record-card__breadcrumbs">
              <span class="corpus-record-card__book">${escapeHtml(row.book_en)}</span>
              <span class="corpus-record-card__num">${
                row.hadith_num ? `Report № ${escapeHtml(row.hadith_num)}` : `ID #${row.id}`
              }</span>
            </div>
            <span class="corpus-record-card__action">
              <span>Open Record</span>
              <span class="corpus-record-card__arrow">→</span>
            </span>
          </div>

          ${chapter ? `<h2 class="corpus-record-card__chapter">${escapeHtml(chapter)}</h2>` : ''}

          <div class="corpus-record-card__spread">
            <div class="corpus-record-card__col corpus-record-card__col--en">
              <div class="corpus-record-card__snippet-meta">
                <span class="corpus-badge-indicator corpus-badge-indicator--en"></span>
                <span>English Translation</span>
              </div>
              <p class="corpus-record-card__text">${snippetEn}</p>
            </div>

            <div class="corpus-record-card__col corpus-record-card__col--ar">
              <div class="corpus-record-card__snippet-meta corpus-record-card__snippet-meta--ar">
                <span class="corpus-badge-indicator corpus-badge-indicator--ar"></span>
                <span lang="ar" dir="rtl">النص الأصلي</span>
              </div>
              <p lang="ar" dir="rtl" class="corpus-record-card__ar">${snippetAr}</p>
            </div>
          </div>

          <div class="corpus-record-card__footer">
            <div class="corpus-record-card__pills">
              <span class="corpus-pill">
                <span class="corpus-pill__label">Transmitters:</span>
                <strong class="corpus-pill__num">${row.narrator_count}</strong>
              </span>
              ${
                Number(row.parallel_count) > 0
                  ? `<span class="corpus-pill">
                       <span class="corpus-pill__label">Parallels:</span>
                       <strong class="corpus-pill__num">${Number(row.parallel_count).toLocaleString()}</strong>
                     </span>`
                  : ''
              }
            </div>
            <span class="corpus-record-card__id-meta">Corpus ID: #${row.id}</span>
          </div>
        </a>
      </article>
    </li>`;
}

function pagerMarkup(state: SearchState, data: HadithSearchResult): string {
  if (data.pages <= 1) return '';
  const href = (page: number) => escapeHtml(stateToSearch({ ...state, page }));

  const back =
    state.page > 1
      ? `<a class="corpus-pager__btn" href="${href(state.page - 1)}" data-page="${state.page - 1}">← Previous Page</a>`
      : '<span class="corpus-pager__btn is-disabled" aria-disabled="true">← Previous Page</span>';
  const forward =
    state.page < data.pages
      ? `<a class="corpus-pager__btn" href="${href(state.page + 1)}" data-page="${state.page + 1}">Next Page →</a>`
      : '<span class="corpus-pager__btn is-disabled" aria-disabled="true">Next Page →</span>';

  return `
    <nav class="corpus-pager" aria-label="Query pagination">
      ${back}
      <span class="corpus-pager__info">
        Page <strong>${state.page.toLocaleString()}</strong> of <strong>${data.pages.toLocaleString()}</strong>
      </span>
      ${forward}
    </nav>`;
}

function filterChips(state: SearchState, narratorName: string | null): string {
  if (!hasFilter(state)) return '';
  const book = state.book ? CORPUS_META.collections.find((b) => b.id === state.book) : undefined;
  const chips: string[] = [];

  if (state.q) {
    chips.push(
      `<span class="filter-chip"><span class="filter-chip__key">Query:</span>
         <strong class="filter-chip__val">“${escapeHtml(state.q)}”</strong></span>`
    );
  }
  if (book) {
    chips.push(
      `<span class="filter-chip"><span class="filter-chip__key">Collection:</span>
         <strong class="filter-chip__val">${escapeHtml(book.title_en)}</strong></span>`
    );
  }
  if (state.narrator > 0) {
    chips.push(
      `<span class="filter-chip"><span class="filter-chip__key">Transmitter:</span>
         <a class="filter-chip__link" href="/narrators/${state.narrator}">${escapeHtml(
           narratorName || `#${state.narrator}`
         )}</a></span>`
    );
  }
  if (state.subject) {
    chips.push(
      `<span class="filter-chip"><span class="filter-chip__key">Subject:</span>
         <strong class="filter-chip__val">${escapeHtml(state.subject)}</strong></span>`
    );
  }

  return `
    <span class="corpus-active-filters__label">Active Constraints:</span>
    <div class="corpus-active-filters__list">
      ${chips.join('')}
      <a class="filter-chip-clear" href="/hadith">Clear All Filters</a>
    </div>`;
}

/* -------------------------------------------------------------------------- */
/* Wiring                                                                      */
/* -------------------------------------------------------------------------- */

export function initHadithSearch(): void {
  const form = document.querySelector('form.corpus-controls') as HTMLFormElement | null;
  const body = document.querySelector('.corpus-body') as HTMLElement | null;
  if (!form || !body || form.dataset.searchReady === 'true') return;
  form.dataset.searchReady = 'true';

  // Asserted rather than union-typed: the guard below is the runtime check,
  // and a hoisted function declaration does not inherit the narrowing.
  const results = body.querySelector('.corpus-results-wrap') as HTMLElement;
  const catalogue = body.querySelector('.corpus-index') as HTMLElement | null;
  const activeFilters = body.querySelector('.corpus-active-filters') as HTMLElement | null;
  if (!results) return;

  const input = form.querySelector('#corpus-q') as HTMLInputElement | null;
  const scopeSelect = form.querySelector('select[name="scope"]') as HTMLSelectElement | null;
  const bookSelect = form.querySelector('select[name="book"]') as HTMLSelectElement | null;
  const phraseBox = form.querySelector('input[name="phrase"]') as HTMLInputElement | null;
  const narratorField = form.querySelector('input[name="narrator"]') as HTMLInputElement | null;
  const subjectField = form.querySelector('input[name="subject"]') as HTMLInputElement | null;

  const revealCap = 8;
  let token = 0;

  /** Put the controls in step with a state, so a deep link shows its own filters. */
  function applyToForm(state: SearchState) {
    if (input) input.value = state.q;
    if (scopeSelect) scopeSelect.value = state.scope;
    if (bookSelect) bookSelect.value = state.book > 0 ? String(state.book) : '';
    if (phraseBox) phraseBox.checked = state.phrase;
    // Disabled fields are not submitted, which is how an absent filter stays
    // absent from the next query string rather than arriving as an empty one.
    if (narratorField) {
      narratorField.value = state.narrator > 0 ? String(state.narrator) : '';
      narratorField.disabled = state.narrator <= 0;
    }
    if (subjectField) {
      subjectField.value = state.subject;
      subjectField.disabled = !state.subject;
    }
  }

  function readForm(page = 1): SearchState {
    const scope = (scopeSelect?.value || 'all') as SearchScope;
    return {
      q: (input?.value || '').trim(),
      scope: SCOPES.includes(scope) ? scope : 'all',
      phrase: Boolean(phraseBox?.checked),
      book: Math.max(0, parseInt(bookSelect?.value || '', 10) || 0),
      narrator: Math.max(0, parseInt(narratorField?.value || '', 10) || 0),
      subject: (subjectField?.value || '').trim(),
      page
    };
  }

  function showCatalogue(show: boolean) {
    if (catalogue) catalogue.hidden = !show;
  }

  function setFilters(state: SearchState, narratorName: string | null) {
    if (!activeFilters) return;
    const markup = filterChips(state, narratorName);
    activeFilters.innerHTML = markup;
    activeFilters.hidden = !markup;
  }

  async function render(state: SearchState, push: boolean) {
    applyToForm(state);

    if (!hasFilter(state)) {
      results.innerHTML = '';
      setFilters(state, null);
      showCatalogue(true);
      if (push) history.pushState(null, '', '/hadith');
      return;
    }

    showCatalogue(false);
    setFilters(state, null);

    const mine = ++token;
    results.setAttribute('aria-busy', 'true');
    results.innerHTML =
      '<div class="corpus-toolbar"><span class="corpus-status" aria-live="polite">Reading the corpus…</span></div>';

    try {
      const data = await searchHadith({
        q: state.q,
        scope: state.scope,
        phrase: state.phrase,
        book: state.book || undefined,
        narrator: state.narrator || undefined,
        subject: state.subject || undefined,
        page: state.page,
        size: PAGE_SIZE
      });

      // A later search overtook this one. Its results are the current truth.
      if (mine !== token) return;

      if (state.narrator > 0) {
        getNarratorsByIds([state.narrator])
          .then(([narrator]) => {
            if (mine === token) setFilters(state, narrator?.name_en || null);
          })
          .catch(() => {
            // The chip falls back to the id, which is still a working link.
          });
      }

      const total = `${data.total.toLocaleString()}${data.approximate ? '+' : ''}`;
      const noun = data.total === 1 ? 'archival record' : 'archival records';

      results.innerHTML = `
        <section class="corpus-results-section" aria-label="Search Results">
          <div class="corpus-toolbar">
            <div class="corpus-status" aria-live="polite">
              <span class="corpus-status__count">${total} ${noun} found</span>
              ${
                state.q
                  ? `<span class="corpus-status__context">for query <em>“${escapeHtml(state.q)}”</em></span>`
                  : ''
              }
            </div>
            ${state.q ? '<div class="corpus-ranking-note">Ranked by BM25 Textual Relevance</div>' : ''}
          </div>

          ${
            data.results.length
              ? `<ol class="corpus-results">${data.results
                  .map((row, i) => recordCard(row, state.q, i, revealCap))
                  .join('')}</ol>${pagerMarkup(state, data)}`
              : `<div class="corpus-empty-card">
                   <div class="corpus-empty-card__icon" aria-hidden="true">∅</div>
                   <h3 class="corpus-empty-card__title">No Textual Matches Discovered</h3>
                   <p class="corpus-empty-card__text">
                     No narrations met the search parameters. Arabic diacritics and alternate
                     spellings (for example عائشة and عايشة) are normalized automatically.
                     Consider broadening your scope or querying specific root keywords.
                   </p>
                   <a class="filter-chip-clear" href="/hadith">Reset Search Filters</a>
                 </div>`
          }
        </section>`;

      const url = stateToSearch(state);
      if (push) history.pushState(null, '', url);
      else history.replaceState(null, '', url);
    } catch (error) {
      if (mine !== token) return;
      const unavailable = error instanceof CorpusUnavailableError;
      results.innerHTML = `
        <div class="corpus-notice corpus-notice--error">
          <p>
            ${
              unavailable
                ? 'The corpus could not be loaded, so search is unavailable right now. Everything else on the site still works.'
                : 'That search could not be completed.'
            }
          </p>
          <p><button type="button" class="filter-chip-clear" data-corpus-retry>Try again</button></p>
        </div>`;
      results.querySelector('[data-corpus-retry]')?.addEventListener('click', () => {
        render(state, false);
      });
    } finally {
      if (mine === token) results.removeAttribute('aria-busy');
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render(readForm(1), true);
  });

  scopeSelect?.addEventListener('change', () => render(readForm(1), true));
  bookSelect?.addEventListener('change', () => render(readForm(1), true));
  phraseBox?.addEventListener('change', () => render(readForm(1), true));

  results.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest('a.corpus-pager__btn') as HTMLAnchorElement | null;
    if (!link?.dataset.page) return;
    // Let a modified click do what the reader asked: open a real URL elsewhere.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    render({ ...readForm(1), page: parseInt(link.dataset.page, 10) }, true);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  window.addEventListener('popstate', () => {
    render(readState(location.search), false);
  });

  // A slow first query is the corpus starting up, not a stalled search; say so.
  onCorpusStatus((status) => {
    const banner = results.querySelector('.corpus-status');
    if (status === 'loading' && banner) banner.textContent = 'Opening the corpus…';
  });

  const initial = readState(location.search);
  if (hasFilter(initial)) render(initial, false);
  else applyToForm(initial);
}
