import { serializeDocument } from './model.mjs';

export function publishingConfigured(env) {
  return env.STUDIO_PUBLISH_ENABLED === 'true' && !!env.STUDIO_PUBLISH_BRANCH &&
    !!env.STUDIO_GITHUB_APP_ID && !!env.STUDIO_GITHUB_INSTALLATION_ID &&
    !!env.STUDIO_GITHUB_REPOSITORY_ID && !!env.STUDIO_GITHUB_PRIVATE_KEY &&
    env.STUDIO_BRANCH_PROTECTION_VERIFIED === 'true';
}
const base64 = bytes => { let out = ''; for (const b of bytes) out += String.fromCharCode(b); return btoa(out); };
const b64url = bytes => base64(bytes).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const utf8 = value => new TextEncoder().encode(value);
export async function githubClient(env, fetchImpl = fetch) {
  if (!publishingConfigured(env)) throw new Error('Publishing is disabled pending owner configuration.');
  const seconds = Math.floor(Date.now()/1000);
  const header = b64url(utf8(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = b64url(utf8(JSON.stringify({ iat: seconds-30, exp: seconds+540, iss: env.STUDIO_GITHUB_APP_ID })));
  const pem = env.STUDIO_GITHUB_PRIVATE_KEY.replace(/-----[^-]+-----|\s/g, '');
  const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' },false,['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,utf8(`${header}.${claims}`));
  const response = await fetchImpl(`https://api.github.com/app/installations/${encodeURIComponent(env.STUDIO_GITHUB_INSTALLATION_ID)}/access_tokens`, {
    method:'POST', headers:{ authorization:`Bearer ${header}.${claims}.${b64url(new Uint8Array(signature))}`, accept:'application/vnd.github+json', 'user-agent':'HadithCritic-Studio', 'content-type':'application/json' },
    body:JSON.stringify({ repository_ids:[Number(env.STUDIO_GITHUB_REPOSITORY_ID)], permissions:{ contents:'write', checks:'read' } })
  });
  if (!response.ok) throw new Error('GitHub App authorization failed.');
  const { token } = await response.json();
  if (!token) throw new Error('GitHub App token is missing.');
  const root = `https://api.github.com/repos/${encodeURIComponent(env.STUDIO_REPO_OWNER)}/${encodeURIComponent(env.STUDIO_REPO_NAME)}`;
  return async (path, method = 'GET', body) => {
    const result = await fetchImpl(root+path,{ method, headers:{ authorization:`Bearer ${token}`,accept:'application/vnd.github+json','user-agent':'HadithCritic-Studio','content-type':'application/json' }, ...(body ? { body:JSON.stringify(body) } : {}) });
    if (!result.ok) { const error = new Error(`GitHub operation failed (${result.status}).`); error.status = result.status; throw error; }
    return result.json();
  };
}
export async function branchSnapshot(client, branch, path) {
  const ref = await client(`/git/ref/heads/${encodeURIComponent(branch)}`);
  const commit = await client(`/git/commits/${ref.object.sha}`);
  const tree = await client(`/git/trees/${commit.tree.sha}?recursive=1`);
  if (tree.truncated) throw new Error('Publication tree is truncated.');
  const item = tree.tree.find(item => item.path === path);
  return { head:ref.object.sha, tree:commit.tree.sha, blob:item?.sha || '' };
}
export async function preparePublication(payload, env, identity, client) {
  if (!['publish','unpublish','rollback'].includes(payload.action) || !Number.isSafeInteger(payload.expectedVersion)) throw new Error('Invalid publication request.');
  const draft = await env.STUDIO_DB.prepare('SELECT * FROM drafts WHERE path=?').bind(payload.path).first();
  if (!draft || draft.version !== payload.expectedVersion) return { error:'Draft changed. Reload before preparing publication.', status:409 };
  if (draft.archived_at) return { error:'Restore the archived private draft before publication.',status:409 };
  const snapshot = await branchSnapshot(client,env.STUDIO_PUBLISH_BRANCH,payload.path);
  if (snapshot.blob !== draft.base_sha) return { error:'Production source differs from the draft base. Rebase explicitly before publishing.', status:409 };
  let source;
  if (payload.action === 'publish') {
    if (!draft.editor_json) return { error:'Legacy source publication requires an isolated validation service; visual conversion is forbidden.', status:422 };
    // Use the immutable saved metadata, never a second unsaved browser payload.
    const { parse } = await import('yaml');
    const match = draft.source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const meta = parse(match?.[1] || '');
    source = serializeDocument(JSON.parse(draft.editor_json),{ ...meta,draft:false },payload.path);
  } else {
    if (!snapshot.blob) return { error:'No published article exists at this path.', status:404 };
    let blob = snapshot.blob;
    if (payload.action === 'rollback') {
      if (!/^[a-f0-9]{40}$/.test(payload.revision || '')) throw new Error('Rollback requires a full Git commit SHA.');
      // Confirm selected revision belongs to this article's history on this branch.
      const history = await client(`/commits?sha=${encodeURIComponent(env.STUDIO_PUBLISH_BRANCH)}&path=${encodeURIComponent(payload.path)}&per_page=100`);
      if (!history.some(c => c.sha === payload.revision)) throw new Error('Rollback revision is not in the article history (last 100 commits).');
      const commit = await client(`/git/commits/${payload.revision}`);
      const tree = await client(`/git/trees/${commit.tree.sha}?recursive=1`);
      if (tree.truncated) throw new Error('Rollback tree is truncated.');
      blob = tree.tree.find(item => item.path === payload.path)?.sha;
      if (!blob) throw new Error('Article is absent from selected revision.');
    }
    const raw = await client(`/git/blobs/${blob}`);
    if (raw.encoding !== 'base64') throw new Error('Unexpected Git blob encoding.');
    source = new TextDecoder().decode(Uint8Array.from(atob(raw.content.replace(/\s/g,'')),c => c.charCodeAt(0)));
    if (payload.action === 'unpublish') {
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error('Article has no frontmatter.');
      const header = /^draft:.*$/m.test(match[1]) ? match[1].replace(/^draft:.*$/m,'draft: true') : `${match[1]}\ndraft: true`;
      source = source.replace(match[0],`---\n${header}\n---`);
    }
  }
  const id = crypto.randomUUID(), now = new Date().toISOString();
  const result = await env.STUDIO_DB.batch([
    env.STUDIO_DB.prepare(`INSERT INTO publication_jobs(id,path,version,action,source,expected_head,expected_blob,created_at,updated_at,created_by)
      SELECT ?,?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM drafts WHERE path=? AND version=?)`).bind(id,payload.path,draft.version,payload.action,source,snapshot.head,snapshot.blob,now,now,identity.subject,payload.path,draft.version),
    env.STUDIO_DB.prepare(`INSERT INTO studio_audit(action,path,actor,created_at,detail)
      SELECT 'publication.prepare',path,created_by,created_at,? FROM publication_jobs WHERE id=?`).bind(id,id)
  ]);
  if (!result[0].meta.changes) return { error:'Draft changed during preparation.', status:409 };
  return { id, source, expectedHead:snapshot.head, action:payload.action, status:'prepared', warning:'Confirmed publication makes these bytes public in permanent Git history.' };
}
/** Immutable commit creation + non-force ref promotion. Retries reconcile uncertain writes. */
export async function confirmPublication(payload, env, identity, client) {
  const job = await env.STUDIO_DB.prepare('SELECT * FROM publication_jobs WHERE id=?').bind(payload.id).first();
  if (!job || job.created_by !== identity.subject) return { error:'Publication not found.',status:404 };
  if (payload.confirmPath !== job.path || payload.expectedHead !== job.expected_head) return { error:'Confirm the exact article path and reviewed head.',status:422 };
  if (job.status === 'committed') return { status:'committed',commit:job.commit_sha };
  if (['committing','uncertain'].includes(job.status)) {
    const live = await branchSnapshot(client,env.STUDIO_PUBLISH_BRANCH,job.path);
    if (job.commit_sha) {
      const compared = await client(`/compare/${job.commit_sha}...${live.head}`);
      if (live.head === job.commit_sha || ['ahead','identical'].includes(compared.status)) {
        await env.STUDIO_DB.batch([
          env.STUDIO_DB.prepare("UPDATE publication_jobs SET status='committed',updated_at=? WHERE id=?").bind(new Date().toISOString(),job.id),
          env.STUDIO_DB.prepare('UPDATE drafts SET base_sha=? WHERE path=? AND base_sha=?').bind(job.published_blob,job.path,job.expected_blob),
          env.STUDIO_DB.prepare('INSERT INTO studio_audit(action,path,actor,created_at,detail) VALUES(?,?,?,?,?)').bind('publication.reconcile',job.path,identity.subject,new Date().toISOString(),`job=${job.id};commit=${job.commit_sha}`)
        ]);
        return { status:'committed',commit:job.commit_sha,reconciled:true };
      }
      if (live.head === job.expected_head) {
        const draft = await env.STUDIO_DB.prepare('SELECT version FROM drafts WHERE path=?').bind(job.path).first();
        if (draft?.version !== job.version) return { error:'Draft changed while the publication outcome was uncertain; manual reconciliation is required.',status:409 };
        // Reuse the already-created commit rather than creating another one.
        await client(`/git/refs/heads/${encodeURIComponent(env.STUDIO_PUBLISH_BRANCH)}`,'PATCH',{sha:job.commit_sha,force:false});
        return confirmPublication(payload,env,identity,client);
      }
    }
    return { error:'Publication outcome needs reconciliation. Do not create another job.',status:409 };
  }
  if (job.status !== 'prepared') return { error:'This publication job cannot be confirmed.',status:409 };
  const acquired = await env.STUDIO_DB.prepare(`UPDATE publication_jobs SET status='committing',updated_at=? WHERE id=? AND status='prepared'
    AND EXISTS(SELECT 1 FROM drafts WHERE path=? AND version=?) RETURNING id`).bind(new Date().toISOString(),job.id,job.path,job.version).first();
  if (!acquired) {
    await env.STUDIO_DB.prepare("UPDATE publication_jobs SET status='stale' WHERE id=? AND status='prepared' AND NOT EXISTS(SELECT 1 FROM drafts WHERE path=? AND version=?)").bind(job.id,job.path,job.version).run();
    return { error:'Draft changed or publication is already running.',status:409 };
  }
  let promoted = false, refAttempted = false;
  try {
    const snapshot = await branchSnapshot(client,env.STUDIO_PUBLISH_BRANCH,job.path);
    if (snapshot.head !== job.expected_head || snapshot.blob !== job.expected_blob) {
      await env.STUDIO_DB.prepare("UPDATE publication_jobs SET status='stale' WHERE id=?").bind(job.id).run();
      return { error:'Publication branch changed; prepare and review again.',status:409 };
    }
    const sourceBlob = await client('/git/blobs','POST',{ content:base64(utf8(job.source)),encoding:'base64' });
    const treeEntries = [{ path:job.path,mode:'100644',type:'blob',sha:sourceBlob.sha }];
    const mediaPaths = [...new Set(job.source.match(/\/images\/studio\/[a-f0-9-]+\.(?:png|jpg|webp)/g) || [])];
    for (const path of mediaPaths) {
      const media = await env.STUDIO_DB.prepare('SELECT * FROM media WHERE path=? AND deleted_at IS NULL').bind(path).first();
      const object = media && await env.STUDIO_MEDIA?.get(media.object_key);
      if (!object) throw new Error('A referenced private image is missing.');
      const blob = await client('/git/blobs','POST',{ content:base64(new Uint8Array(await object.arrayBuffer())),encoding:'base64' });
      treeEntries.push({ path:`public${path}`,mode:'100644',type:'blob',sha:blob.sha });
    }
    const tree = await client('/git/trees','POST',{ base_tree:snapshot.tree,tree:treeEntries });
    const commit = await client('/git/commits','POST',{ message:`Studio ${job.action}: ${job.path}\n\nStudio-Job: ${job.id}`,tree:tree.sha,parents:[snapshot.head] });
    // Persist before ref update: a lost HTTP response can be reconciled by commit identity.
    await env.STUDIO_DB.prepare('UPDATE publication_jobs SET commit_sha=?,published_blob=? WHERE id=?').bind(commit.sha,sourceBlob.sha,job.id).run();
    refAttempted = true;
    await client(`/git/refs/heads/${encodeURIComponent(env.STUDIO_PUBLISH_BRANCH)}`,'PATCH',{ sha:commit.sha,force:false });
    promoted = true;
    const now = new Date().toISOString();
    await env.STUDIO_DB.batch([
      env.STUDIO_DB.prepare("UPDATE publication_jobs SET status='committed',updated_at=? WHERE id=?").bind(now,job.id),
      env.STUDIO_DB.prepare('UPDATE drafts SET base_sha=? WHERE path=? AND base_sha=?').bind(sourceBlob.sha,job.path,job.expected_blob),
      env.STUDIO_DB.prepare('INSERT INTO studio_audit(action,path,actor,created_at,detail) VALUES(?,?,?,?,?)').bind(`publication.${job.action}`,job.path,identity.subject,now,`job=${job.id};commit=${commit.sha}`)
    ]);
    return { status:'committed',commit:commit.sha, deployment:'pending required CI and owner-controlled promotion; live deployment not verified' };
  } catch (error) {
    // Definitive pre-promotion validation errors are retryable only through a new review.
    const status = !refAttempted ? 'failed' : !promoted && [409,422].includes(error.status) ? 'stale' : 'uncertain';
    await env.STUDIO_DB.prepare('UPDATE publication_jobs SET status=?,updated_at=? WHERE id=?').bind(status,new Date().toISOString(),job.id).run();
    throw error;
  }
}
