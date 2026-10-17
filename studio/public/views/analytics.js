import { el, number, bytes, percent, day, stat, table, barChart, viewHead, card, errorLine } from './common.js';

const RANGES = [[7, '7 days'], [30, '30 days'], [90, '90 days'], [365, '1 year']];

export function analyticsView(root, { api, titleFor }) {
  let range = 30;
  let loading = false;

  const picker = el('div', undefined, 'segmented segmented--range');
  picker.setAttribute('role', 'group');
  picker.setAttribute('aria-label', 'Date range');
  const rangeButtons = RANGES.map(([days, label]) => {
    const item = el('button', label, 'filter');
    item.type = 'button';
    item.addEventListener('click', () => { if (!loading && range !== days) { range = days; load(); } });
    item.dataset.days = String(days);
    return item;
  });
  picker.append(...rangeButtons);
  const status = el('p', '', 'view-status');
  status.setAttribute('role', 'status');
  const body = el('div', undefined, 'view-body');
  root.replaceChildren(
    viewHead('Cloudflare edge', 'Analytics', 'Requests counted by Cloudflare as they reach the site. There is no tracking script, so nothing here identifies a reader.', [picker]),
    status, body
  );

  function syncPicker() {
    for (const item of rangeButtons) {
      const active = Number(item.dataset.days) === range;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    }
  }

  function render(data) {
    const t = data.totals;
    const stats = el('div', undefined, 'stats stats--five');
    stats.append(
      stat('Page views', number(t.pageViews)),
      stat('Visitors a day', number(t.averageDailyUniques), 'Average of daily unique IPs'),
      stat('Requests', number(t.requests)),
      stat('Served from cache', percent(t.cachedShare)),
      stat('Data served', bytes(t.bytes))
    );

    const points = data.daily.map((row) => ({ label: day(row.date), value: row.pageViews }));
    const daily = card('Page views by day', `${data.daily.length} days`,
      points.length ? barChart(points, { label: `Page views per day over ${data.daily.length} days` }) : el('p', 'No traffic recorded for this range.', 'empty-line'));
    const dailyTable = el('details', undefined, 'disclosure');
    dailyTable.append(el('summary', 'Show the numbers'), table('Daily traffic', ['Day', 'Page views', 'Visitors', 'Requests'], [...data.daily].reverse().map((row) => [day(row.date), number(row.pageViews), number(row.uniques), number(row.requests)]), { numeric: [1, 2, 3] }));
    daily.append(dailyTable);

    const detailNote = data.days > data.detailDays ? `Last ${data.detailDays} days (the free plan's limit)` : `Last ${data.detailDays} days`;
    const articleRows = data.articles.map((row) => {
      const cell = el('span', undefined, 'cell-title');
      const title = titleFor(row.path);
      cell.append(el('span', title || row.path, title ? 'cell-title__main' : 'cell-title__path'));
      if (title) cell.append(el('span', row.path, 'cell-title__path'));
      return [cell, number(row.visits), number(row.views)];
    });
    const articles = card('Most read studies', detailNote,
      articleRows.length ? table('Most read studies', ['Study', 'Visits', 'Page views'], articleRows, { numeric: [1, 2] }) : el('p', 'No article views in this range.', 'empty-line'));
    const pages = card('Top pages', detailNote, table('Top pages', ['Path', 'Visits'], data.pages.map((row) => [row.path, number(row.visits)]), { numeric: [1] }));
    const countries = card('Countries', detailNote, table('Visits by country', ['Country', 'Visits'], data.countries.map((row) => [row.country || 'Unknown', number(row.visits)]), { numeric: [1] }));
    const corpus = card('Corpus data', detailNote, el('p', `${number(data.corpus.requests)} range reads, ${bytes(data.corpus.bytes)} served from data.hadithcriticblog.com.`, 'card__text'));
    const bots = card('Known crawlers', detailNote, data.bots.length
      ? table('Requests from verified bots', ['Category', 'Requests'], data.bots.map((row) => [row.category, number(row.requests)]), { numeric: [1] })
      : el('p', 'No verified crawler traffic.', 'empty-line'));

    const grid = el('div', undefined, 'view-grid');
    grid.append(articles, el('div', undefined, 'view-stack'));
    grid.lastChild.append(countries, pages);
    const lower = el('div', undefined, 'view-grid view-grid--even');
    lower.append(corpus, bots);
    const caveat = el('p', 'These are edge counts. They exclude crawlers Cloudflare has verified but still include unidentified bots, so read them as an upper bound. Referrers are not available on the free plan.', 'view-note');
    body.replaceChildren(stats, daily, grid, lower, caveat);
  }

  async function load() {
    loading = true;
    syncPicker();
    status.textContent = 'Reading Cloudflare analytics…';
    body.setAttribute('aria-busy', 'true');
    try {
      const data = await api(`/api/analytics?days=${range}`);
      render(data);
      status.textContent = `Updated ${new Date(data.generatedAt).toLocaleTimeString()}${data.cached ? ' (cached for up to five minutes)' : ''}.`;
    } catch (error) {
      body.replaceChildren(errorLine(error.message));
      status.textContent = '';
    } finally {
      loading = false;
      body.removeAttribute('aria-busy');
    }
  }

  return { show: () => { if (!body.childElementCount) load(); } };
}
