/* The ICMA Register's grid: search, family filters and order.

     [data-icma-query]                  the search input
     [data-icma-family="all|<family>"]  the filter buttons
     [data-icma-order]                  newest, oldest or title
     [data-icma-grid]                   the list of [data-study] cards
     [data-icma-status]                 the count under the bar
     [data-icma-reset]                  clears search and filter
     [data-icma-empty]                  shown when nothing matches

   Without script every study shows, newest first, and the controls stay
   hidden ([data-js-only]). The search, family and order are kept in the URL
   (?q=, ?family=, ?order=) so a view can be shared. */

type Order = 'newest' | 'oldest' | 'title';

const ORDERS: Order[] = ['newest', 'oldest', 'title'];

/* Transliteration is folded on both sides, so "zuhri" finds al-Zuhrī and
   "ata" finds ʿAṭāʾ. */
const fold = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʿʾ'’‘`]/g, '')
    .toLowerCase();

const compare = (order: Order) => (a: HTMLElement, b: HTMLElement): number => {
  if (order === 'title') return (a.dataset.title ?? '').localeCompare(b.dataset.title ?? '', 'en');
  const delta = Number(a.dataset.no) - Number(b.dataset.no);
  return order === 'oldest' ? delta : -delta;
};

export function initIcmaRegister(root: ParentNode = document): void {
  const grid = root.querySelector<HTMLElement>('[data-icma-grid]');
  if (!grid) return;
  const input = root.querySelector('[data-icma-query]') as HTMLInputElement | null;
  const select = root.querySelector('[data-icma-order]') as HTMLSelectElement | null;
  const status = root.querySelector<HTMLElement>('[data-icma-status]');
  const reset = root.querySelector<HTMLButtonElement>('[data-icma-reset]');
  const empty = root.querySelector<HTMLElement>('[data-icma-empty]');
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-icma-family]')];
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-study]')];
  const haystacks = new Map(cards.map((card) => [card, fold(card.dataset.search ?? '')]));
  const families = new Set(buttons.map((button) => button.dataset.icmaFamily));
  const labels = new Map(buttons.map((button) => [button.dataset.icmaFamily, button.dataset.label ?? '']));

  root.querySelectorAll<HTMLElement>('[data-js-only]').forEach((element) => (element.hidden = false));

  const params = new URLSearchParams(location.search);
  let family = families.has(params.get('family') ?? '') ? (params.get('family') as string) : 'all';
  let order: Order = ORDERS.includes(params.get('order') as Order) ? (params.get('order') as Order) : 'newest';
  if (input) input.value = params.get('q') ?? '';
  if (select) select.value = order;

  const syncUrl = (raw: string): void => {
    const url = new URL(location.href);
    const set = (key: string, value: string, fallback: string): void => {
      if (value === fallback) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    };
    set('q', raw, '');
    set('family', family, 'all');
    set('order', order, 'newest');
    history.replaceState(history.state, '', url);
  };

  const describe = (shown: number, raw: string): string => {
    const noun = shown === 1 ? 'study' : 'studies';
    const scope = family === 'all' ? '' : ` in ${labels.get(family)}`;
    const match = raw ? ` matching “${raw}”` : '';
    return `${shown} ${noun}${scope}${match}`;
  };

  const apply = (): void => {
    const raw = input?.value.trim() ?? '';
    const query = fold(raw);
    let shown = 0;
    for (const card of cards) {
      const visible =
        (family === 'all' || card.dataset.family === family) &&
        (query === '' || (haystacks.get(card) ?? '').includes(query));
      card.hidden = !visible;
      if (visible) shown += 1;
    }
    [...cards].sort(compare(order)).forEach((card) => grid.appendChild(card));
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.icmaFamily === family));
    if (status) status.textContent = describe(shown, raw);
    if (reset) reset.hidden = family === 'all' && raw === '';
    if (empty) empty.hidden = shown > 0;
    syncUrl(raw);
  };

  input?.addEventListener('input', apply);
  select?.addEventListener('change', () => {
    order = ORDERS.includes(select.value as Order) ? (select.value as Order) : 'newest';
    apply();
  });
  for (const button of buttons) {
    button.addEventListener('click', () => {
      family = button.dataset.icmaFamily ?? 'all';
      apply();
    });
  }
  const clear = (): void => {
    if (input) input.value = '';
    family = 'all';
    apply();
    input?.focus();
  };
  reset?.addEventListener('click', clear);
  root.querySelector<HTMLButtonElement>('[data-icma-empty] button')?.addEventListener('click', clear);

  /* "/" jumps to the search box from anywhere on the page. */
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
    if (target instanceof HTMLElement && target.isContentEditable) return;
    event.preventDefault();
    input?.focus();
  });

  apply();
}
