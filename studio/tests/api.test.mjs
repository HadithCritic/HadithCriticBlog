import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync,sign } from 'node:crypto';
import { handleRequest, clearArticleTreeCache } from '../src/worker.mjs';
import { verifyAccessJwt } from '../src/auth.mjs';
import { database } from './helpers.mjs';
import { sample,metadata,path } from './sample.mjs';
import { serializeDocument } from '../src/model.mjs';
const pair=generateKeyPairSync('rsa',{modulusLength:2048}),jwk={...pair.publicKey.export({format:'jwk'}),kid:'api-test'};
const env={STUDIO_ALLOWED_HOST:'studio.example',STUDIO_TEAM_DOMAIN:'api-test',STUDIO_AUD:'test',STUDIO_OWNER_EMAIL:'owner@example.com',STUDIO_OWNER_SUBJECT:'owner',STUDIO_REPO_OWNER:'test',STUDIO_REPO_NAME:'test',STUDIO_SOURCE_REF:'drafts'};
const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
function token(changes={}){const now=Math.floor(Date.now()/1000),unsigned=`${b64({alg:'RS256',kid:'api-test'})}.${b64({iss:'https://api-test.cloudflareaccess.com',type:'app',aud:['test'],sub:'owner',email:'owner@example.com',iat:now,exp:now+600,...changes})}`;return `${unsigned}.${sign('RSA-SHA256',Buffer.from(unsigned),pair.privateKey).toString('base64url')}`;}
const req=(route,method='GET',body,jwt=token(),origin='https://studio.example')=>new Request(`https://studio.example${route}`,{method,headers:{host:'studio.example',origin,'cf-access-jwt-assertion':jwt,'content-type':'application/json'},...(body!==undefined?{body:typeof body==='string'?body:JSON.stringify(body)}:{})});
test('every new endpoint denies unauthorized identity, expired auth and absent Access before accessing storage',async()=>{
  await verifyAccessJwt(token(),env,async()=>Response.json({keys:[jwk]}));
  const routes=['/','/editor.js','/api/config','/api/preview','/api/media','/api/media/00000000-0000-0000-0000-000000000000','/api/publication/prepare','/api/publication/confirm','/api/publication/cancel','/api/publication/status','/api/publication/job','/api/publications','/api/public-source','/api/revision','/api/draft','/api/draft/state'];
  for(const route of routes)for(const jwt of ['',token({sub:'reader'}),token({exp:1})]){
    const response=await handleRequest(req(route,'GET',undefined,jwt),env);assert.equal(response.status,401,route);assert.equal(response.headers.get('cache-control'),'private, no-store');
  }
});
test('API saves and reopens structured drafts; prevents legacy conversion and stale writes',async()=>{
  await verifyAccessJwt(token(),env,async()=>Response.json({keys:[jwk]}));
  const db=database(),actual={...env,STUDIO_DB:db};const fetchBefore=globalThis.fetch;
  globalThis.fetch=async()=>Response.json({tree:[]});
  try{
    const document=sample(),source=serializeDocument(document,metadata,path);
    const payload={path,source,document,metadata,expectedVersion:0};
    let response=await handleRequest(req('/api/draft','PUT',payload),actual);assert.equal(response.status,200,await response.text());
    response=await handleRequest(req(`/api/article?path=${encodeURIComponent(path)}`),actual);let result=await response.json();assert.deepEqual(JSON.parse(result.editor_json),document);assert.equal(result.source,source);
    assert.equal((await handleRequest(req('/api/draft','PUT',{...payload,source:'different'}),actual)).status,422);
    assert.equal((await handleRequest(req('/api/draft','PUT',payload),actual)).status,409);
    assert.equal((await handleRequest(req('/api/draft','PUT',{...payload,expectedVersion:1,baseSha:'a'.repeat(40)}),actual)).status,409);
    await db.prepare('UPDATE drafts SET editor_json=NULL').run();
    assert.equal((await handleRequest(req('/api/draft','PUT',{...payload,expectedVersion:1,baseSha:'a'.repeat(40)}),actual)).status,422);
    assert.equal((await handleRequest(req('/api/publication/prepare','POST',{path,action:'publish',expectedVersion:1}),actual)).status,503);
    assert.equal((await handleRequest(req('/api/preview','POST',{document}),actual)).status,200);
  }finally{globalThis.fetch=fetchBefore;db.sqlite.close();}
});
test('forged Origin, URL/Host mismatch, huge JSON and malformed payload fail safely',async()=>{
  await verifyAccessJwt(token(),env,async()=>Response.json({keys:[jwk]}));const db=database(),actual={...env,STUDIO_DB:db};
  assert.equal((await handleRequest(req('/api/preview','POST',{},token(),'https://attacker.example'),actual)).status,403);
  assert.equal((await handleRequest(new Request('https://wrong.example/api/config',{headers:{host:'studio.example','cf-access-jwt-assertion':token()}}),actual)).status,403);
  assert.equal((await handleRequest(req('/api/preview','POST','x'.repeat(1500001)),actual)).status,413);
  assert.equal((await handleRequest(req('/api/draft','PUT','{}'),actual)).status,400);
  assert.equal((await handleRequest(req('/api/preview','POST',{document:{schema:1,blocks:[{kind:'javascript'}],notes:[]}}),actual)).status,422);db.sqlite.close();
});
test('ordinary saves never wait on GitHub; first saves and rebases still check the public index',async()=>{
  await verifyAccessJwt(token(),env,async()=>Response.json({keys:[jwk]}));
  const db=database(),actual={...env,STUDIO_DB:db};const fetchBefore=globalThis.fetch;let github=0;
  globalThis.fetch=async()=>{github++;return new Response('rate limited',{status:403});};
  clearArticleTreeCache();
  try{
    const document=sample(),source=serializeDocument(document,metadata,path);
    const payload={path,source,document,metadata,expectedVersion:0};
    // Creating a path needs the index, so an unavailable GitHub fails closed.
    assert.equal((await handleRequest(req('/api/draft','PUT',payload),actual)).status,502);
    globalThis.fetch=async()=>{github++;return Response.json({tree:[]});};
    assert.equal((await handleRequest(req('/api/draft','PUT',payload),actual)).status,200);
    globalThis.fetch=async()=>{github++;return new Response('rate limited',{status:403});};
    clearArticleTreeCache();github=0;
    for(let version=1;version<=3;version++){
      const response=await handleRequest(req('/api/draft','PUT',{...payload,expectedVersion:version,autosave:true}),actual);
      assert.equal(response.status,200,await response.text());
    }
    assert.equal(github,0,'an ordinary save asked GitHub');
    // A rebase onto a public SHA must still be verified.
    assert.equal((await handleRequest(req('/api/draft','PUT',{...payload,expectedVersion:4,baseSha:'b'.repeat(40)}),actual)).status,502);
    assert.ok(github>0);
    const opened=await (await handleRequest(req(`/api/article?path=${encodeURIComponent(path)}`),actual)).json();
    assert.equal(opened.version,4);
  }finally{globalThis.fetch=fetchBefore;clearArticleTreeCache();db.sqlite.close();}
});
test('the public index is read with the GitHub App token when publishing is configured',async()=>{
  await verifyAccessJwt(token(),env,async()=>Response.json({keys:[jwk]}));
  const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const db=database(),actual={...env,STUDIO_DB:db,STUDIO_PUBLISH_ENABLED:'true',STUDIO_BRANCH_PROTECTION_VERIFIED:'true',STUDIO_PUBLISH_BRANCH:'drafts',STUDIO_GITHUB_APP_ID:'1',STUDIO_GITHUB_INSTALLATION_ID:'2',STUDIO_GITHUB_REPOSITORY_ID:'3',STUDIO_GITHUB_PRIVATE_KEY:privateKey.export({type:'pkcs8',format:'pem'})};
  const fetchBefore=globalThis.fetch,trees=[];
  globalThis.fetch=async(url,options={})=>{
    if(String(url).endsWith('/access_tokens'))return Response.json({token:'synthetic-installation-token'});
    if(String(url).includes('/git/trees/')){trees.push(options.headers?.authorization);return options.headers?.authorization?Response.json({tree:[]}):new Response('rate limited',{status:403});}
    return new Response('unexpected',{status:500});
  };
  clearArticleTreeCache();
  try{
    const document=sample(),source=serializeDocument(document,metadata,path);
    const response=await handleRequest(req('/api/draft','PUT',{path,source,document,metadata,expectedVersion:0}),actual);
    assert.equal(response.status,200,await response.text());
    assert.deepEqual(trees,['Bearer synthetic-installation-token']);
  }finally{globalThis.fetch=fetchBefore;clearArticleTreeCache();db.sqlite.close();}
});
test('the newsletter falls back to the deploy manifest when GitHub refuses the index',async()=>{
  await verifyAccessJwt(token(),env,async()=>Response.json({keys:[jwk]}));
  const db=database(),published='src/content/articles/sample/1-sample.mdx';
  const actual={...env,STUDIO_DB:db,STUDIO_RESEND_API_KEY:'synthetic',STUDIO_RESEND_SEGMENT_ID:'segment',
    ASSETS:{fetch:async request=>new URL(request.url).pathname==='/article-manifest.json'?Response.json({articles:[{path:published}]}):new Response('missing',{status:404})}};
  const fetchBefore=globalThis.fetch;
  globalThis.fetch=async url=>{
    const target=String(url);
    if(target.includes('api.github.com'))return new Response('rate limited',{status:403});
    if(target.endsWith('/article-catalog.json'))return Response.json([{url:'/blogs/sample/1-sample/',title:'Sample',date:'2026-10-01',category:'sample'}]);
    if(target.includes('api.resend.com'))return Response.json({data:[]});
    return new Response('unexpected',{status:500});
  };
  clearArticleTreeCache();
  try{
    const response=await handleRequest(req('/api/newsletter'),actual);
    assert.equal(response.status,200,await response.clone().text());
    const body=await response.json();
    assert.equal(body.catalog[0].path,published);
  }finally{globalThis.fetch=fetchBefore;clearArticleTreeCache();db.sqlite.close();}
});
