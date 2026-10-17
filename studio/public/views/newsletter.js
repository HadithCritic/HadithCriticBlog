import { $, el, number, when, day, stat, statusBadge, barChart, viewHead, card, button, errorLine } from './common.js';

const MAX_ARTICLES = 5;
const STATUS_LABELS = { sent: 'Sent', scheduled: 'Scheduled', draft: 'Draft', queued: 'Sending', sending: 'Sending', canceled: 'Cancelled', cancelled: 'Cancelled', failed: 'Failed' };

export function newsletterView(root, { api, showNotice }) {
  let overview = null;
  let selected = [];
  let composed = null;
  let composedKey = '';
  let query = '';

  const refresh = button('Refresh', 'button', () => load());
  const status = el('p', '', 'view-status');
  status.setAttribute('role', 'status');
  const body = el('div', undefined, 'view-body');
  root.replaceChildren(viewHead('Resend', 'Newsletter', 'Announce published studies to subscribers. Each study is read from main and checked on the public site before anything is sent.', [refresh]), status, body);

  const ids = { subject: 'nl-subject', preheader: 'nl-preheader', intro: 'nl-intro', confirm: 'nl-confirm', when: 'nl-when' };
  const inputs = () => ({
    paths: selected,
    subject: $(ids.subject)?.value.trim() || '',
    preheader: $(ids.preheader)?.value.trim() || '',
    intro: $(ids.intro)?.value || ''
  });
  const keyOf = (value) => JSON.stringify(value);
  const recipients = () => overview?.subscribers.subscribed || 0;
  const phrase = () => `SEND TO ${recipients()}`;

  function field(label, control, hint) {
    const wrap = el('label', undefined, 'field');
    const title = el('span', label);
    if (hint) title.append(' ', el('small', hint));
    wrap.append(title, control);
    return wrap;
  }

  function articlePicker() {
    const search = el('input');
    search.type = 'search';
    search.placeholder = 'Search live studies';
    search.setAttribute('aria-label', 'Search live studies');
    search.value = query;
    const list = el('ul', undefined, 'pick-list');
    const count = el('p', '', 'pick-count');
    count.setAttribute('aria-live', 'polite');
    const draw = () => {
      const terms = query.toLowerCase();
      const items = overview.catalog.filter((item) => !terms || item.title.toLowerCase().includes(terms) || (item.category || '').toLowerCase().includes(terms));
      list.replaceChildren(...items.slice(0, 60).map((item) => {
        const row = el('li', undefined, 'pick');
        const label = el('label', undefined, 'pick__label');
        const box = el('input');
        box.type = 'checkbox';
        box.checked = selected.includes(item.path);
        box.disabled = !item.path || (!box.checked && selected.length >= MAX_ARTICLES);
        box.addEventListener('change', () => {
          selected = box.checked ? [...selected, item.path] : selected.filter((path) => path !== item.path);
          invalidate();
          draw();
        });
        const text = el('span', undefined, 'pick__text');
        text.append(el('span', item.title, 'pick__title'));
        const meta = el('span', [item.date, item.category].filter(Boolean).join(' · '), 'pick__meta');
        if (item.announcedAt) meta.append(' ', el('span', `Announced ${day(item.announcedAt.slice(0, 10))}`, 'badge badge--gold'));
        if (!item.path) meta.append(' ', el('span', 'Not in the Studio index', 'badge'));
        text.append(meta);
        label.append(box, text);
        row.append(label);
        return row;
      }));
      if (!items.length) list.append(el('li', 'No live study matches.', 'empty-line'));
      count.textContent = `${selected.length} of ${MAX_ARTICLES} chosen`;
    };
    search.addEventListener('input', () => { query = search.value; draw(); });
    draw();
    const wrap = el('div', undefined, 'picker');
    const searchWrap = el('label', undefined, 'search');
    searchWrap.append(search);
    wrap.append(searchWrap, count, list);
    return wrap;
  }

  function step(n, title, ...children) {
    const item = el('li');
    const marker = el('span', String(n), 'steps__n');
    const content = el('div', undefined, 'steps__body');
    content.append(el('p', title, 'steps__title'), ...children);
    item.append(marker, content);
    return item;
  }

  function composer() {
    const subject = el('input');
    subject.id = ids.subject;
    subject.maxLength = 200;
    const preheader = el('input');
    preheader.id = ids.preheader;
    preheader.maxLength = 150;
    preheader.placeholder = 'Shown beside the subject in most inboxes';
    const intro = el('textarea');
    intro.id = ids.intro;
    intro.rows = 4;
    intro.maxLength = 2000;
    for (const control of [subject, preheader, intro]) control.addEventListener('input', invalidate);

    const previewButton = button('Build preview', 'button button--primary', buildPreview);
    previewButton.id = 'nl-preview-button';
    const preview = el('div', undefined, 'mail-preview');
    preview.id = 'nl-preview';
    preview.append(el('p', 'Choose at least one study, then build the preview. What you see is what subscribers receive.', 'empty-line'));

    const testButton = button('Send a test to me', 'button', sendTest);
    testButton.id = 'nl-test';
    const nowRadio = radio('now', 'Send now', true);
    const laterRadio = radio('later', 'Schedule', false);
    const whenInput = el('input');
    whenInput.type = 'datetime-local';
    whenInput.id = ids.when;
    whenInput.disabled = true;
    whenInput.setAttribute('aria-label', 'Send time, in your time zone');
    for (const node of [nowRadio, laterRadio]) node.querySelector('input').addEventListener('change', () => { whenInput.disabled = !laterRadio.querySelector('input').checked; syncSend(); });
    whenInput.addEventListener('input', syncSend);
    const schedule = el('div', undefined, 'schedule');
    schedule.append(nowRadio, laterRadio, whenInput);
    const confirm = el('input');
    confirm.id = ids.confirm;
    confirm.autocomplete = 'off';
    confirm.spellcheck = false;
    confirm.addEventListener('input', syncSend);
    const sendButton = button('Send', 'button button--primary', send);
    sendButton.id = 'nl-send';
    const sendNote = el('p', '', 'dialog-note');
    sendNote.id = 'nl-send-note';
    sendNote.setAttribute('role', 'status');

    const steps = el('ol', undefined, 'steps');
    steps.append(
      step(1, 'Choose up to five live studies', articlePicker()),
      step(2, 'Write the message',
        field('Subject', subject, 'leave blank for the usual form'),
        field('Preview text', preheader, 'optional'),
        field('Introduction', intro, 'optional; a blank line starts a new paragraph')),
      step(3, 'Review exactly what will be sent', previewButton, preview),
      step(4, 'Send', el('p', `From ${overview.from} to the ${overview.segment} list.`, 'dialog-note'), testButton, schedule,
        field(`Type ${phrase()} to confirm`, confirm), sendButton, sendNote)
    );
    syncSubjectPlaceholder();
    return card('Compose an announcement', `${number(recipients())} subscribed`, steps);
  }

  function radio(value, label, checked) {
    const wrap = el('label', undefined, 'radio');
    const input = el('input');
    input.type = 'radio';
    input.name = 'nl-timing';
    input.value = value;
    input.checked = checked;
    wrap.append(input, el('span', label));
    return wrap;
  }

  function syncSubjectPlaceholder() {
    const subject = $(ids.subject);
    if (!subject) return;
    const titles = selected.map((path) => overview.catalog.find((item) => item.path === path)?.title).filter(Boolean);
    subject.placeholder = titles.length === 1 ? `New on HadithCritic: ${titles[0]}` : titles.length ? `New on HadithCritic: ${titles.length} new studies` : 'New on HadithCritic: …';
  }

  function invalidate() {
    syncSubjectPlaceholder();
    if (composed && keyOf(inputs()) !== composedKey) {
      composed = null;
      const preview = $('nl-preview');
      if (preview) preview.prepend(el('p', 'The message changed. Build the preview again before sending.', 'view-error'));
    }
    syncSend();
  }

  function scheduledAt() {
    const later = root.querySelector('input[name="nl-timing"][value="later"]')?.checked;
    if (!later) return null;
    const value = $(ids.when).value;
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
  }

  function syncSend() {
    const sendButton = $('nl-send');
    if (!sendButton) return;
    const ready = !!composed && composed.articles.every((article) => article.live);
    const timing = scheduledAt();
    const typed = $(ids.confirm).value.trim() === phrase();
    sendButton.disabled = !(ready && typed && timing !== undefined && recipients() > 0);
    sendButton.textContent = timing ? `Schedule for ${number(recipients())} subscribers` : `Send to ${number(recipients())} subscribers`;
    $('nl-test').disabled = !composed;
    const note = $('nl-send-note');
    note.textContent = !composed ? 'Build the preview first.'
      : !ready ? 'Every study must be live on the public site before it can be announced.'
      : timing === undefined ? 'Choose a send time.'
      : !typed ? `Type ${phrase()} exactly.` : '';
  }

  async function buildPreview() {
    const request = inputs();
    if (!request.paths.length) { showNotice('Choose at least one study.', true); return; }
    const previewButton = $('nl-preview-button');
    previewButton.disabled = true;
    const preview = $('nl-preview');
    preview.replaceChildren(el('p', 'Reading each study from main and checking it on the site…', 'empty-line'));
    try {
      composed = await api('/api/newsletter/compose', { method: 'POST', body: JSON.stringify(request) });
      composedKey = keyOf(request);
      const checks = el('ul', undefined, 'live-list');
      for (const article of composed.articles) {
        const item = el('li');
        const link = el('a', article.title);
        link.href = article.url;
        link.target = '_blank';
        link.rel = 'noreferrer';
        item.append(statusBadge(article.live, ['Not live yet', 'Live', '']), link);
        checks.append(item);
      }
      const frame = el('iframe', undefined, 'mail-frame');
      frame.title = 'Email preview';
      // No scripts, no same-origin access: the message renders as a static page.
      frame.setAttribute('sandbox', '');
      frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"></head><body style="margin:0;padding:24px 16px;background:#ffffff;">${composed.html}</body></html>`;
      const text = el('details', undefined, 'disclosure');
      text.append(el('summary', 'Plain-text version'), el('pre', composed.text, 'code-pane'));
      preview.replaceChildren(el('p', `Subject: ${composed.subject}`, 'mail-subject'), checks, frame, text);
    } catch (error) {
      composed = null;
      preview.replaceChildren(errorLine(error.message));
    } finally {
      previewButton.disabled = false;
      syncSend();
    }
  }

  async function sendTest() {
    const testButton = $('nl-test');
    testButton.disabled = true;
    try {
      await api('/api/newsletter/test', { method: 'POST', body: JSON.stringify(inputs()) });
      showNotice('Test sent to your Access email address.');
    } catch (error) {
      showNotice(`Test not sent: ${error.message}`, true);
    } finally {
      testButton.disabled = !composed;
    }
  }

  async function send() {
    const sendButton = $('nl-send');
    sendButton.disabled = true;
    const note = $('nl-send-note');
    note.textContent = 'Sending to Resend…';
    try {
      const result = await api('/api/newsletter/send', { method: 'POST', body: JSON.stringify({ ...inputs(), confirm: $(ids.confirm).value.trim(), scheduledAt: scheduledAt() || undefined }) });
      showNotice(result.scheduledAt ? `Scheduled for ${when(result.scheduledAt)} to ${number(result.recipients)} subscribers.` : `Sent to ${number(result.recipients)} subscribers.`);
      selected = [];
      composed = null;
      await load();
    } catch (error) {
      note.replaceChildren(errorLine(error.message));
      if (error.status === 401) {
        const link = el('a', 'Sign out of Access, then reopen Studio to sign in again');
        link.href = '/cdn-cgi/access/logout';
        note.append(link);
      }
      sendButton.disabled = false;
    }
  }

  function broadcasts() {
    const rows = overview.broadcasts;
    if (!rows.length) return card('Broadcasts', 'None yet', el('p', 'Nothing has been sent from this account.', 'empty-line'));
    const list = el('ol', undefined, 'broadcast-list');
    for (const item of rows.slice(0, 12)) {
      const row = el('li', undefined, 'broadcast');
      const text = el('div', undefined, 'broadcast__text');
      text.append(el('span', item.subject || item.name || 'Untitled', 'broadcast__title'), el('span', when(item.sent_at || item.scheduled_at || item.created_at), 'broadcast__date'));
      row.append(text, el('span', STATUS_LABELS[item.status] || item.status, `badge${item.status === 'scheduled' ? ' badge--gold' : ''}`));
      if (item.status === 'scheduled') {
        row.append(button('Cancel', 'button button--small', async (event) => {
          if (!window.confirm('Cancel this scheduled newsletter? It will not be sent.')) return;
          event.currentTarget.disabled = true;
          try {
            await api(`/api/newsletter/broadcast?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
            showNotice('Scheduled newsletter cancelled.');
            await load();
          } catch (error) { showNotice(`Not cancelled: ${error.message}`, true); }
        }));
      }
      list.append(row);
    }
    return card('Broadcasts', `${rows.length} in Resend`, list);
  }

  function growth() {
    const weeks = overview.subscribers.weeks;
    const points = weeks.map((week) => ({ label: day(week.start), value: week.added }));
    const total = weeks.reduce((sum, week) => sum + week.added, 0);
    return card('New subscribers', 'Last 12 weeks',
      barChart(points, { label: `${total} new subscribers in the last 12 weeks`, height: 120 }),
      el('p', `${number(total)} joined in the last 12 weeks.`, 'card__text'));
  }

  function render() {
    const s = overview.subscribers;
    const sent = overview.broadcasts.filter((item) => item.status === 'sent');
    const stats = el('div', undefined, 'stats');
    stats.append(
      stat('Subscribed', number(s.subscribed), s.complete ? undefined : 'First 2,000 contacts counted'),
      stat('Unsubscribed', number(s.unsubscribed)),
      stat('Announcements sent', number(sent.length)),
      stat('Last sent', sent[0] ? day(String(sent[0].sent_at || sent[0].created_at).slice(0, 10)) : 'Never')
    );
    const side = el('div', undefined, 'view-stack');
    side.append(broadcasts(), growth());
    const grid = el('div', undefined, 'view-grid view-grid--compose');
    grid.append(composer(), side);
    body.replaceChildren(stats, grid);
    syncSend();
  }

  async function load() {
    refresh.disabled = true;
    status.textContent = 'Reading the list from Resend…';
    try {
      overview = await api('/api/newsletter');
      selected = selected.filter((path) => overview.catalog.some((item) => item.path === path));
      render();
      status.textContent = '';
    } catch (error) {
      body.replaceChildren(errorLine(error.message));
      status.textContent = '';
    } finally {
      refresh.disabled = false;
    }
  }

  return { show: () => { if (!overview) load(); } };
}
