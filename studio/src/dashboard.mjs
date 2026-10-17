import {
  newsletterConfigured, resendClient, newsletterOverview, composeIssue, sendTest, sendBroadcast, articleUrl, SITE_URL
} from './newsletter.mjs';
import { analyticsConfigured, getAnalytics, parseRange } from './analytics.mjs';
import { siteHealth } from './health.mjs';

// The routes behind the Newsletter, Analytics, Health and Activity tabs. Each
// returns null when the path is not one of its own, so the main router carries on.
const LIVE_TIMEOUT_MS = 8000;
const BROADCAST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_STATUSES = new Set([400, 401, 404, 409, 413, 429, 502, 503]);

const fail = (message, status) => Object.assign(new Error(message), { status });

export function liveBranch(env) { return env.STUDIO_LIVE_BRANCH || 'main'; }

/** The live branch's copy of an article. The repository is public, so no token is needed. */
export function publishedReader(env, fetchImpl = fetch) {
  return async path => {
    const encoded = path.split('/').map(encodeURIComponent).join('/');
    const response = await fetchImpl(`https://raw.githubusercontent.com/${encodeURIComponent(env.STUDIO_REPO_OWNER)}/${encodeURIComponent(env.STUDIO_REPO_NAME)}/${encodeURIComponent(liveBranch(env))}/${encoded}`, { signal: AbortSignal.timeout(LIVE_TIMEOUT_MS) });
    if (response.status === 404) throw fail(`${path} is not on ${liveBranch(env)} yet. Merge it before announcing.`, 409);
    if (!response.ok) throw fail(`GitHub answered ${response.status} for ${path}.`, 502);
    return response.text();
  };
}

export function liveChecker(fetchImpl = fetch) {
  return async url => {
    try {
      const response = await fetchImpl(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(LIVE_TIMEOUT_MS) });
      return response.status === 200;
    } catch { return false; }
  };
}

/** Every article the public site lists, matched to its source path where the private index knows it. */
export async function liveCatalog(fetchImpl, paths) {
  const response = await fetchImpl(`${SITE_URL}/article-catalog.json`, { signal: AbortSignal.timeout(LIVE_TIMEOUT_MS) });
  if (!response.ok) throw fail(`The site's article catalog answered ${response.status}.`, 502);
  const catalog = await response.json();
  const byUrl = new Map(paths.map(path => [articleUrl(path), path]));
  return catalog
    .map(item => ({ url: SITE_URL + item.url, title: item.title, date: item.date, category: item.category, path: byUrl.get(SITE_URL + item.url) || null }))
    .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

async function announcements(db) {
  const rows = (await db.prepare("SELECT created_at, detail FROM studio_audit WHERE action='newsletter.send' ORDER BY id DESC LIMIT 200").all()).results || [];
  const byPath = {};
  for (const row of rows) {
    let detail;
    try { detail = JSON.parse(row.detail); } catch { continue; }
    for (const path of detail.paths || []) byPath[path] ??= row.created_at;
  }
  return byPath;
}

async function audit(db, action, path, actor, detail) {
  await db.prepare('INSERT INTO studio_audit(action,path,actor,created_at,detail) VALUES (?,?,?,?,?)')
    .bind(action, path, actor, new Date().toISOString(), JSON.stringify(detail)).run();
}

async function newsletterRoutes(request, url, env, identity, deps) {
  if (!newsletterConfigured(env)) return deps.json({ configured: false, error: 'The newsletter needs the Resend key and segment secrets.' }, 503);
  const resend = resendClient(env, deps.fetchImpl);
  const compose = payload => composeIssue(payload, { readPublished: publishedReader(env, deps.fetchImpl), isLive: liveChecker(deps.fetchImpl) });
  if (url.pathname === '/api/newsletter' && request.method === 'GET') {
    const [overview, catalog, announced] = await Promise.all([
      newsletterOverview(env, resend),
      liveCatalog(deps.fetchImpl, await deps.articlePaths()),
      announcements(env.STUDIO_DB)
    ]);
    return deps.json({ configured: true, ...overview, catalog: catalog.map(item => ({ ...item, announcedAt: item.path ? announced[item.path] || null : null })) });
  }
  if (url.pathname === '/api/newsletter/compose' && request.method === 'POST') {
    const composed = await compose(await deps.readJson(request));
    return deps.json(composed);
  }
  if (url.pathname === '/api/newsletter/test' && request.method === 'POST') {
    const result = await sendTest(await compose(await deps.readJson(request)), env, resend);
    return deps.json(result);
  }
  if (url.pathname === '/api/newsletter/send' && request.method === 'POST') {
    if (!deps.recentlyAuthenticated()) throw fail('Sign in again before sending; a send requires authentication within 15 minutes.', 401);
    const payload = await deps.readJson(request);
    const composed = await compose(payload);
    const result = await sendBroadcast(composed, { confirm: payload.confirm, scheduledAt: payload.scheduledAt }, env, resend);
    await audit(env.STUDIO_DB, 'newsletter.send', composed.paths[0], identity.subject, { id: result.id, paths: composed.paths, subject: composed.subject, recipients: result.recipients, scheduledAt: result.scheduledAt });
    return deps.json(result);
  }
  if (url.pathname === '/api/newsletter/broadcast' && request.method === 'DELETE') {
    const id = url.searchParams.get('id') || '';
    if (!BROADCAST_ID.test(id)) throw fail('Invalid broadcast id.', 400);
    const broadcast = await resend(`/broadcasts/${id}`);
    if (broadcast.status !== 'scheduled') throw fail('Only a scheduled broadcast can be cancelled.', 409);
    await resend(`/broadcasts/${id}`, { method: 'DELETE' });
    await audit(env.STUDIO_DB, 'newsletter.cancel', 'newsletter', identity.subject, { id, subject: broadcast.subject ?? null });
    return deps.json({ cancelled: true });
  }
  return null;
}

export async function handleDashboard(request, url, env, identity, deps) {
  const route = url.pathname;
  if (!['/api/newsletter', '/api/analytics', '/api/health', '/api/activity'].some(prefix => route === prefix || route.startsWith(`${prefix}/`))) return null;
  try {
    if (route === '/api/newsletter' || route.startsWith('/api/newsletter/')) return await newsletterRoutes(request, url, env, identity, deps);
    if (request.method !== 'GET') return null;
    if (route === '/api/analytics') {
      if (!analyticsConfigured(env)) return deps.json({ configured: false, error: 'Analytics needs the read-only Cloudflare token and zone id.' }, 503);
      return deps.json({ configured: true, ...await getAnalytics(env, parseRange(url.searchParams.get('days')), deps.fetchImpl) });
    }
    if (route === '/api/health') {
      return deps.json(await siteHealth({
        client: deps.githubClient ? await deps.githubClient().catch(() => null) : null,
        resend: newsletterConfigured(env) ? resendClient(env, deps.fetchImpl) : null,
        liveBranch: liveBranch(env), draftBranch: env.STUDIO_PUBLISH_BRANCH || env.STUDIO_SOURCE_REF,
        fetchImpl: deps.fetchImpl
      }));
    }
    if (route === '/api/activity') {
      const rows = (await env.STUDIO_DB.prepare('SELECT id,action,path,created_at,detail FROM studio_audit ORDER BY id DESC LIMIT 150').all()).results || [];
      return deps.json({ events: rows });
    }
    return null;
  } catch (error) {
    // Messages from these modules name the failing service and status, never a credential.
    if (SAFE_STATUSES.has(error.status)) return deps.json({ error: error.message, ...(error.expected ? { expected: error.expected } : {}) }, error.status);
    console.warn(`Studio dashboard request failed: ${error.message}`);
    return deps.json({ error: 'The request failed. Retry, or check the Health tab.' }, 502);
  }
}
