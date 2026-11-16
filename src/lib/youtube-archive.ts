/* The YouTube page's video grid: kind filters and order.

     [data-video-filter="all|lecture|debate|short"]  the filter buttons
     [data-video-order]                               newest, oldest or views
     [data-video-grid]                                the list of .yt-card rows
     [data-video-status]                              the count under the bar

   Without script every video shows, newest first, and the controls stay
   hidden ([data-js-only]). The chosen filter and order are kept in the URL
   (?kind=, ?order=) so a view can be shared. */

type Order = 'newest' | 'oldest' | 'views';

const ORDERS: Order[] = ['newest', 'oldest', 'views'];
const NOUN: Record<string, [string, string]> = {
  all: ['video', 'videos'],
  lecture: ['lecture', 'lectures'],
  debate: ['debate', 'debates'],
  short: ['short', 'shorts'],
};

const score = (card: HTMLElement, order: Order): number =>
  order === 'views' ? -Number(card.dataset.views) : (order === 'oldest' ? 1 : -1) * Number(card.dataset.timestamp);

export function initVideoArchive(root: ParentNode = document): void {
  const grid = root.querySelector<HTMLElement>('[data-video-grid]');
  const status = root.querySelector<HTMLElement>('[data-video-status]');
  const select = root.querySelector('[data-video-order]') as HTMLSelectElement | null;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-video-filter]')];
  if (!grid) return;
  const cards = [...grid.querySelectorAll<HTMLElement>('.yt-card')];
  root.querySelectorAll<HTMLElement>('[data-js-only]').forEach((element) => (element.hidden = false));

  let kind = 'all';
  let order: Order = 'newest';

  const syncUrl = (): void => {
    const url = new URL(location.href);
    if (kind === 'all') url.searchParams.delete('kind');
    else url.searchParams.set('kind', kind);
    if (order === 'newest') url.searchParams.delete('order');
    else url.searchParams.set('order', order);
    history.replaceState(history.state, '', url);
  };

  const apply = (): void => {
    let shown = 0;
    for (const card of cards) {
      const visible = kind === 'all' || card.dataset.kind === kind;
      card.hidden = !visible;
      if (visible) shown += 1;
    }
    [...cards].sort((a, b) => score(a, order) - score(b, order)).forEach((card) => grid.appendChild(card));
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.videoFilter === kind));
    if (status) {
      const [one, many] = NOUN[kind] ?? NOUN.all;
      status.textContent = `${shown} ${shown === 1 ? one : many}`;
    }
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      kind = button.dataset.videoFilter ?? 'all';
      apply();
      syncUrl();
    });
  }

  select?.addEventListener('change', () => {
    order = ORDERS.includes(select.value as Order) ? (select.value as Order) : 'newest';
    apply();
    syncUrl();
  });

  const params = new URLSearchParams(location.search);
  const wanted = params.get('kind');
  if (wanted && buttons.some((button) => button.dataset.videoFilter === wanted)) kind = wanted;
  const wantedOrder = params.get('order') as Order | null;
  if (wantedOrder && ORDERS.includes(wantedOrder)) order = wantedOrder;
  if (select) select.value = order;
  apply();
}
