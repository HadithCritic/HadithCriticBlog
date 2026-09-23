/**
 * Client logic for the narrator register.
 *
 * Extracted from src/pages/narrators/index.astro, which had grown to 3,864
 * lines of markup, CSS and script in one file. It first replaced a 5.2 MB index
 * downloaded and filtered in the browser with queries to a hosted database; it
 * now runs those same queries against the static SQLite corpus, still in the
 * browser, over HTTP range requests. Filtering, sorting and paging are SQL, so
 * a page of results costs a handful of cached range requests and no database.
 *
 * This module is now the only thing that renders a register row. It used to be
 * the second of two: the page server-rendered the first fifty rows and this
 * re-rendered them on the first filter click, so a change to a row's markup had
 * to be made in both places or it reverted under the reader's hands. There is
 * one renderer now, and that class of bug went with the other one.
 */

import {
  CorpusUnavailableError,
  searchNarrators,
  type NarratorRecord,
  type NarratorSearchResponse
} from './corpus-client';
import { CORPUS_META } from './corpus-config';

export type NarratorRow = NarratorRecord;
type QueryResponse = NarratorSearchResponse;

export interface Facet {
  value: string | number;
  n: number;
}

const PARAM_KEYS = ['q', 'generation', 'grade', 'century', 'sort', 'page', 'size', 'graded'] as const;
type ParamKey = (typeof PARAM_KEYS)[number];

const DEFAULTS: Record<ParamKey, string> = {
  q: '',
  generation: 'all',
  grade: 'all',
  century: '',
  sort: 'id',
  page: '1',
  size: '50',
  graded: ''
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  );

export function initNarratorRegister(): void {
  const root = document.querySelector<HTMLElement>('[data-register]');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const list = root.querySelector<HTMLElement>('[data-register-list]')!;
  const status = root.querySelector<HTMLElement>('[data-register-status]')!;
  const pager = root.querySelector<HTMLElement>('[data-register-pager]')!;
  const searchInput = root.querySelector<HTMLInputElement>('[data-register-search]')!;
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-register-clear]');
  const dock = root.querySelector<HTMLElement>('[data-compare-dock]');
  const dockCount = root.querySelector<HTMLElement>('[data-compare-count]');
  const dockList = root.querySelector<HTMLElement>('[data-compare-chips]');

  const params = new URLSearchParams(location.search);
  const state: Record<ParamKey, string> = { ...DEFAULTS };
  for (const k of PARAM_KEYS) if (params.has(k)) state[k] = params.get(k) || DEFAULTS[k];

  // Comparison survives filtering and paging, so it is keyed by id rather than
  // by row position.
  const selected = new Map<number, string>();

  /**
   * Discriminates a stale answer from the current one. The corpus is read
   * locally, so there is no request to abort; what has to be prevented is an
   * earlier query resolving after a later one and overwriting the list.
   */
  let token = 0;

  function syncUrl(push: boolean) {
    const next = new URLSearchParams();
    for (const k of PARAM_KEYS) if (state[k] && state[k] !== DEFAULTS[k]) next.set(k, state[k]);
    const qs = next.toString();
    const url = qs ? `${location.pathname}?${qs}` : location.pathname;
    // Typing replaces, so the search box does not bury the previous page under
    // one history entry per keystroke. A filter, sort or page is a deliberate
    // move and earns its own entry, which is what the back button is for.
    if (push) history.pushState(null, '', url);
    else history.replaceState(null, '', url);
  }

  const gradeTone = (g: string) => {
    const s = (g || '').toLowerCase();
    if (s.startsWith('thiqa') || s.startsWith('saduq')) return 'is-trusted';
    if (s.startsWith("da'if") || s.startsWith('daif') || s.startsWith('matruk')) return 'is-weak';
    if (s.startsWith('majhul') || s.startsWith('maqbul') || s.startsWith('unrated')) return 'is-unknown';
    return '';
  };

  function rowMarkup(r: NarratorRow, index: number): string {
    const meta = [
      r.generation,
      r.death_hijri ? `d. ${r.death_hijri} AH` : null,
      r.places_en?.[0] || r.death_place || null
    ]
      .filter(Boolean)
      .map((m) => `<span>${esc(m)}</span>`)
      .join('<span class="reg-sep" aria-hidden="true">·</span>');

    const counts = [
      r.hadith_count ? `${r.hadith_count.toLocaleString()} hadith` : null,
      r.teacher_count || r.student_count ? `${r.teacher_count}T / ${r.student_count}S` : null,
      r.statement_count ? `${r.statement_count} statements` : null
    ]
      .filter(Boolean)
      .map((m) => `<span>${esc(m)}</span>`)
      .join('<span class="reg-sep" aria-hidden="true">·</span>');

    const picked = selected.has(r.id);
    const gradeCls = gradeTone(r.grade);

    return `
      <li class="reg-row">
        <button type="button" class="reg-pick${picked ? ' is-picked' : ''}"
                data-pick="${r.id}" data-name="${esc(r.name_en || r.name_ar)}"
                aria-pressed="${picked}"
                aria-label="${picked ? 'Remove from' : 'Add to'} comparison: ${esc(r.name_en || r.name_ar)}">
          <span aria-hidden="true">${picked ? '−' : '+'}</span>
        </button>
        <span class="reg-index">${index}</span>
        <a class="reg-main" href="/narrators/${r.id}/">
          <span class="reg-names">
            <span class="reg-name">${esc(r.name_en || r.name_ar)}</span>
            ${r.name_ar ? `<span class="reg-name-ar" lang="ar" dir="rtl">${esc(r.name_ar)}</span>` : ''}
          </span>
          <span class="reg-meta">${meta}</span>
        </a>
        <span class="reg-grade ${gradeCls}">${esc(r.grade || 'Unrated')}</span>
        <span class="reg-counts">${counts}</span>
      </li>`;
  }

  function pageHref(page: number): string {
    const next = new URLSearchParams();
    for (const k of PARAM_KEYS) if (state[k] && state[k] !== DEFAULTS[k]) next.set(k, state[k]);
    if (page > 1) next.set('page', String(page));
    else next.delete('page');
    const qs = next.toString();
    return qs ? `/narrators?${qs}` : '/narrators';
  }

  function pagerMarkup(data: QueryResponse): string {
    if (data.pages <= 1) return '';
    const page = data.page;
    // Anchors rather than buttons: a real href can be opened in a new tab or
    // copied, and the handler below only intercepts a plain left click.
    const link = (p: number, label: string, disabled: boolean) =>
      disabled
        ? `<span class="reg-page" aria-disabled="true">${label}</span>`
        : `<a class="reg-page" href="${esc(pageHref(p))}" data-page="${p}">${label}</a>`;
    return `
      ${link(page - 1, '← Previous', page <= 1)}
      <span class="reg-page-of">Page ${page.toLocaleString()} of ${data.pages.toLocaleString()}</span>
      ${link(page + 1, 'Next →', page >= data.pages)}`;
  }

  /**
   * Whether anything beyond the register's own `unnamed = 0` baseline narrows
   * the set. When nothing does, the total is a figure generated alongside the
   * corpus, so it is read rather than counted: a `COUNT(*)` over 20,915 rows to
   * render fifty of them is a scan the reader waits through for an answer that
   * is the same on every visit.
   */
  const unfiltered = () =>
    !state.q &&
    state.generation === DEFAULTS.generation &&
    state.grade === DEFAULTS.grade &&
    !state.century &&
    state.graded !== '1';

  async function load(push = false) {
    const mine = ++token;

    list.setAttribute('aria-busy', 'true');
    status.textContent = 'Searching…';

    try {
      const data: QueryResponse = await searchNarrators({
        q: state.q,
        generation: state.generation,
        grade: state.grade,
        century: state.century ? parseInt(state.century, 10) : undefined,
        sort: state.sort,
        page: parseInt(state.page, 10) || 1,
        size: parseInt(state.size, 10) || 50,
        graded: state.graded === '1',
        knownTotal: unfiltered() ? CORPUS_META.counts.narrators : undefined
      });

      // A later query overtook this one; its answer is the current truth.
      if (mine !== token) return;

      const first = (data.page - 1) * data.size + 1;
      list.innerHTML = data.results.map((r, i) => rowMarkup(r, first + i)).join('');
      list.setAttribute('start', String(first));
      pager.innerHTML = pagerMarkup(data);

      status.textContent = data.total
        ? `${data.total.toLocaleString()} transmitter${data.total === 1 ? '' : 's'}`
        : 'No transmitters match these filters.';
      syncUrl(push);
    } catch (err) {
      if (mine !== token) return;
      console.error('Narrator register load failed', err);
      status.textContent =
        err instanceof CorpusUnavailableError
          ? 'The corpus could not be loaded, so the register is unavailable right now. The rest of the site is unaffected.'
          : 'The register could not be loaded.';
      list.innerHTML = '';
      pager.innerHTML = '<button type="button" class="reg-page" data-register-retry>Try again</button>';
    } finally {
      if (mine === token) list.removeAttribute('aria-busy');
    }
  }

  function setState(patch: Partial<Record<ParamKey, string>>, resetPage = true, push = true) {
    Object.assign(state, patch);
    if (resetPage && !('page' in patch)) state.page = '1';
    load(push);
  }

  // ---- filter controls -----------------------------------------------------
  for (const group of root.querySelectorAll<HTMLElement>('[data-filter-group]')) {
    const key = group.dataset.filterGroup as ParamKey;
    group.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-value]');
      if (!btn) return;
      // The chip swaps the list in place rather than navigating. There is no
      // server-rendered fallback behind it any more: the register is read from
      // the static corpus here, and the page carries a <noscript> saying so.
      e.preventDefault();
      for (const b of group.querySelectorAll('[data-value]')) b.classList.remove('is-active');
      btn.classList.add('is-active');
      setState({ [key]: btn.dataset.value ?? DEFAULTS[key] } as Partial<Record<ParamKey, string>>);
    });
    // Reflect state restored from the URL.
    const active = group.querySelector<HTMLElement>(`[data-value="${state[key]}"]`);
    if (active) {
      for (const b of group.querySelectorAll('[data-value]')) b.classList.remove('is-active');
      active.classList.add('is-active');
    }
  }

  const sortSelect = root.querySelector('[data-register-sort]') as HTMLSelectElement | null;
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener('change', () => setState({ sort: sortSelect.value }));
  }

  // ---- search --------------------------------------------------------------
  searchInput.value = state.q;
  let debounce: number | undefined;
  searchInput.addEventListener('input', () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => setState({ q: searchInput.value.trim() }, true, false), 220);
  });
  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    setState({ q: '' });
    searchInput.focus();
  });

  // ---- pagination ----------------------------------------------------------
  pager.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-register-retry]')) {
      load(false);
      return;
    }
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-page]');
    if (!link) return;
    const mouse = e as MouseEvent;
    // Let a modified click do what the reader asked with a real URL.
    if (mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.button !== 0) return;
    e.preventDefault();
    setState({ page: link.dataset.page || '1' }, false);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  window.addEventListener('popstate', () => {
    const restored = new URLSearchParams(location.search);
    for (const k of PARAM_KEYS) state[k] = restored.get(k) || DEFAULTS[k];
    searchInput.value = state.q;
    if (sortSelect) sortSelect.value = state.sort;
    for (const group of root.querySelectorAll<HTMLElement>('[data-filter-group]')) {
      const key = group.dataset.filterGroup as ParamKey;
      for (const b of group.querySelectorAll('[data-value]')) b.classList.remove('is-active');
      group.querySelector<HTMLElement>(`[data-value="${state[key]}"]`)?.classList.add('is-active');
    }
    load(false);
  });

  // ---- comparison ----------------------------------------------------------
  function renderDock() {
    if (!dock || !dockCount || !dockList) return;
    dock.hidden = selected.size === 0;
    dockCount.textContent = String(selected.size);
    dockList.innerHTML = [...selected]
      .map(
        ([id, name]) =>
          `<button type="button" class="reg-chip" data-unpick="${id}" aria-label="Remove ${esc(name)}">${esc(name)} <span aria-hidden="true">×</span></button>`
      )
      .join('');
  }

  list.addEventListener('click', (e) => {
    const pick = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-pick]');
    if (!pick) return;
    e.preventDefault();
    const id = Number(pick.dataset.pick);
    if (selected.has(id)) selected.delete(id);
    else selected.set(id, pick.dataset.name || `#${id}`);
    pick.classList.toggle('is-picked', selected.has(id));
    pick.setAttribute('aria-pressed', String(selected.has(id)));
    pick.querySelector('span')!.textContent = selected.has(id) ? '−' : '+';
    renderDock();
  });

  dockList?.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-unpick]');
    if (!chip) return;
    const id = Number(chip.dataset.unpick);
    selected.delete(id);
    const row = list.querySelector<HTMLElement>(`[data-pick="${id}"]`);
    if (row) {
      row.classList.remove('is-picked');
      row.setAttribute('aria-pressed', 'false');
      row.querySelector('span')!.textContent = '+';
    }
    renderDock();
  });

  root.querySelector('[data-compare-clear]')?.addEventListener('click', () => {
    selected.clear();
    for (const b of list.querySelectorAll<HTMLElement>('[data-pick]')) {
      b.classList.remove('is-picked');
      b.setAttribute('aria-pressed', 'false');
      b.querySelector('span')!.textContent = '+';
    }
    renderDock();
  });

  root.querySelector('[data-compare-open]')?.addEventListener('click', () => {
    if (!selected.size) return;
    // The comparison view is a real page so it can be linked and shared, which
    // the previous modal-based workspace could not.
    location.href = `/narrators/compare/?ids=${[...selected.keys()].join(',')}`;
  });

  load(false);
}
