import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './helpers.mjs';
import { persistDraft } from '../src/store.mjs';
import { publishingConfigured, preparePublication, confirmPublication } from '../src/publication.mjs';
import { githubClient } from '../src/publication.mjs';
import { generateKeyPairSync } from 'node:crypto';
import { serializeDocument } from '../src/model.mjs';
import { sample,metadata,path } from './sample.mjs';
function fakeGit() {
  let head='a'.repeat(40),blob='';const writes=[];
  const client=async(route,method='GET',body)=>{
    if(method!=='GET'){writes.push({route,method,body});
      if(route==='/git/blobs')return {sha:'b'.repeat(40)};
      if(route==='/git/trees')return {sha:'c'.repeat(40)};
      if(route==='/git/commits')return {sha:'d'.repeat(40)};
      if(route.startsWith('/git/refs/')){head=body.sha;blob='b'.repeat(40);return {};}
    }
    if(route.startsWith('/git/ref/'))return {object:{sha:head}};
    if(route.startsWith('/git/commits/'))return {tree:{sha:'tree'}};
    if(route.startsWith('/git/trees/'))return {tree:blob?[{path,sha:blob}]:[],truncated:false};
    if(route.startsWith('/compare/'))return {status:head==='d'.repeat(40)?'identical':'diverged'};
    throw new Error(`Unexpected fake Git route ${route}`);
  };
  return {client,writes,setHead(value){head=value;},setBlob(value){blob=value;}};
}
async function setup() {
  const db=database(),doc=sample();await persistDraft(db,{path,source:serializeDocument(doc,metadata,path),document:doc,expectedVersion:0},'owner');
  return {env:{STUDIO_DB:db,STUDIO_PUBLISH_BRANCH:'owner-verified-publish'},identity:{subject:'owner'},db,git:fakeGit()};
}
test('publication configuration fails closed without every explicit owner setting',()=>{
  assert.equal(publishingConfigured({}),false);
  assert.equal(publishingConfigured({STUDIO_PUBLISH_ENABLED:'true',STUDIO_SOURCE_REF:'drafts'}),false);
});
test('GitHub App refuses unauthorized installation and scopes its token to one repository',async()=>{
  const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const env={STUDIO_PUBLISH_ENABLED:'true',STUDIO_BRANCH_PROTECTION_VERIFIED:'true',STUDIO_PUBLISH_BRANCH:'reviewed',STUDIO_GITHUB_APP_ID:'1',STUDIO_GITHUB_INSTALLATION_ID:'2',STUDIO_GITHUB_REPOSITORY_ID:'3',STUDIO_GITHUB_PRIVATE_KEY:privateKey.export({type:'pkcs8',format:'pem'}),STUDIO_REPO_OWNER:'owner',STUDIO_REPO_NAME:'repo'};
  await assert.rejects(githubClient(env,async()=>({ok:false,status:403})),/authorization failed/);
  const calls=[];const client=await githubClient(env,async(url,options)=>{
    calls.push({url,options});return Response.json(calls.length===1?{token:'synthetic-server-only-token'}:{ok:true});
  });
  assert.deepEqual(JSON.parse(calls[0].options.body),{repository_ids:[3],permissions:{contents:'write',checks:'read'}});
  await client('/git/ref/heads/reviewed');assert.ok(calls[1].url.startsWith('https://api.github.com/repos/owner/repo/'));assert.equal(calls[1].options.headers.authorization,'Bearer synthetic-server-only-token');
});
test('prepare does no Git writes; confirmation commits saved bytes once, retries return same commit',async()=>{
  const {env,identity,db,git}=await setup();
  const job=await preparePublication({path,expectedVersion:1,action:'publish'},env,identity,git.client);
  assert.match(job.source,/draft: false/);assert.equal(git.writes.length,0);
  assert.equal((await confirmPublication({id:job.id,confirmPath:'wrong',expectedHead:job.expectedHead},env,identity,git.client)).status,422);
  const payload={id:job.id,confirmPath:path,expectedHead:job.expectedHead};
  const result=await confirmPublication(payload,env,identity,git.client);assert.equal(result.status,'committed');
  assert.equal(git.writes.at(-1).body.force,false);
  const retry=await confirmPublication(payload,env,identity,git.client);assert.equal(retry.commit,result.commit);
  assert.equal(git.writes.filter(w=>w.route==='/git/commits').length,1);
  assert.equal((await db.prepare('SELECT base_sha FROM drafts').first()).base_sha,'b'.repeat(40));db.sqlite.close();
});
test('stale Git head, stale draft version, and a second publisher cannot promote a snapshot',async()=>{
  let s=await setup();let job=await preparePublication({path,expectedVersion:1,action:'publish'},s.env,s.identity,s.git.client);
  s.git.setHead('e'.repeat(40));assert.equal((await confirmPublication({id:job.id,confirmPath:path,expectedHead:job.expectedHead},s.env,s.identity,s.git.client)).status,409);assert.equal(s.git.writes.length,0);s.db.sqlite.close();
  s=await setup();job=await preparePublication({path,expectedVersion:1,action:'publish'},s.env,s.identity,s.git.client);
  await persistDraft(s.db,{path,source:'newer source',expectedVersion:1},'owner');
  assert.equal((await confirmPublication({id:job.id,confirmPath:path,expectedHead:job.expectedHead},s.env,s.identity,s.git.client)).status,409);
  assert.equal((await confirmPublication({id:job.id,confirmPath:path,expectedHead:job.expectedHead},s.env,{subject:'reader'},s.git.client)).status,404);assert.equal(s.git.writes.length,0);s.db.sqlite.close();
});
test('lost ref update response reconciles the same commit without duplicate public writes',async()=>{
  const s=await setup();const job=await preparePublication({path,expectedVersion:1,action:'publish'},s.env,s.identity,s.git.client);
  let lost=false;
  const flaky=async(...args)=>{const result=await s.git.client(...args);if(args[1]==='PATCH'&&!lost){lost=true;throw new Error('Response lost');}return result;};
  const payload={id:job.id,confirmPath:path,expectedHead:job.expectedHead};
  await assert.rejects(confirmPublication(payload,s.env,s.identity,flaky),/lost/);
  assert.equal((await s.db.prepare('SELECT status FROM publication_jobs').first()).status,'uncertain');
  const result=await confirmPublication(payload,s.env,s.identity,s.git.client);assert.equal(result.reconciled,true);
  assert.equal(s.git.writes.filter(w=>w.route==='/git/commits').length,1);s.db.sqlite.close();
});
test('legacy source drafts cannot be silently serialized for publication',async()=>{
  const s=await setup();await s.db.prepare('UPDATE drafts SET editor_json=NULL').run();
  const result=await preparePublication({path,expectedVersion:1,action:'publish'},s.env,s.identity,s.git.client);
  assert.equal(result.status,422);assert.equal(s.git.writes.length,0);s.db.sqlite.close();
});
test('lost ref request can resume the persisted commit without creating another commit',async()=>{
  const s=await setup();const job=await preparePublication({path,expectedVersion:1,action:'publish'},s.env,s.identity,s.git.client);
  let failed=false;const flaky=async(...args)=>{if(args[1]==='PATCH'&&!failed){failed=true;throw new Error('Network lost before request arrived');}return s.git.client(...args);};
  const payload={id:job.id,confirmPath:path,expectedHead:job.expectedHead};
  await assert.rejects(confirmPublication(payload,s.env,s.identity,flaky));
  const result=await confirmPublication(payload,s.env,s.identity,s.git.client);assert.equal(result.status,'committed');assert.equal(s.git.writes.filter(w=>w.route==='/git/commits').length,1);s.db.sqlite.close();
});
test('unpublish and rollback preserve source bytes and never erase public Git history',async()=>{
  const s=await setup(),base='f'.repeat(40),old='e'.repeat(40),revision='1'.repeat(40);
  const source='---\r\ntitle: "Exact"\r\ndraft: false\r\n---\r\n\r\nExact quotation إِنَّ.[^x]\r\n\r\n[^x]: Citation\r\n';
  await s.db.prepare('UPDATE drafts SET base_sha=?').bind(base).run();s.git.setBlob(base);
  const client=async(route,...args)=>{
    if(route.startsWith('/commits?'))return [{sha:revision}];
    if(route===`/git/commits/${revision}`)return {tree:{sha:'oldtree'}};
    if(route==='/git/trees/oldtree?recursive=1')return {tree:[{path,sha:old}]};
    if(route===`/git/blobs/${base}`||route===`/git/blobs/${old}`)return {encoding:'base64',content:Buffer.from(source).toString('base64')};
    return s.git.client(route,...args);
  };
  const hidden=await preparePublication({path,expectedVersion:1,action:'unpublish'},s.env,s.identity,client);assert.match(hidden.source,/draft: true/);assert.equal(hidden.source.slice(hidden.source.indexOf('Exact quotation')),source.slice(source.indexOf('Exact quotation')));
  await s.db.prepare("UPDATE publication_jobs SET status='cancelled'").run();
  const restored=await preparePublication({path,expectedVersion:1,action:'rollback',revision},s.env,s.identity,client);assert.equal(restored.source,source);assert.equal(s.git.writes.length,0);
  await s.db.prepare("UPDATE publication_jobs SET status='cancelled'").run();
  await assert.rejects(preparePublication({path,expectedVersion:1,action:'rollback',revision:'2'.repeat(40)},s.env,s.identity,client),/history/);s.db.sqlite.close();
});
