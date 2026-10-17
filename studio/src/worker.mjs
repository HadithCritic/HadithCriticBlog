import { isAllowedHost, isSameOriginMutation, verifyAccessJwt, hasRecentAuthentication } from './auth.mjs';
import { parse as parseYaml } from 'yaml';
import { serializeDocument, renderPreview } from './model.mjs';
import { persistDraft, mutationAllowed } from './store.mjs';
import { uploadMedia, removeMedia } from './media.mjs';
import { publishingConfigured, githubClient, preparePublication, confirmPublication } from './publication.mjs';
import { handleDashboard } from './dashboard.mjs';
import { newsletterConfigured } from './newsletter.mjs';
import { analyticsConfigured } from './analytics.mjs';

const ARTICLES_PATH = 'src/content/articles/';
const MAX_DRAFT_BYTES = 1_000_000;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)*/;
const responseHeaders = {
  'cache-control': 'private, no-store',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow, noarchive',
  'cross-origin-resource-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...responseHeaders, 'content-type': 'application/json; charset=utf-8' } });
}

export function parseArticleFrontmatter(source) {
  const match = source.match(FRONTMATTER);
  if (!match) return { metadata: {}, body: source };
  const metadata = parseYaml(match[1], { maxAliasCount: 0 }) || {};
  return { metadata, body: source.slice(match[0].length) };
}

export function validArticlePath(path) {
  return typeof path === 'string' && path.startsWith(ARTICLES_PATH) &&
    /\.mdx?$/i.test(path) && !path.includes('..') && !path.includes('\\') &&
    !path.includes('\0') && path.split('/').every((part) => part && part !== '.' && part !== '..');
}

function githubConfig(env) {
  if (!env.STUDIO_REPO_OWNER || !env.STUDIO_REPO_NAME || !env.STUDIO_SOURCE_REF) {
    throw new Error('Studio repository settings are not configured.');
  }
  return { owner: env.STUDIO_REPO_OWNER, repo: env.STUDIO_REPO_NAME, ref: env.STUDIO_SOURCE_REF };
}

// Unauthenticated GitHub reads share a 60-per-hour budget with every Worker on
// the same egress address, so one index serves every request for a minute.
const TREE_TTL_MS = 60_000;
let treeCache = null;

// The GitHub App's installation token has its own budget of 5,000 an hour, so
// it is used whenever publishing is configured. The anonymous read is the
// fallback for a Studio without the App, and it is often refused in production.
async function fetchArticleTree(env, owner, repo, ref) {
  if (publishingConfigured(env)) {
    const client = await githubClient(env);
    return client(`/git/trees/${encodeURIComponent(ref)}?recursive=1`);
  }
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
  const response = await fetch(url, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'HadithCritic-Studio' } });
  if (!response.ok) throw new Error(`GitHub article index returned ${response.status}.`);
  return response.json();
}

async function getArticleTree(env) {
  const { owner, repo, ref } = githubConfig(env);
  const key = `${owner}/${repo}@${ref}`;
  if (treeCache?.key === key && Date.now() - treeCache.at < TREE_TTL_MS) return treeCache.items;
  const tree = await fetchArticleTree(env, owner, repo, ref);
  if (tree.truncated) throw new Error('GitHub returned a truncated article index.');
  const items = tree.tree.filter((item) => item.type === 'blob' && item.path.startsWith(ARTICLES_PATH) && /\.mdx?$/i.test(item.path));
  treeCache = { key, at: Date.now(), items };
  return items;
}

// The newsletter only needs paths to match the site's catalog, so when GitHub
// is unavailable the index built at deploy time stands in rather than failing
// the whole tab. Articles added since that deploy then show as not indexed.
async function articlePaths(request, env) {
  try {
    return (await getArticleTree(env)).map((item) => item.path);
  } catch (error) {
    console.warn(`Studio article index unavailable, using the deploy manifest: ${error.message}`);
    const response = await env.ASSETS.fetch(new Request(new URL('/article-manifest.json', request.url)));
    if (!response.ok) throw error;
    return ((await response.json()).articles || []).map((article) => article.path);
  }
}

/** Test seam: forget the cached public index. */
export function clearArticleTreeCache() { treeCache = null; }

async function listArticles(request, env) {
  const tree = await getArticleTree(env);
  const manifestResponse = await env.ASSETS.fetch(new Request(new URL('/article-manifest.json', request.url)));
  if (!manifestResponse.ok) throw new Error('Studio article inventory is missing; run npm run studio:inventory before deploying.');
  const manifest = await manifestResponse.json();
  const metadataByPath = new Map((manifest.articles || []).map((article) => [article.path, article]));
  const drafts = await env.STUDIO_DB.prepare('SELECT path, source, version, updated_at, base_sha, archived_at FROM drafts ORDER BY updated_at DESC').all();
  const draftMap = new Map((drafts.results || []).map((draft) => [draft.path, draft]));
  const articles = tree.map((item) => {
    const draft = draftMap.get(item.path);
    const metadata = draft ? parseArticleFrontmatter(draft.source || '').metadata : (metadataByPath.get(item.path) || {});
    return {
      path: item.path,
      title: typeof metadata.title === 'string' ? metadata.title : item.path.split('/').at(-1),
      category: typeof metadata.category === 'string' ? metadata.category : '',
      date: typeof metadata.date === 'string' ? metadata.date : '',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      draft: false,
      sha: item.sha,
      privateVersion: draft?.version ?? null,
      archived: !!draft?.archived_at,
      privateUpdatedAt: draft?.updated_at ?? null
    };
  });
  const publicPaths = new Set(articles.map((article) => article.path));
  for (const draft of drafts.results || []) {
    if (publicPaths.has(draft.path)) continue;
    const { metadata } = parseArticleFrontmatter(draft.source || '');
    articles.push({
      path: draft.path,
      title: typeof metadata.title === 'string' ? metadata.title : draft.path.split('/').at(-1),
      category: typeof metadata.category === 'string' ? metadata.category : '',
      date: typeof metadata.date === 'string' ? metadata.date : '',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      draft: true,
      sha: '',
      privateVersion: draft.version,
      archived: !!draft.archived_at,
      privateUpdatedAt: draft.updated_at
    });
  }
  return json({ articles, ref: env.STUDIO_SOURCE_REF, count: articles.length, publishedCount: tree.length });
}

async function getArticle(path, env, usePrivate = true) {
  if (!validArticlePath(path)) return json({ error: 'Invalid article path.' }, 400);
  const result = await env.STUDIO_DB.prepare('SELECT path, source, version, base_sha, updated_at, editor_json, archived_at FROM drafts WHERE path = ?').bind(path).first();
  if (result && usePrivate) {
    // A hint only: opening a private draft never depends on GitHub answering.
    let publicChanged = null;
    if (result.base_sha) {
      try {
        const item = (await getArticleTree(env)).find((entry) => entry.path === path);
        publicChanged = item?.sha !== result.base_sha;
      } catch { publicChanged = null; }
    }
    return json({ ...result, sourceKind: 'private-draft', publicChanged });
  }
  const tree = await getArticleTree(env);
  const item = tree.find((entry) => entry.path === path);
  if (!item) return json({ error: 'Article not found.' }, 404);
  // Read the immutable blob whose SHA is shown to the editor, avoiding a ref race.
  const { owner, repo } = githubConfig(env);
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${item.sha}`, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'HadithCritic-Studio' } });
  if (!response.ok) throw new Error('Could not read article blob.');
  const blob = await response.json();
  if (blob.encoding !== 'base64') throw new Error('Unexpected source encoding.');
  const source = new TextDecoder().decode(Uint8Array.from(atob(blob.content.replace(/\s/g, '')), c => c.charCodeAt(0)));
  return json({ path, source, version: 0, base_sha: item.sha, updated_at: null, sourceKind: 'published' });
}

async function saveDraft(request, env, identity) {
  let payload;
  try { payload = await readJson(request); } catch (error) { return json({ error: error.message }, error.status || 400); }
  if (!validArticlePath(payload.path)) return json({ error: 'Invalid article path.' }, 400);
  if (typeof payload.source !== 'string' || new TextEncoder().encode(payload.source).byteLength > MAX_DRAFT_BYTES) {
    return json({ error: 'Article source is required and must be under 1 MB.' }, 413);
  }
  if (!Number.isSafeInteger(payload.expectedVersion) || payload.expectedVersion < 0) {
    return json({ error: 'A valid expectedVersion is required.' }, 400);
  }
  if (payload.document) {
    try {
      if (serializeDocument(payload.document, payload.metadata, payload.path) !== payload.source) return json({ error: 'Structured document and source disagree.' }, 422);
    } catch (error) { return json({ error: error.message }, 422); }
  }
  const existing = await env.STUDIO_DB.prepare('SELECT version, base_sha, editor_json FROM drafts WHERE path = ?').bind(payload.path).first();
  if (payload.document && payload.baseSha && !existing?.editor_json) return json({ error: 'Legacy articles are source-only until proven lossless.' }, 422);
  const { metadata } = parseArticleFrontmatter(payload.source);
  if (typeof metadata.title !== 'string' || !metadata.title.trim()) return json({ error: 'Article frontmatter must include a title.' }, 422);
  if (typeof metadata.description !== 'string' || !metadata.description.trim()) return json({ error: 'Article frontmatter must include a description.' }, 422);
  const currentVersion = existing?.version ?? 0;
  if (currentVersion !== payload.expectedVersion) return json({ error: 'Draft changed in another session.', currentVersion }, 409);
  // GitHub is consulted only when a save sets which public file the draft is
  // based on: its first save, or an explicit rebase after a conflict. Ordinary
  // saves never wait on it, and a later public change is caught by preparation,
  // which compares the publication branch with the stored base.
  const baseSha = payload.baseSha || '';
  if (!existing || existing.base_sha !== baseSha) {
    const publicArticle = (await getArticleTree(env)).find((item) => item.path === payload.path);
    if (baseSha && (!publicArticle || publicArticle.sha !== baseSha)) {
      return json({ error: 'The public source changed since this private draft was opened.', currentVersion }, 409);
    }
    if (!baseSha && publicArticle) return json({ error: 'That path already exists in the public repository.' }, 409);
  }

  const result = await persistDraft(env.STUDIO_DB, { ...payload, checkpoint: payload.autosave !== true }, identity.subject);
  if (!result) {
    const latest = await env.STUDIO_DB.prepare('SELECT version FROM drafts WHERE path = ?').bind(payload.path).first();
    return json({ error: 'Draft changed in another session.', currentVersion: latest?.version ?? 0 }, 409);
  }
  return json(result);
}

async function listRevisions(path, env) {
  if (!validArticlePath(path)) return json({ error: 'Invalid article path.' }, 400);
  const revisions = await env.STUDIO_DB.prepare('SELECT version, base_sha, created_at, created_by FROM draft_revisions WHERE path = ? ORDER BY version DESC LIMIT 100').bind(path).all();
  return json({ revisions: revisions.results || [] });
}

async function getRevision(path, version, env) {
  if (!validArticlePath(path) || !/^\d+$/.test(version)) return json({ error: 'Invalid revision.' }, 400);
  const revision = await env.STUDIO_DB.prepare('SELECT source, version, base_sha, created_at, editor_json FROM draft_revisions WHERE path = ? AND version = ?').bind(path, Number(version)).first();
  return revision ? json(revision) : json({ error: 'Revision not found.' }, 404);
}

export async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (!isAllowedHost(request, env)) return new Response('Forbidden', { status: 403, headers: responseHeaders });
  if (!isSameOriginMutation(request)) return new Response('Forbidden', { status: 403, headers: responseHeaders });
  let identity;
  try {
    identity = await verifyAccessJwt(request.headers.get('cf-access-jwt-assertion'), env);
  } catch (error) {
    // The messages are fixed strings from auth.mjs; no token or claim value is logged.
    console.warn(`Studio refused a request: ${error.message}`);
    return new Response('Unauthorized', { status: 401, headers: responseHeaders });
  }

  if (url.pathname.startsWith('/api/')) {
    try {
      if (['POST','PUT','PATCH','DELETE'].includes(request.method) && !await mutationAllowed(env.STUDIO_DB,identity.subject)) return json({ error: 'Too many mutations. Retry in one minute.' },429);
      const dashboard = await handleDashboard(request, url, env, identity, {
        json, readJson, fetchImpl: (...args) => fetch(...args),
        articlePaths: () => articlePaths(request, env),
        recentlyAuthenticated: () => hasRecentAuthentication(request.headers.get('cf-access-jwt-assertion')),
        githubClient: publishingConfigured(env) ? () => githubClient(env) : null
      });
      if (dashboard) return dashboard;
      if (url.pathname === '/api/config' && request.method === 'GET') return json({ publishing: publishingConfigured(env), branch: env.STUDIO_PUBLISH_BRANCH || null, media: !!env.STUDIO_MEDIA, newsletter: newsletterConfigured(env), analytics: analyticsConfigured(env), liveBranch: env.STUDIO_LIVE_BRANCH || 'main' });
      if (url.pathname === '/api/preview' && request.method === 'POST') {
        const payload = await readJson(request);
        try { return json({ html: renderPreview(payload.document) }); } catch (error) { return json({ error: error.message },422); }
      }
      if (url.pathname === '/api/media' && request.method === 'POST') { const result = await uploadMedia(request,env,identity); return json(result,result.status || 200); }
      if (url.pathname === '/api/media' && request.method === 'GET') {
        const rows = (await env.STUDIO_DB.prepare('SELECT id,path,mime,bytes,alt,created_at,deleted_at,parent_id,width FROM media ORDER BY created_at DESC LIMIT 500').all()).results;
        return json({ media:rows.filter(row=>!row.parent_id).map(row=>{
          const variants=rows.filter(child=>child.parent_id===row.id&&!child.deleted_at).map(child=>({src:child.path,width:child.width}));
          if(variants.length&&row.width)variants.push({src:row.path,width:row.width});
          return {...row,variants};
        }),variants:rows.filter(row=>row.parent_id) });
      }
      if (/^\/api\/media\/[a-f0-9-]{36}\/restore$/.test(url.pathname) && request.method === 'POST') {
        const id = url.pathname.split('/')[3], now = new Date().toISOString();
        const result = await env.STUDIO_DB.batch([
          env.STUDIO_DB.prepare('UPDATE media SET deleted_at=NULL WHERE id=? AND deleted_at IS NOT NULL RETURNING path').bind(id),
          env.STUDIO_DB.prepare("INSERT INTO studio_audit(action,path,actor,created_at,detail) SELECT 'media.restore',path,?,?,id FROM media WHERE id=?").bind(identity.subject,now,id)
        ]);
        return result[0].results.length ? json({ restored:true }) : json({ error:'Archived image not found.' },404);
      }
      if (/^\/api\/media\/[a-f0-9-]{36}$/.test(url.pathname)) {
        const id = url.pathname.split('/').at(-1);
        if (request.method === 'DELETE') { const result = await removeMedia(id,env,identity); return json(result,result.status || 200); }
        if (request.method === 'GET') {
          const media = await env.STUDIO_DB.prepare('SELECT * FROM media WHERE id=?').bind(id).first();
          const object = media && await env.STUDIO_MEDIA?.get(media.object_key);
          return object ? new Response(object.body,{ headers: { ...responseHeaders,'content-type':media.mime,'content-security-policy':"default-src 'none'; sandbox" } }) : json({ error:'Image not found.' },404);
        }
      }
      if (url.pathname.startsWith('/api/publication')) {
        if (url.pathname === '/api/publications' && request.method === 'GET') return json({ jobs:(await env.STUDIO_DB.prepare('SELECT id,path,version,action,status,commit_sha,created_at FROM publication_jobs WHERE path=? ORDER BY created_at DESC LIMIT 100').bind(url.searchParams.get('path')).all()).results });
        if (url.pathname === '/api/publication/job' && request.method === 'GET') {
          const job = await env.STUDIO_DB.prepare('SELECT id,path,version,action,status,source,expected_head,created_by FROM publication_jobs WHERE id=?').bind(url.searchParams.get('id')).first();
          return job && job.created_by === identity.subject ? json({id:job.id,path:job.path,version:job.version,action:job.action,status:job.status,source:job.source,expectedHead:job.expected_head}) : json({error:'Publication not found.'},404);
        }
        if (!publishingConfigured(env)) return json({ error:'Publishing is disabled pending owner configuration.' },503);
        if (request.method === 'POST' && !hasRecentAuthentication(request.headers.get('cf-access-jwt-assertion'))) return json({ error:'Sign in again before a public write; publication requires authentication within 15 minutes.' },401);
        const client = await githubClient(env);
        if (url.pathname === '/api/publication/status' && request.method === 'GET') {
          const job = await env.STUDIO_DB.prepare('SELECT id,path,status,action,commit_sha,published_blob FROM publication_jobs WHERE id=?').bind(url.searchParams.get('id')).first();
          if (!job) return json({ error:'Publication not found.' },404);
          const checks = job.commit_sha ? await client(`/commits/${job.commit_sha}/check-runs`) : { check_runs:[] };
          return json({ ...job,checks:(checks.check_runs || []).map(check => ({ name:check.name,status:check.status,conclusion:check.conclusion,url:check.html_url })),deployment:'A commit and CI results do not verify the live site. Promotion and deployed hostname must be verified by the owner.' });
        }
        if (url.pathname === '/api/publication/history' && request.method === 'GET') {
          const path = url.searchParams.get('path'); if (!validArticlePath(path)) return json({ error:'Invalid article path.' },400);
          return json({ commits:await client(`/commits?sha=${encodeURIComponent(env.STUDIO_PUBLISH_BRANCH)}&path=${encodeURIComponent(path)}&per_page=100`) });
        }
        if (request.method === 'POST') {
          const payload = await readJson(request);
          if (url.pathname === '/api/publication/cancel') {
            const now = new Date().toISOString();
            const result = await env.STUDIO_DB.batch([
              env.STUDIO_DB.prepare("UPDATE publication_jobs SET status='cancelled',updated_at=? WHERE id=? AND created_by=? AND status='prepared' RETURNING id").bind(now,payload.id,identity.subject),
              env.STUDIO_DB.prepare("INSERT INTO studio_audit(action,path,actor,created_at,detail) SELECT 'publication.cancel',path,created_by,updated_at,id FROM publication_jobs WHERE id=? AND status='cancelled' AND updated_at=?").bind(payload.id,now)
            ]);
            return result[0].results.length ? json({ cancelled:true }) : json({ error:'Only prepared jobs can be cancelled.' },409);
          }
          if (url.pathname === '/api/publication/prepare' && validArticlePath(payload.path)) { const result = await preparePublication(payload,env,identity,client); return json(result,result.status && typeof result.status === 'number' ? result.status : 200); }
          if (url.pathname === '/api/publication/confirm') { const result = await confirmPublication(payload,env,identity,client); return json(result,typeof result.status === 'number' ? result.status : 200); }
        }
      }
      if (url.pathname === '/api/articles' && request.method === 'GET') return await listArticles(request, env);
      if (url.pathname === '/api/article' && request.method === 'GET') return await getArticle(url.searchParams.get('path'), env);
      if (url.pathname === '/api/public-source' && request.method === 'GET') return await getArticle(url.searchParams.get('path'), env, false);
      if (url.pathname === '/api/draft' && request.method === 'PUT') return await saveDraft(request, env, identity);
      if (url.pathname === '/api/draft/state' && request.method === 'POST') {
        const payload = await readJson(request);
        if (!validArticlePath(payload.path) || typeof payload.archived !== 'boolean' || !Number.isSafeInteger(payload.expectedVersion) || payload.expectedVersion < 1) return json({ error:'Invalid draft state request.' },400);
        const draft = await env.STUDIO_DB.prepare('SELECT * FROM drafts WHERE path=?').bind(payload.path).first();
        if (!draft || draft.version !== payload.expectedVersion) return json({ error:'Draft changed; reload before changing state.' },409);
        const result = await persistDraft(env.STUDIO_DB,{ path:draft.path,source:draft.source,baseSha:draft.base_sha,expectedVersion:payload.expectedVersion,document:draft.editor_json ? JSON.parse(draft.editor_json) : null,archived:payload.archived },identity.subject);
        return result ? json(result) : json({ error:'Draft changed; reload before changing state.' },409);
      }
      if (url.pathname === '/api/revisions' && request.method === 'GET') return await listRevisions(url.searchParams.get('path'), env);
      if (url.pathname === '/api/revision' && request.method === 'GET') return await getRevision(url.searchParams.get('path'), url.searchParams.get('version'), env);
      return json({ error: 'Not found.' }, 404);
    } catch (error) {
      return json({ error: error.status === 413 ? error.message : 'Studio operation failed. The private draft remains available; retry or review configuration.' }, error.status === 413 ? 413 : 502);
    }
  }
  const asset = await env.ASSETS.fetch(request);
  const headers = new Headers(asset.headers);
  for (const [name, value] of Object.entries(responseHeaders)) headers.set(name, value);
  // The interface fonts are the public site's, served by Google Fonts. No page
  // content or credential is sent: the referrer policy strips the Studio URL.
  // The newsletter preview is a sandboxed srcdoc frame, which inherits this
  // policy: it needs the email's inline style attributes and the site's images.
  headers.set('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://hadithcriticblog.com; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  headers.set('referrer-policy', 'no-referrer');
  headers.set('x-frame-options', 'DENY');
  return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
}

export default { fetch: handleRequest };

export async function readJson(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('Request body must be JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Request body is required.');
  const chunks = []; let size = 0;
  while (true) {
    const { done,value } = await reader.read(); if (done) break;
    size += value.length;
    if (size > 1500000) { await reader.cancel(); const error = new Error('Request exceeds 1.5 MB.'); error.status = 413; throw error; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.length; }
  const payload = JSON.parse(new TextDecoder().decode(bytes));
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') throw new Error('Expected JSON object.');
  return payload;
}
