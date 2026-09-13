/**
 * Client-side interactive search for the Hadith corpus.
 *
 * Runs full-text and filtered searches in-browser using sql.js-httpvfs range
 * requests, updating results dynamically without triggering full-page SSR
 * reloads or consuming remote database read quotas.
 */

import { searchHadithClient, type HadithRecord, type HadithSearchResponse } from './corpus-client';
import { makeSnippet } from './snippet';
import { toPlainText } from './format-text';

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );

export function initHadithSearch(): void {
  const form = document.querySelector('form.corpus-controls') as HTMLFormElement | null;
  const body = document.querySelector('.corpus-body') as HTMLElement | null;
  if (!form || !body || form.dataset.searchReady === 'true') return;
  form.dataset.searchReady = 'true';

  const formEl = form;
  const bodyEl = body;

  const searchInput = formEl.querySelector('#corpus-q') as HTMLInputElement | null;
  const scopeSelect = formEl.querySelector('select[name="scope"]') as HTMLSelectElement | null;
  const bookSelect = formEl.querySelector('select[name="book"]') as HTMLSelectElement | null;

  let resultsContainer = bodyEl.querySelector('.corpus-results-wrap') as HTMLElement | null;
  let collectionsSection = bodyEl.querySelector('.corpus-index') as HTMLElement | null;

  // If results wrap doesn't exist yet, create a mount container
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.className = 'corpus-results-wrap';
    bodyEl.appendChild(resultsContainer);
  }

  // Preserve initial collections HTML so we can restore when search is cleared
  const initialCollectionsHtml = collectionsSection ? collectionsSection.outerHTML : '';

  let inflight = false;

  function resultRowMarkup(r: HadithRecord, q: string): string {
    const snippetEn = r.snippet_en || makeSnippet(toPlainText(r.matn_en || r.text_en), q, { window: 240 });
    const snippetAr = r.snippet_ar || (r.matn_ar || r.text_ar ? makeSnippet(r.matn_ar || r.text_ar, q, { window: 180 }) : null);

    return `
      <li class="corpus-result">
        <a class="corpus-result__link" href="/hadith/${r.id}">
          <div class="corpus-result__header">
            <span class="corpus-result__book">${esc(r.book_en)}</span>
            ${r.hadith_num ? `<span class="corpus-result__num">№ ${esc(r.hadith_num)}</span>` : ''}
          </div>
          ${r.chapter_en ? `<h3 class="corpus-result__chapter">${esc(toPlainText(r.chapter_en))}</h3>` : ''}
          <div class="corpus-result__cols">
            <div class="corpus-result__col corpus-result__col--en">
              <p class="corpus-result__text">${snippetEn}</p>
            </div>
            ${snippetAr ? `
              <div class="corpus-result__col corpus-result__col--ar">
                <p lang="ar" dir="rtl" class="corpus-result__ar">${snippetAr}</p>
              </div>` : ''}
          </div>
          <div class="corpus-result__meta">
            <span class="corpus-meta-tag">${r.narrator_count} transmitters</span>
            ${Number(r.parallel_count) > 0 ? `
              <span class="corpus-meta-tag">${Number(r.parallel_count).toLocaleString()} parallels</span>` : ''}
          </div>
        </a>
      </li>`;
  }

  function pagerMarkup(data: HadithSearchResponse): string {
    if (data.pages <= 1) return '';
    const page = data.page;
    return `
      <nav class="corpus-pager" aria-label="Result pages">
        ${page > 1
          ? `<button type="button" class="corpus-page" data-page="${page - 1}">← Previous</button>`
          : `<span class="corpus-page" aria-disabled="true">← Previous</span>`}
        <span class="corpus-page-of">
          Page ${page.toLocaleString()} of ${data.pages.toLocaleString()}
        </span>
        ${page < data.pages
          ? `<button type="button" class="corpus-page" data-page="${page + 1}">Next →</button>`
          : `<span class="corpus-page" aria-disabled="true">Next →</span>`}
      </nav>`;
  }

  async function performSearch(page = 1) {
    if (inflight) return;
    const q = (searchInput?.value || '').trim();
    const scope = (scopeSelect?.value || 'all') as any;
    const book = bookSelect?.value ? parseInt(bookSelect.value, 10) : undefined;

    // If query is empty and no book filter, restore collections view
    if (!q && !book) {
      if (resultsContainer) resultsContainer.innerHTML = '';
      if (!collectionsSection && initialCollectionsHtml) {
        const temp = document.createElement('div');
        temp.innerHTML = initialCollectionsHtml;
        collectionsSection = temp.firstElementChild as HTMLElement;
        bodyEl.appendChild(collectionsSection);
      }
      if (collectionsSection) collectionsSection.style.display = '';
      history.replaceState(null, '', '/hadith');
      return;
    }

    if (collectionsSection) collectionsSection.style.display = 'none';
    const degradedEl = bodyEl.querySelector('.corpus-degraded') as HTMLElement | null;
    if (degradedEl) degradedEl.style.display = 'none';

    if (resultsContainer) {
      resultsContainer.setAttribute('aria-busy', 'true');
      resultsContainer.innerHTML = '<div class="corpus-toolbar"><span class="corpus-status">Searching corpus…</span></div>';
    }

    inflight = true;

    try {
      const data = await searchHadithClient({
        q,
        scope,
        book,
        page,
        size: 25
      });

      if (!resultsContainer) return;

      const resultsList = data.results.map((r) => resultRowMarkup(r, q)).join('');
      const statusText = data.total === 0
        ? 'Nothing matched.'
        : `${data.total.toLocaleString()} ${data.total === 1 ? 'narration' : 'narrations'}`;

      resultsContainer.innerHTML = `
        <div class="corpus-toolbar">
          <span class="corpus-status" aria-live="polite">
            ${statusText} ${q ? `<span class="corpus-status__for">for “${esc(q)}”</span>` : ''}
          </span>
        </div>
        ${data.results.length > 0 ? `
          <ol class="corpus-results">
            ${resultsList}
          </ol>
          ${pagerMarkup(data)}` : `
          <p class="corpus-empty">
            Nothing matched. Arabic is folded for spelling variation, so عائشة and عايشة find the same records; try fewer words rather than different ones.
          </p>`}
      `;

      // Update URL without page reload
      const nextUrl = new URL(location.href);
      if (q) nextUrl.searchParams.set('q', q);
      else nextUrl.searchParams.delete('q');
      if (scope && scope !== 'all') nextUrl.searchParams.set('scope', scope);
      else nextUrl.searchParams.delete('scope');
      if (book) nextUrl.searchParams.set('book', String(book));
      else nextUrl.searchParams.delete('book');
      if (page > 1) nextUrl.searchParams.set('page', String(page));
      else nextUrl.searchParams.delete('page');

      history.pushState(null, '', nextUrl.toString());
    } catch (err) {
      console.warn('In-browser search error, submitting to server:', err);
      formEl.submit();
    } finally {
      inflight = false;
      resultsContainer?.removeAttribute('aria-busy');
    }
  }

  // Intercept form submission
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch(1);
  });

  // Handle select filter changes
  scopeSelect?.addEventListener('change', () => performSearch(1));
  bookSelect?.addEventListener('change', () => performSearch(1));

  // Handle pagination button clicks
  resultsContainer?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button.corpus-page') as HTMLButtonElement | null;
    if (!btn || !btn.dataset.page) return;
    e.preventDefault();
    const targetPage = parseInt(btn.dataset.page, 10);
    if (targetPage > 0) {
      performSearch(targetPage);
      window.scrollTo({ top: formEl.offsetTop - 40, behavior: 'smooth' });
    }
  });

  // If arriving on page with query params, run search client-side
  const currentParams = new URLSearchParams(location.search);
  if (currentParams.has('q') || currentParams.has('book')) {
    performSearch(parseInt(currentParams.get('page') || '1', 10) || 1);
  }
}
