/**
 * Client logic for the narrator register.
 *
 * Extracted from src/pages/narrators/index.astro, which had grown to 3,864
 * lines of markup, CSS and script in one file. The behavioural change is that
 * this queries /api/narrators instead of downloading a 5.2 MB index and
 * filtering 20,950 records in the browser — filtering, sorting and pagination
 * are now the database's job, so a page of results is a few KB.
 */

export interface NarratorRow {
  id: number;
  name_en: string;
  name_ar: string;
  generation: string;
  grade: string;
  tabaqa_number: number | null;
  death_hijri: number | null;
  death_gregorian: number | null;
  death_place: string;
  places_en: string[];
  hadith_count: number;
  teacher_count: number;
  student_count: number;
  critic_count: number;
  statement_count: number;
  jarh_count: number;
  tadil_count: number;
  flags: string[];
}

interface QueryResponse {
  total: number;
  page: number;
  size: number;
  pages: number;
  results: NarratorRow[];
}

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

  let inflight: AbortController | null = null;

  function syncUrl() {
    const next = new URLSearchParams();
    for (const k of PARAM_KEYS) if (state[k] && state[k] !== DEFAULTS[k]) next.set(k, state[k]);
    const qs = next.toString();
    history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
  }

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
    return `
      <li class="reg-row">
        <span class="reg-index">${index}</span>
        <a class="reg-main" href="/narrators/${r.id}">
          <span class="reg-names">
            <span class="reg-name">${esc(r.name_en || r.name_ar)}</span>
            ${r.name_ar ? `<span class="reg-name-ar" lang="ar" dir="rtl">${esc(r.name_ar)}</span>` : ''}
          </span>
          <span class="reg-meta">${meta}</span>
        </a>
        <span class="reg-grade">${esc(r.grade || 'Unrated')}</span>
        <span class="reg-counts">${counts}</span>
        <button type="button" class="reg-pick${picked ? ' is-picked' : ''}"
                data-pick="${r.id}" data-name="${esc(r.name_en || r.name_ar)}"
                aria-pressed="${picked}"
                aria-label="${picked ? 'Remove from' : 'Add to'} comparison: ${esc(r.name_en || r.name_ar)}">
          <span aria-hidden="true">${picked ? '−' : '+'}</span>
        </button>
      </li>`;
  }

  function pagerMarkup(data: QueryResponse): string {
    if (data.pages <= 1) return '';
    const page = data.page;
    const btn = (p: number, label: string, disabled: boolean) =>
      `<button type="button" class="reg-page" data-page="${p}"${disabled ? ' disabled' : ''}>${label}</button>`;
    return `
      ${btn(page - 1, '← Previous', page <= 1)}
      <span class="reg-page-of">Page ${page.toLocaleString()} of ${data.pages.toLocaleString()}</span>
      ${btn(page + 1, 'Next →', page >= data.pages)}`;
  }

  async function load() {
    inflight?.abort();
    inflight = new AbortController();

    const qs = new URLSearchParams();
    for (const k of PARAM_KEYS) if (state[k] && state[k] !== DEFAULTS[k]) qs.set(k, state[k]);
    qs.set('page', state.page);
    qs.set('size', state.size);

    list.setAttribute('aria-busy', 'true');
    status.textContent = 'Searching…';

    try {
      const res = await fetch(`/api/narrators?${qs}`, { signal: inflight.signal });
      if (!res.ok) throw new Error(`Register query failed (${res.status})`);
      const data = (await res.json()) as QueryResponse;

      const first = (data.page - 1) * data.size + 1;
      list.innerHTML = data.results.map((r, i) => rowMarkup(r, first + i)).join('');
      pager.innerHTML = pagerMarkup(data);

      status.textContent = data.total
        ? `${data.total.toLocaleString()} transmitter${data.total === 1 ? '' : 's'}`
        : 'No transmitters match these filters.';
      syncUrl();
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Narrator register load failed', err);
      status.textContent = 'The register could not be loaded. Try again.';
      list.innerHTML = '';
      pager.innerHTML = '';
    } finally {
      list.removeAttribute('aria-busy');
    }
  }

  function setState(patch: Partial<Record<ParamKey, string>>, resetPage = true) {
    Object.assign(state, patch);
    if (resetPage && !('page' in patch)) state.page = '1';
    load();
  }

  // ---- filter controls -----------------------------------------------------
  for (const group of root.querySelectorAll<HTMLElement>('[data-filter-group]')) {
    const key = group.dataset.filterGroup as ParamKey;
    group.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-value]');
      if (!btn) return;
      // Filters are anchors so they work with scripting off. When this module
      // is running it swaps the list in place instead of navigating.
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
    debounce = window.setTimeout(() => setState({ q: searchInput.value.trim() }), 220);
  });
  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    setState({ q: '' });
    searchInput.focus();
  });

  // ---- pagination ----------------------------------------------------------
  pager.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-page]');
    if (!btn || btn.disabled) return;
    setState({ page: btn.dataset.page || '1' }, false);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    location.href = `/narrators/compare?ids=${[...selected.keys()].join(',')}`;
  });

  load();
}
