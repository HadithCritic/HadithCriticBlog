import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { handleRequest } from '../src/worker.mjs';
import { verifyAccessJwt } from '../src/auth.mjs';
import { database } from './helpers.mjs';
import {
  escapeHtml, articleUrl, articleFromSource, normalizeIssue, renderNewsletter, composeIssue,
  sendBroadcast, sendTest, sendPhrase, validateSchedule, subscriberSummary
} from '../src/newsletter.mjs';
import { normalizeAnalytics, getAnalytics, parseRange, clearAnalyticsCache } from '../src/analytics.mjs';
import { checkCorpus, checkBranches } from '../src/health.mjs';
import { liveCatalog } from '../src/dashboard.mjs';

const PATH = 'src/content/articles/origins/91-test.mdx';
const TITLE = 'ʿIlm al-Rijāl (علم الرجال): {{ braces }} & <tags>';
const SOURCE = `---\ntitle: "${TITLE}"\ndescription: "Ibn Ḥajar's taqrīb, quoted exactly."\nthumbnail: /images/test.webp\nheroAlt: A manuscript page\ndraft: false\n---\n\nBody.`;
const NOW = Date.parse('2026-10-12T12:00:00Z');

function resendStub(subscribers = 5, calls = []) {
  return async (path, options = {}) => {
    calls.push({ path, ...options });
    if (path.startsWith('/contacts')) return { data: Array.from({ length: subscribers }, (_, i) => ({ id: `c${i}`, unsubscribed: false, created_at: '2026-10-01T00:00:00Z' })), has_more: false };
    if (path === '/broadcasts' && options.method === 'POST') return { id: 'b1' };
    if (path === '/emails') return { id: 'e1' };
    return { data: [] };
  };
}

const composed = (live = true) => composeIssue({ paths: [PATH], intro: 'Salam.\n\nA new study.' }, { readPublished: async () => SOURCE, isLive: async () => live });

test('article URLs keep the trailing slash the site serves', () => {
  assert.equal(articleUrl(PATH), 'https://hadithcriticblog.com/blogs/origins/91-test/');
});

test('newsletter reproduces article wording exactly and escapes it, including template braces', async () => {
  const article = articleFromSource(PATH, SOURCE);
  assert.equal(article.title, TITLE);
  assert.equal(article.image, 'https://hadithcriticblog.com/images/test.webp');
  const issue = await composed();
  assert.equal(issue.subject, `New on HadithCritic: ${TITLE}`);
  assert.ok(issue.html.includes(escapeHtml(TITLE)));
  assert.ok(!issue.html.includes('{{ braces }}'), 'raw braces would be read as Resend template syntax');
  assert.ok(issue.html.includes('ʿIlm al-Rijāl (علم الرجال)'));
  assert.ok(issue.html.includes('<a href="{{{RESEND_UNSUBSCRIBE_URL}}}"'));
  assert.ok(issue.text.includes('Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}'));
  assert.ok(issue.html.includes('<p style="font-size:16px;line-height:1.6;color:#1a1a1a;margin:0 0 20px;">Salam.</p>'));
});

test('issue input is bounded', () => {
  assert.throws(() => normalizeIssue({ paths: [] }), /between 1 and 5/);
  assert.throws(() => normalizeIssue({ paths: ['../secret.mdx'] }), /Invalid article path/);
  assert.throws(() => normalizeIssue({ paths: [PATH], subject: 'a\nb' }), /one line/);
  assert.throws(() => normalizeIssue({ paths: [PATH], intro: 'x'.repeat(2001) }), /2000/);
  assert.deepEqual(normalizeIssue({ paths: [PATH, PATH] }).paths, [PATH]);
});

test('a draft on the live branch cannot be announced', async () => {
  await assert.rejects(composeIssue({ paths: [PATH] }, { readPublished: async () => SOURCE.replace('draft: false', 'draft: true'), isLive: async () => true }), /marked draft/);
});

test('a broadcast needs live URLs, subscribers and the exact typed phrase', async () => {
  const env = { STUDIO_RESEND_SEGMENT_ID: 'seg', STUDIO_OWNER_EMAIL: 'owner@example.com' };
  await assert.rejects(sendBroadcast(await composed(false), { confirm: 'SEND TO 5' }, env, resendStub(), NOW), /Not live yet/);
  await assert.rejects(sendBroadcast(await composed(), { confirm: 'SEND TO 4' }, env, resendStub(), NOW), error => error.status === 409 && error.expected === 'SEND TO 5');
  await assert.rejects(sendBroadcast(await composed(), { confirm: 'SEND TO 0' }, env, resendStub(0), NOW), /no subscribed contacts/);
  const calls = [];
  const result = await sendBroadcast(await composed(), { confirm: sendPhrase(5), scheduledAt: '2026-10-13T09:00:00Z' }, env, resendStub(5, calls), NOW);
  assert.deepEqual(result, { id: 'b1', recipients: 5, scheduledAt: '2026-10-13T09:00:00.000Z' });
  const created = calls.find(call => call.path === '/broadcasts');
  assert.equal(created.body.segment_id, 'seg');
  assert.equal(created.body.send, true);
  assert.equal(created.body.scheduled_at, '2026-10-13T09:00:00.000Z');
});

test('a test send goes only to the owner and resolves the unsubscribe placeholder', async () => {
  const calls = [];
  await sendTest(await composed(), { STUDIO_OWNER_EMAIL: 'owner@example.com' }, resendStub(5, calls));
  assert.deepEqual(calls[0].body.to, ['owner@example.com']);
  assert.match(calls[0].body.subject, /^\[Test\] /);
  assert.ok(!calls[0].body.html.includes('RESEND_UNSUBSCRIBE_URL'));
});

test('schedules must fall between one minute and thirty days ahead', () => {
  assert.equal(validateSchedule('', NOW), null);
  assert.throws(() => validateSchedule('2026-10-12T12:00:30Z', NOW), /one minute/);
  assert.throws(() => validateSchedule('2026-11-20T12:00:00Z', NOW), /30 days/);
  assert.throws(() => validateSchedule('tomorrow', NOW));
});

test('subscriber summary pages through contacts and buckets sign-ups by week', async () => {
  let page = 0;
  const resend = async () => (page++ === 0
    ? { data: [{ id: 'a', unsubscribed: false, created_at: '2026-10-11T00:00:00Z' }, { id: 'b', unsubscribed: true, created_at: '2026-01-01T00:00:00Z' }], has_more: true }
    : { data: [{ id: 'c', unsubscribed: false, created_at: '2026-10-05T00:00:00Z' }], has_more: false });
  const summary = await subscriberSummary(resend, 'seg', NOW);
  assert.equal(summary.total, 3);
  assert.equal(summary.subscribed, 2);
  assert.equal(summary.weeks.reduce((total, week) => total + week.added, 0), 2);
  assert.equal(summary.weeks.at(-1).added, 1);
});

test('analytics normalizes Cloudflare groups and caches per range', async () => {
  clearAnalyticsCache();
  assert.throws(() => parseRange('14'), /7, 30, 90 or 365/);
  const zone = {
    daily: [{ dimensions: { date: '2026-10-11' }, sum: { requests: 100, pageViews: 40, cachedRequests: 60, bytes: 1000 }, uniq: { uniques: 10 } }],
    articles: [{ count: 9, sum: { visits: 7 }, dimensions: { clientRequestPath: '/blogs/a/b/' } }],
    corpus: [{ count: 3, sum: { edgeResponseBytes: 300 } }]
  };
  const data = normalizeAnalytics(zone, 7, 7, 'now');
  assert.equal(data.totals.cachedShare, 0.6);
  assert.deepEqual(data.articles, [{ path: '/blogs/a/b/', visits: 7, views: 9 }]);
  let calls = 0;
  const fetchImpl = async (_url, init) => { calls++; assert.match(init.headers.authorization, /^Bearer /); return Response.json({ data: { viewer: { zones: [zone] } } }); };
  const env = { STUDIO_CF_ANALYTICS_TOKEN: 't', STUDIO_CF_ZONE_ID: 'z' };
  await getAnalytics(env, 90, fetchImpl, NOW);
  const again = await getAnalytics(env, 90, fetchImpl, NOW + 1000);
  assert.equal(calls, 1);
  assert.equal(again.cached, true);
  assert.equal(again.detailDays, 30);
  clearAnalyticsCache();
  await assert.rejects(getAnalytics(env, 7, async () => Response.json({ errors: [{ message: 'denied' }] }), NOW), /denied/);
});

test('the corpus check refuses a whole-file answer and a missing SQLite header', async () => {
  const manifest = { version: 'v1', urlPrefix: 'chunks/hadith.chunk.', suffixLength: 3, chunkCount: 2 };
  const serve = (status, bytes) => async url => url.endsWith('manifest.json') ? Response.json(manifest) : new Response(bytes, { status });
  assert.equal((await checkCorpus('v1', serve(206, 'SQLite format 3\0'))).ok, true);
  assert.match((await checkCorpus('v1', serve(200, 'SQLite format 3\0'))).detail, /not 206/);
  assert.equal((await checkCorpus('v1', serve(206, 'not a database!!'))).ok, false);
});

test('the branch check reports pending commits and failing CI', async () => {
  const client = async path => path.startsWith('/compare')
    ? { ahead_by: 2, behind_by: 0, commits: [{ sha: 'a'.repeat(40), commit: { message: 'feat: one\n\nbody', author: { date: 'd' } } }] }
    : { check_runs: [{ status: 'completed', conclusion: path.includes('drafts') ? 'failure' : 'success' }] };
  const result = await checkBranches(client, 'main', 'drafts');
  assert.equal(result.ok, false);
  assert.equal(result.ahead, 2);
  assert.match(result.detail, /main passing, drafts failing/);
  assert.equal(result.commits[0].message, 'feat: one');
});

test('the live catalog maps public URLs back to source paths', async () => {
  const fetchImpl = async () => Response.json([{ url: '/blogs/origins/91-test/', title: 'T', date: '01 Oct 2026', category: 'C' }, { url: '/blogs/x/', title: 'X', date: '02 Oct 2026', category: 'C' }]);
  const catalog = await liveCatalog(fetchImpl, [PATH]);
  assert.equal(catalog[0].title, 'X');
  assert.equal(catalog[0].path, null);
  assert.equal(catalog[1].path, PATH);
});

const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...pair.publicKey.export({ format: 'jwk' }), kid: 'dash-test' };
const baseEnv = { STUDIO_ALLOWED_HOST: 'studio.example', STUDIO_TEAM_DOMAIN: 'dash-test', STUDIO_AUD: 'test', STUDIO_OWNER_EMAIL: 'owner@example.com', STUDIO_OWNER_SUBJECT: 'owner', STUDIO_REPO_OWNER: 'test', STUDIO_REPO_NAME: 'test', STUDIO_SOURCE_REF: 'drafts' };
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function token(changes = {}) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', kid: 'dash-test' })}.${b64({ iss: 'https://dash-test.cloudflareaccess.com', type: 'app', aud: ['test'], sub: 'owner', email: 'owner@example.com', iat: now, exp: now + 600, ...changes })}`;
  return `${unsigned}.${sign('RSA-SHA256', Buffer.from(unsigned), pair.privateKey).toString('base64url')}`;
}
const req = (route, method = 'GET', body, jwt = token()) => new Request(`https://studio.example${route}`, { method, headers: { host: 'studio.example', origin: 'https://studio.example', 'cf-access-jwt-assertion': jwt, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });

test('dashboard routes refuse anyone but the owner', async () => {
  await verifyAccessJwt(token(), baseEnv, async () => Response.json({ keys: [jwk] }));
  for (const route of ['/api/newsletter', '/api/analytics', '/api/health', '/api/activity']) {
    for (const jwt of ['', token({ sub: 'reader' }), token({ exp: 1 })]) assert.equal((await handleRequest(req(route, 'GET', undefined, jwt), baseEnv)).status, 401, route);
  }
});

test('dashboard routes say what is missing when unconfigured, and the activity log reads the audit table', async () => {
  await verifyAccessJwt(token(), baseEnv, async () => Response.json({ keys: [jwk] }));
  const db = database();
  const env = { ...baseEnv, STUDIO_DB: db };
  try {
    assert.equal((await handleRequest(req('/api/newsletter'), env)).status, 503);
    assert.equal((await handleRequest(req('/api/analytics'), env)).status, 503);
    await db.prepare("INSERT INTO studio_audit(action,path,actor,created_at,detail) VALUES ('draft.save',?,'owner','2026-10-12T00:00:00Z','')").bind(PATH).run();
    const activity = await (await handleRequest(req('/api/activity'), env)).json();
    assert.equal(activity.events[0].action, 'draft.save');
    assert.ok(!('actor' in activity.events[0]));
  } finally { db.sqlite.close(); }
});

test('a newsletter send needs a recent sign-in and is recorded in the audit log', async () => {
  await verifyAccessJwt(token(), baseEnv, async () => Response.json({ keys: [jwk] }));
  const db = database();
  const env = { ...baseEnv, STUDIO_DB: db, STUDIO_RESEND_API_KEY: 'k', STUDIO_RESEND_SEGMENT_ID: 'seg' };
  const fetchBefore = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    if (url.startsWith('https://raw.githubusercontent.com/')) return new Response(SOURCE);
    if (url.startsWith('https://hadithcriticblog.com/blogs/')) return new Response(null, { status: 200 });
    if (url.startsWith('https://api.resend.com/contacts')) return Response.json({ data: [{ id: 'c', unsubscribed: false, created_at: '2026-10-01T00:00:00Z' }], has_more: false });
    if (url === 'https://api.resend.com/broadcasts' && init.method === 'POST') { sent.push(JSON.parse(init.body)); return Response.json({ id: 'b1' }); }
    return Response.json({}, { status: 404 });
  };
  try {
    const stale = token({ iat: Math.floor(Date.now() / 1000) - 3600 });
    let response = await handleRequest(req('/api/newsletter/send', 'POST', { paths: [PATH], confirm: 'SEND TO 1' }, stale), env);
    assert.equal(response.status, 401);
    response = await handleRequest(req('/api/newsletter/send', 'POST', { paths: [PATH], confirm: 'SEND TO 2' }), env);
    assert.equal(response.status, 409);
    assert.equal((await response.json()).expected, 'SEND TO 1');
    assert.equal(sent.length, 0);
    response = await handleRequest(req('/api/newsletter/send', 'POST', { paths: [PATH], confirm: 'SEND TO 1' }), env);
    assert.equal(response.status, 200, await response.clone().text());
    assert.equal(sent.length, 1);
    const row = await db.prepare("SELECT path, detail FROM studio_audit WHERE action='newsletter.send'").first();
    assert.equal(row.path, PATH);
    assert.deepEqual(JSON.parse(row.detail).paths, [PATH]);
    assert.equal((await handleRequest(req('/api/newsletter/broadcast?id=not-an-id', 'DELETE'), env)).status, 400);
  } finally { globalThis.fetch = fetchBefore; db.sqlite.close(); }
});
