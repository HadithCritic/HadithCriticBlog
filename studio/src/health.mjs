// Live checks of the things that have failed before: the site answering, the
// corpus answering a range request with 206 and real SQLite bytes, drafts and
// main drifting apart, and CI on both branches. Each check stands alone, so one
// failure never hides the others.
const SITE_URL = 'https://hadithcriticblog.com';
const CORPUS_BASE = 'https://data.hadithcriticblog.com/';
const TIMEOUT_MS = 8000;
const SQLITE_MAGIC = 'SQLite format 3';

async function timed(run) {
  const started = Date.now();
  try {
    const result = await run();
    return { ...result, ms: Date.now() - started };
  } catch (error) {
    return { ok: false, detail: error.name === 'TimeoutError' ? 'Timed out.' : error.message, ms: Date.now() - started };
  }
}

const decodeBase64 = value => new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g, '')), c => c.charCodeAt(0)));

export async function checkSite(fetchImpl = fetch) {
  return timed(async () => {
    const response = await fetchImpl(`${SITE_URL}/`, { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { ok: response.status === 200, detail: `Home page answered ${response.status}.` };
  });
}

export async function checkCorpus(version, fetchImpl = fetch) {
  return timed(async () => {
    const base = `${CORPUS_BASE}${version}/`;
    const manifestResponse = await fetchImpl(`${base}manifest.json`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!manifestResponse.ok) return { ok: false, detail: `Manifest for ${version} answered ${manifestResponse.status}.` };
    const manifest = await manifestResponse.json();
    if (manifest.version !== version) return { ok: false, detail: `Manifest names ${manifest.version}, the site asks for ${version}.` };
    const chunk = `${base}${manifest.urlPrefix}${'0'.repeat(manifest.suffixLength || 3)}`;
    const range = await fetchImpl(chunk, { headers: { range: 'bytes=0-15', origin: SITE_URL }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    const bytes = new TextDecoder().decode(new Uint8Array(await range.arrayBuffer()).slice(0, 15));
    if (range.status !== 206) return { ok: false, detail: `A range request answered ${range.status}, not 206; readers would get wrong pages.` };
    if (bytes !== SQLITE_MAGIC) return { ok: false, detail: 'The first chunk does not start with a SQLite header.' };
    return { ok: true, detail: `Version ${version}: manifest, ${manifest.chunkCount} chunks, range read returns 206 and a SQLite header.` };
  });
}

export async function checkBranches(client, liveBranch, draftBranch) {
  return timed(async () => {
    const compare = await client(`/compare/${encodeURIComponent(liveBranch)}...${encodeURIComponent(draftBranch)}`);
    const runs = async ref => (await client(`/commits/${encodeURIComponent(ref)}/check-runs?per_page=50`)).check_runs || [];
    const [live, draft] = await Promise.all([runs(liveBranch), runs(draftBranch)]);
    const summary = list => {
      if (!list.length) return 'no checks';
      if (list.some(run => run.status !== 'completed')) return 'running';
      return list.every(run => ['success', 'skipped', 'neutral'].includes(run.conclusion)) ? 'passing' : 'failing';
    };
    const ci = { [liveBranch]: summary(live), [draftBranch]: summary(draft) };
    const pending = compare.ahead_by || 0;
    return {
      ok: !Object.values(ci).includes('failing'),
      detail: `${draftBranch} is ${pending} commit${pending === 1 ? '' : 's'} ahead of ${liveBranch} and ${compare.behind_by || 0} behind. CI: ${liveBranch} ${ci[liveBranch]}, ${draftBranch} ${ci[draftBranch]}.`,
      ahead: pending,
      commits: (compare.commits || []).slice(-10).reverse().map(commit => ({ sha: commit.sha.slice(0, 7), message: commit.commit.message.split('\n')[0], date: commit.commit.author?.date }))
    };
  });
}

export async function checkSendingDomain(resend) {
  return timed(async () => {
    const domains = (await resend('/domains')).data || [];
    const domain = domains.find(item => item.name === 'hadithcriticblog.com');
    return { ok: domain?.status === 'verified', detail: domain ? `hadithcriticblog.com is ${domain.status} for sending.` : 'hadithcriticblog.com is not set up in Resend.' };
  });
}

export async function corpusVersionFrom(client, ref) {
  const file = await client(`/contents/src/data/corpus-meta.json?ref=${encodeURIComponent(ref)}`);
  return JSON.parse(decodeBase64(file.content)).corpusVersion;
}

export async function siteHealth({ client, resend, liveBranch, draftBranch, fetchImpl = fetch }) {
  const unavailable = detail => ({ ok: null, detail });
  const [site, corpus, branches, sending] = await Promise.all([
    checkSite(fetchImpl),
    client ? corpusVersionFrom(client, liveBranch).then(version => checkCorpus(version, fetchImpl), error => ({ ok: false, detail: error.message })) : unavailable('Needs the GitHub App to read the live corpus version.'),
    client ? checkBranches(client, liveBranch, draftBranch) : unavailable('Needs the GitHub App.'),
    resend ? checkSendingDomain(resend) : unavailable('Newsletter is not configured.')
  ]);
  return { checkedAt: new Date().toISOString(), checks: { site, corpus, branches, sending } };
}
