/**
 * Enhance the prerendered book index on a collection page: title search,
 * sort, a narration-length filter, and grid or list view. Every book stays in
 * the markup, so the page works without script. No corpus reads.
 */

type Length = 'all' | 'short' | 'medium' | 'long';

function matchesLength(count: number, band: Length): boolean {
  if (band === 'short') return count < 100;
  if (band === 'medium') return count >= 100 && count < 500;
  if (band === 'long') return count >= 500;
  return true;
}

function pressOnly(buttons: HTMLButtonElement[], active: HTMLButtonElement): void {
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === active)));
}

export function initCollectionBrowser(): void {
  const root = document.querySelector<HTMLElement>('[data-collection-browser]');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const list = root.querySelector<HTMLOListElement>('.edition-books__list');
  if (!list) return;

  const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-book-card]'));
  const bars = Array.from(root.querySelectorAll<HTMLElement>('[data-bar]'));
  // The project's server/client DOM declarations disagree on select.remove().
  const sort = root.querySelector('[data-book-sort]') as unknown as HTMLSelectElement | null;
  const query = root.querySelector<HTMLInputElement>('[data-book-query]');
  const lengthButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-book-length]'));
  const viewButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-book-view]'));
  const status = root.querySelector<HTMLElement>('[data-book-status]');
  const empty = root.querySelector<HTMLElement>('[data-book-empty]');
  const noun = root.dataset.divisions || 'books';
  let band: Length = 'all';

  const update = () => {
    const term = (query?.value || '').trim().toLocaleLowerCase();
    const shown = cards.filter((card) =>
      matchesLength(Number(card.dataset.count), band) && (card.dataset.title || '').toLocaleLowerCase().includes(term));
    const visible = new Set(shown.map((card) => card.dataset.number));
    const ordered = [...cards].sort((a, b) => {
      if (sort?.value === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '');
      if (sort?.value === 'extent') return Number(b.dataset.count) - Number(a.dataset.count) || Number(a.dataset.number) - Number(b.dataset.number);
      return Number(a.dataset.number) - Number(b.dataset.number);
    });
    ordered.forEach((card) => {
      card.hidden = !visible.has(card.dataset.number);
      list.appendChild(card);
    });
    bars.forEach((bar) => bar.classList.toggle('is-dim', !visible.has(bar.dataset.bar)));
    if (status) status.textContent = `${shown.length.toLocaleString()} of ${cards.length.toLocaleString()} ${noun}`;
    if (empty) empty.hidden = shown.length > 0;
  };

  root.querySelectorAll<HTMLElement>('[data-book-controls]').forEach((control) => { control.hidden = false; });
  sort?.addEventListener('change', update);
  query?.addEventListener('input', update);
  lengthButtons.forEach((button) => button.addEventListener('click', () => {
    band = (button.dataset.bookLength as Length) || 'all';
    pressOnly(lengthButtons, button);
    update();
  }));
  viewButtons.forEach((button) => button.addEventListener('click', () => {
    root.dataset.view = button.dataset.bookView;
    pressOnly(viewButtons, button);
  }));
  update();
}
