import { parse as parseYaml } from 'yaml';

// Subscriber announcements through Resend. Article wording comes from the live
// branch's front matter and is escaped, never rewritten. Nothing is sent to the
// list without a typed confirmation that names the subscriber count.
export const NEWSLETTER_FROM = 'HadithCritic <updates@hadithcriticblog.com>';
export const SITE_URL = 'https://hadithcriticblog.com';
const ARTICLES_PATH = 'src/content/articles/';
const UNSUBSCRIBE = '{{{RESEND_UNSUBSCRIBE_URL}}}';
const MAX_ARTICLES = 5;
const MAX_INTRO = 2000;
const MAX_SUBJECT = 200;
const MAX_PREHEADER = 150;
const MAX_SCHEDULE_DAYS = 30;
const CONTACT_PAGES = 20;

export function newsletterConfigured(env) {
  return !!env.STUDIO_RESEND_API_KEY && !!env.STUDIO_RESEND_SEGMENT_ID;
}

export function resendClient(env, fetchImpl = fetch) {
  return async (path, { method = 'GET', body } = {}) => {
    const response = await fetchImpl(`https://api.resend.com${path}`, {
      method,
      headers: { authorization: `Bearer ${env.STUDIO_RESEND_API_KEY}`, 'content-type': 'application/json', 'user-agent': 'HadithCritic-Studio' },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(`Resend ${method} ${path.split('?')[0]} failed (${response.status})${data.message ? `: ${data.message}` : ''}.`);
      error.status = response.status === 429 ? 429 : 502;
      throw error;
    }
    return data;
  };
}

const badRequest = message => Object.assign(new Error(message), { status: 400 });

// Resend reads {{ }} as template syntax, so braces in article text are encoded too.
export const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
const plain = value => String(value ?? '').replace(/\{\{/g, '{ {').replace(/\}\}/g, '} }');

export function articleUrl(path) {
  // The site answers the slashless form with a 301.
  return `${SITE_URL}/blogs/${path.slice(ARTICLES_PATH.length).replace(/\.mdx?$/i, '')}/`;
}

function absoluteImage(src) {
  if (typeof src !== 'string') return '';
  if (src.startsWith('https://')) return src;
  return src.startsWith('/') && !src.startsWith('//') ? SITE_URL + src : '';
}

export function articleFromSource(path, source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = (match && parseYaml(match[1], { maxAliasCount: 0 })) || {};
  if (typeof meta.title !== 'string' || !meta.title) throw badRequest(`${path} has no title on the live branch.`);
  return {
    path,
    title: meta.title,
    description: typeof meta.description === 'string' ? meta.description : '',
    image: absoluteImage(meta.thumbnail),
    imageAlt: typeof meta.heroAlt === 'string' && meta.heroAlt ? meta.heroAlt : meta.title,
    url: articleUrl(path),
    draft: meta.draft === true
  };
}

export function normalizeIssue(payload) {
  const paths = Array.isArray(payload?.paths) ? [...new Set(payload.paths)] : [];
  if (!paths.length || paths.length > MAX_ARTICLES) throw badRequest(`Choose between 1 and ${MAX_ARTICLES} published articles.`);
  for (const path of paths) {
    if (typeof path !== 'string' || !path.startsWith(ARTICLES_PATH) || !/\.mdx?$/i.test(path) || path.includes('..')) throw badRequest('Invalid article path.');
  }
  const intro = typeof payload.intro === 'string' ? payload.intro.replace(/\r\n/g, '\n').trim() : '';
  if (intro.length > MAX_INTRO) throw badRequest(`The introduction is limited to ${MAX_INTRO} characters.`);
  const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
  if (subject.length > MAX_SUBJECT || /[\r\n]/.test(subject)) throw badRequest(`The subject must be one line of at most ${MAX_SUBJECT} characters.`);
  const preheader = typeof payload.preheader === 'string' ? payload.preheader.trim() : '';
  if (preheader.length > MAX_PREHEADER || /[\r\n]/.test(preheader)) throw badRequest(`The preview text must be one line of at most ${MAX_PREHEADER} characters.`);
  return { paths, intro, subject, preheader };
}

export function defaultSubject(articles) {
  return articles.length === 1 ? `New on HadithCritic: ${articles[0].title}` : `New on HadithCritic: ${articles.length} new studies`;
}

export function renderNewsletter({ articles, intro = '', preheader = '' }) {
  const single = articles.length === 1;
  const paragraphs = intro ? intro.split(/\n{2,}/).map(part => part.trim()).filter(Boolean) : [];
  const html = [
    '<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">',
    preheader ? `<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>` : '',
    ...paragraphs.map(part => `<p style="font-size:16px;line-height:1.6;color:#1a1a1a;margin:0 0 20px;">${escapeHtml(part).replace(/\n/g, '<br />')}</p>`),
    ...articles.map((article, index) => [
      index ? '<hr style="border:0;border-top:1px solid #e2ddd3;margin:32px 0;" />' : '',
      article.image ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt)}" width="600" style="width:100%;max-width:600px;height:auto;display:block;margin-bottom:16px;" />` : '',
      `<h${single ? 1 : 2} style="font-size:${single ? 22 : 19}px;line-height:1.3;margin:0 0 12px;">${escapeHtml(article.title)}</h${single ? 1 : 2}>`,
      article.description ? `<p style="font-size:16px;line-height:1.6;color:#3a3a3a;margin:0 0 20px;">${escapeHtml(article.description)}</p>` : '',
      `<a href="${escapeHtml(article.url)}" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:4px;font-size:14px;">Read the article</a>`
    ].join('\n')),
    `<p style="font-size:12px;color:#8a8a8a;margin-top:32px;">You're receiving this because you subscribed at HadithCritic. <a href="${UNSUBSCRIBE}" style="color:#8a8a8a;">Unsubscribe</a></p>`,
    '</div>'
  ].filter(Boolean).join('\n');
  const text = [
    ...paragraphs.map(plain),
    ...articles.map(article => [plain(article.title), plain(article.description), `Read the article: ${article.url}`].filter(Boolean).join('\n')),
    `You're receiving this because you subscribed at HadithCritic.\nUnsubscribe: ${UNSUBSCRIBE}`
  ].join('\n\n');
  return { html, text };
}

/** Reads each article from the live branch and checks that its public URL answers. */
export async function composeIssue(payload, { readPublished, isLive }) {
  const issue = normalizeIssue(payload);
  const articles = [];
  for (const path of issue.paths) {
    const article = articleFromSource(path, await readPublished(path));
    if (article.draft) throw badRequest(`${article.title} is marked draft on the live branch.`);
    articles.push({ ...article, live: await isLive(article.url) });
  }
  const subject = issue.subject || defaultSubject(articles);
  return { ...issue, subject, articles, ...renderNewsletter({ articles, intro: issue.intro, preheader: issue.preheader }) };
}

export async function subscriberSummary(resend, segmentId, now = Date.now()) {
  const contacts = [];
  let after = '', complete = true;
  for (let page = 0; page < CONTACT_PAGES; page++) {
    const result = await resend(`/contacts?segment_id=${encodeURIComponent(segmentId)}&limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`);
    contacts.push(...(result.data || []));
    if (!result.has_more || !result.data?.length) break;
    after = result.data.at(-1).id;
    if (page === CONTACT_PAGES - 1) complete = false;
  }
  const subscribed = contacts.filter(contact => !contact.unsubscribed).length;
  const weeks = Array.from({ length: 12 }, (_, index) => ({ start: new Date(now - (11 - index) * 7 * 864e5).toISOString().slice(0, 10), added: 0 }));
  for (const contact of contacts) {
    const age = Math.floor((now - Date.parse(contact.created_at)) / (7 * 864e5));
    if (age >= 0 && age < 12) weeks[11 - age].added++;
  }
  return { total: contacts.length, subscribed, unsubscribed: contacts.length - subscribed, complete, weeks };
}

export async function newsletterOverview(env, resend) {
  const [segments, broadcasts, subscribers] = await Promise.all([
    resend('/segments'),
    resend('/broadcasts'),
    subscriberSummary(resend, env.STUDIO_RESEND_SEGMENT_ID)
  ]);
  const segment = (segments.data || []).find(item => item.id === env.STUDIO_RESEND_SEGMENT_ID);
  return {
    from: NEWSLETTER_FROM,
    segment: segment ? segment.name : 'Configured segment',
    subscribers,
    broadcasts: (broadcasts.data || []).map(item => ({
      id: item.id, name: item.name, status: item.status, created_at: item.created_at, scheduled_at: item.scheduled_at, sent_at: item.sent_at, subject: item.subject ?? null
    }))
  };
}

export function sendPhrase(count) { return `SEND TO ${count}`; }

export function validateSchedule(value, now = Date.now()) {
  if (value === undefined || value === null || value === '') return null;
  const time = typeof value === 'string' ? Date.parse(value) : NaN;
  if (!Number.isFinite(time) || time < now + 60_000 || time > now + MAX_SCHEDULE_DAYS * 864e5) {
    throw badRequest(`Schedule a time between one minute and ${MAX_SCHEDULE_DAYS} days from now.`);
  }
  return new Date(time).toISOString();
}

export async function sendTest(composed, env, resend) {
  // The unsubscribe placeholder only resolves inside a broadcast.
  const swap = value => value.split(UNSUBSCRIBE).join(SITE_URL);
  const result = await resend('/emails', { method: 'POST', body: {
    from: NEWSLETTER_FROM, to: [env.STUDIO_OWNER_EMAIL], subject: `[Test] ${composed.subject}`, html: swap(composed.html), text: swap(composed.text)
  } });
  return { id: result.id, to: 'owner' };
}

export async function sendBroadcast(composed, { confirm, scheduledAt }, env, resend, now = Date.now()) {
  const when = validateSchedule(scheduledAt, now);
  const offline = composed.articles.filter(article => !article.live);
  if (offline.length) throw Object.assign(new Error(`Not live yet: ${offline.map(article => article.title).join('; ')}. Merge and deploy before announcing.`), { status: 409 });
  const { subscribed } = await subscriberSummary(resend, env.STUDIO_RESEND_SEGMENT_ID, now);
  if (!subscribed) throw Object.assign(new Error('The segment has no subscribed contacts.'), { status: 409 });
  if (confirm !== sendPhrase(subscribed)) throw Object.assign(new Error(`Type ${sendPhrase(subscribed)} to confirm.`), { status: 409, expected: sendPhrase(subscribed) });
  const created = await resend('/broadcasts', { method: 'POST', body: {
    segment_id: env.STUDIO_RESEND_SEGMENT_ID, from: NEWSLETTER_FROM, subject: composed.subject,
    html: composed.html, text: composed.text, name: `Studio: ${composed.subject}`.slice(0, 200),
    send: true, ...(when ? { scheduled_at: when } : {})
  } });
  return { id: created.id, recipients: subscribed, scheduledAt: when };
}
