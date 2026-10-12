import { el, when, table, viewHead, button, errorLine } from './common.js';

const LABELS = {
  'draft.save': 'Draft saved', 'draft.archive': 'Draft archived', 'draft.restore': 'Draft restored',
  'media.upload': 'Image uploaded', 'media.archive': 'Image archived', 'media.restore': 'Image restored',
  'publication.prepare': 'Publication prepared', 'publication.cancel': 'Publication cancelled', 'publication.reconcile': 'Publication confirmed',
  'newsletter.send': 'Newsletter sent', 'newsletter.cancel': 'Scheduled newsletter cancelled'
};
const GROUPS = [['all', 'All'], ['draft', 'Drafts'], ['publication', 'Publication'], ['media', 'Images'], ['newsletter', 'Newsletter']];

function describe(event) {
  if (!event.action.startsWith('newsletter.')) return '';
  try {
    const detail = JSON.parse(event.detail);
    if (event.action === 'newsletter.send') return `${detail.subject || ''} · ${detail.recipients} recipients${detail.scheduledAt ? ` · scheduled ${when(detail.scheduledAt)}` : ''}`;
    return detail.subject || '';
  } catch { return ''; }
}

export function activityView(root, { api, titleForPath, openArticle }) {
  let events = [];
  let group = 'all';
  const filters = el('div', undefined, 'segmented segmented--wide');
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter activity');
  const filterButtons = GROUPS.map(([key, label]) => {
    const item = button(label, 'filter', () => { group = key; render(); });
    item.dataset.group = key;
    return item;
  });
  filters.append(...filterButtons);
  const refresh = button('Refresh', 'button', () => load());
  const body = el('div', undefined, 'view-body');
  root.replaceChildren(viewHead('Audit log', 'Activity', 'Every private save, image change, publication step and newsletter send, newest first.', [refresh]), filters, body);

  function render() {
    for (const item of filterButtons) {
      const active = item.dataset.group === group;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    }
    const shown = events.filter((event) => group === 'all' || event.action.startsWith(`${group}.`));
    if (!shown.length) { body.replaceChildren(el('p', 'Nothing recorded yet.', 'empty-line')); return; }
    body.replaceChildren(table('Studio activity', ['When', 'What', 'Article', 'Detail'], shown.map((event) => {
      let subject = event.path;
      if (event.path.startsWith('src/content/articles/')) {
        subject = button(titleForPath(event.path) || event.path, 'text-button text-button--plain', () => openArticle(event.path));
      } else if (event.path === 'newsletter') subject = '';
      return [when(event.created_at), LABELS[event.action] || event.action, subject, describe(event)];
    })));
  }

  async function load() {
    refresh.disabled = true;
    try {
      events = (await api('/api/activity')).events;
      render();
    } catch (error) {
      body.replaceChildren(errorLine(error.message));
    } finally {
      refresh.disabled = false;
    }
  }
  return { show: load };
}
