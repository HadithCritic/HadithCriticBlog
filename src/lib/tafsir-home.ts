/* The Tafsir front page's surah index: search by name, Arabic or number,
   filter by whether commentary is imported, and show the first sixteen until
   the reader asks for all. Without script every card is shown except those
   past the first sixteen, and "/" is not bound. */

const fold = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase().replace(/[ʿ‘’ʼʾ'`]/g, '').replace(/[\s-]/g, '');

export function initArchive() {
  const root = document.querySelector<HTMLElement>('[data-archive]');
  if (!root) return;
  const items = [...root.querySelectorAll<HTMLElement>('[data-surah-item]')];
  const search = root.querySelector<HTMLInputElement>('[data-archive-search]');
  const clear = root.querySelector<HTMLButtonElement>('[data-archive-clear]');
  const count = root.querySelector<HTMLElement>('[data-archive-count]');
  const empty = root.querySelector<HTMLElement>('[data-archive-empty]');
  const more = root.querySelector<HTMLButtonElement>('[data-archive-more]');
  const moreWrap = root.querySelector<HTMLElement>('[data-archive-more-wrap]');
  const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const initial = Number(root.dataset.initial) || 16;
  let active = 'all';
  let expanded = false;

  const refresh = () => {
    const query = fold(search?.value.trim() ?? '');
    const matching = items.filter((item) => {
      if (active !== 'all' && item.dataset.status !== active) return false;
      if (!query) return true;
      return fold(item.dataset.name ?? '').includes(query) || fold(item.dataset.ar ?? '').includes(query) || (item.dataset.n ?? '') === query || (item.dataset.n ?? '').startsWith(query);
    });
    const limited = active === 'all' && !query && !expanded;
    const shown = new Set(limited ? matching.slice(0, initial) : matching);
    items.forEach((item) => (item.hidden = !shown.has(item)));
    if (count) count.textContent = `Showing ${shown.size} of ${matching.length} surahs${query ? ' matching your search' : ''}`;
    if (empty) empty.hidden = matching.length > 0;
    const offer = active === 'all' && !query && matching.length > initial;
    if (moreWrap) moreWrap.hidden = !offer;
    if (more) {
      more.innerHTML = expanded ? 'Show fewer surahs <span aria-hidden="true">↑</span>' : `View all ${matching.length} surahs <span aria-hidden="true">↓</span>`;
      more.setAttribute('aria-expanded', String(expanded));
    }
    if (clear) clear.hidden = !search?.value;
  };

  filters.forEach((button) =>
    button.addEventListener('click', () => {
      active = button.dataset.filter ?? 'all';
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      refresh();
    }),
  );
  search?.addEventListener('input', refresh);
  clear?.addEventListener('click', () => {
    if (search) search.value = '';
    search?.focus();
    refresh();
  });
  more?.addEventListener('click', () => {
    expanded = !expanded;
    refresh();
    if (!expanded) root.scrollIntoView({ block: 'start' });
  });
  window.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    if (event.key === '/' && !target.closest('input, textarea, select, [contenteditable]')) {
      event.preventDefault();
      search?.focus();
    } else if (event.key === 'Escape' && target === search) {
      search.value = '';
      search.blur();
      refresh();
    }
  });
  refresh();
}
