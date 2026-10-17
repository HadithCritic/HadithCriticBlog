/** Enhance the pre-rendered book catalogue. No corpus reads or data mutation. */
export function initCollectionBrowser(): void {
  const root = document.querySelector<HTMLElement>('[data-collection-browser]');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const list = root.querySelector<HTMLOListElement>('.edition-books__list');
  if (!list) return;
  const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-book-card]'));
  const sort = document.querySelector('[data-book-sort]') as unknown as HTMLSelectElement | null;
  const query = document.querySelector<HTMLInputElement>('[data-book-query]');
  const length = document.querySelector('[data-book-length]') as unknown as HTMLSelectElement | null;
  const reset = document.querySelector<HTMLButtonElement>('[data-book-reset]');
  const more = root.querySelector<HTMLButtonElement>('[data-book-more]');
  const status = root.querySelector<HTMLElement>('[data-book-status]');
  const empty = root.querySelector<HTMLElement>('[data-book-empty]');
  let expanded = false;

  const update = () => {
    const term = (query?.value || '').trim().toLocaleLowerCase();
    const range = length?.value || 'all';
    const filtered = cards.filter(card => {
      const count = Number(card.dataset.count);
      const matchesLength = range === 'all' || (range === 'short' && count < 100)
        || (range === 'medium' && count >= 100 && count < 500) || (range === 'long' && count >= 500);
      return matchesLength && (card.dataset.title || '').toLocaleLowerCase().includes(term);
    });
    filtered.sort((a, b) => {
      if (sort?.value === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '');
      if (sort?.value === 'extent') return Number(b.dataset.count) - Number(a.dataset.count) || Number(a.dataset.number) - Number(b.dataset.number);
      return Number(a.dataset.number) - Number(b.dataset.number);
    });
    const visible = expanded ? filtered : filtered.slice(0, 9);
    cards.forEach(card => { card.hidden = true; });
    filtered.forEach(card => { list.appendChild(card); });
    visible.forEach(card => { card.hidden = false; });
    if (status) status.textContent = `${visible.length.toLocaleString()} of ${filtered.length.toLocaleString()} ${root.dataset.divisions || 'books'}`;
    if (empty) empty.hidden = filtered.length > 0;
    if (more) {
      more.hidden = filtered.length <= 9;
      more.textContent = expanded ? 'Show fewer' : `View all ${filtered.length.toLocaleString()} ${root.dataset.divisions || 'books'} →`;
      more.setAttribute('aria-expanded', String(expanded));
    }
  };
  document.querySelectorAll<HTMLElement>('[data-book-controls]').forEach(control => { control.hidden = false; });
  sort?.addEventListener('change', update);
  query?.addEventListener('input', () => { expanded = false; update(); });
  length?.addEventListener('change', () => { expanded = false; update(); });
  reset?.addEventListener('click', () => {
    if (sort) sort.value = 'order';
    if (query) query.value = '';
    if (length) length.value = 'all';
    expanded = false;
    update();
  });
  more?.addEventListener('click', () => {
    expanded = !expanded;
    update();
    // Keep keyboard focus in view when the extended catalogue collapses.
    if (!expanded) more.scrollIntoView({ block: 'nearest' });
  });
  root.querySelectorAll<HTMLButtonElement>('[data-book-view]').forEach(button => {
    button.addEventListener('click', () => {
      root.dataset.view = button.dataset.bookView;
      root.querySelectorAll<HTMLButtonElement>('[data-book-view]').forEach(toggle => {
        toggle.setAttribute('aria-pressed', String(toggle === button));
      });
    });
  });
  update();
}
