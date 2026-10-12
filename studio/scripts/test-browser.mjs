// Loopback-only signed test proxy with synthetic content. Never deploy this harness.
import { createServer } from 'node:http';
import { readFile,mkdir } from 'node:fs/promises';
import { generateKeyPairSync,sign,createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { handleRequest } from '../src/worker.mjs';
import { verifyAccessJwt } from '../src/auth.mjs';
import { database } from '../tests/helpers.mjs';
import { persistDraft } from '../src/store.mjs';
import { sample,metadata,path } from '../tests/sample.mjs';
import { serializeDocument } from '../src/model.mjs';
const db=database(),key=generateKeyPairSync('rsa',{modulusLength:2048}),jwk={...key.publicKey.export({format:'jwk'}),kid:'browser-test'};
const env={STUDIO_ALLOWED_HOST:'test-studio.example',STUDIO_TEAM_DOMAIN:'browser-test',STUDIO_AUD:'test',STUDIO_OWNER_EMAIL:'owner@example.com',STUDIO_OWNER_SUBJECT:'owner',STUDIO_DB:db,STUDIO_REPO_OWNER:'synthetic',STUDIO_REPO_NAME:'synthetic',STUDIO_SOURCE_REF:'fixture',
  STUDIO_RESEND_API_KEY:'synthetic',STUDIO_RESEND_SEGMENT_ID:'seg-test',STUDIO_CF_ANALYTICS_TOKEN:'synthetic',STUDIO_CF_ZONE_ID:'zone-test'};
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');const now=Math.floor(Date.now()/1000);
const unsigned=`${encode({alg:'RS256',kid:'browser-test'})}.${encode({iss:'https://browser-test.cloudflareaccess.com',type:'app',aud:['test'],sub:'owner',email:'owner@example.com',iat:now,exp:now+3600})}`;
const jwt=`${unsigned}.${sign('RSA-SHA256',Buffer.from(unsigned),key.privateKey).toString('base64url')}`;
await verifyAccessJwt(jwt,env,async()=>Response.json({keys:[jwk]}));
await persistDraft(db,{path,source:serializeDocument(sample(),metadata,path),document:sample(),expectedVersion:0},'owner');
const legacyPath='src/content/articles/transmission-narrators/legacy-fixture.mdx';
const legacy='---\r\ntitle: "Legacy preservation fixture"\r\ndescription: "Synthetic only"\r\ndate: 2026-10-12\r\ncategory: "Transmission & Narrators"\r\n---\r\n\r\nExact Arabic إِنَّ and <Arabic>عِكْرِمَة</Arabic>.\r\n';
const sha=createHash('sha1').update(`blob ${Buffer.byteLength(legacy)}\0`).update(legacy).digest('hex');
const realFetch=globalThis.fetch;
// Synthetic stand-ins for Resend, Cloudflare analytics and the public site.
const broadcastsSent=[],testsSent=[];
const zone={daily:Array.from({length:30},(_,i)=>({dimensions:{date:new Date(Date.now()-(29-i)*864e5).toISOString().slice(0,10)},sum:{requests:400+i*10,pageViews:100+i*3,cachedRequests:300,bytes:5e6},uniq:{uniques:40+i}})),
  articles:[{count:12,sum:{visits:9},dimensions:{clientRequestPath:'/blogs/transmission-narrators/legacy-fixture/'}}],pages:[{count:30,sum:{visits:20},dimensions:{clientRequestPath:'/'}}],
  countries:[{sum:{visits:20},dimensions:{clientCountryName:'GB'}}],corpus:[{count:5,sum:{edgeResponseBytes:5e7}}],bots:[{count:7,dimensions:{verifiedBotCategory:'Search Engine Crawler'}}]};
function external(u,options){
  if(u.startsWith('https://api.resend.com/contacts'))return Response.json({data:[1,2,3].map(i=>({id:`c${i}`,unsubscribed:false,created_at:new Date(Date.now()-i*5*864e5).toISOString()})),has_more:false});
  if(u==='https://api.resend.com/segments')return Response.json({data:[{id:'seg-test',name:'Blog Updates'}]});
  if(u==='https://api.resend.com/broadcasts'&&options?.method==='POST'){broadcastsSent.push(JSON.parse(options.body));return Response.json({id:'00000000-0000-4000-8000-000000000001'});}
  if(u==='https://api.resend.com/broadcasts')return Response.json({data:[{id:'00000000-0000-4000-8000-000000000002',name:'Earlier',subject:'New on HadithCritic: Earlier',status:'sent',created_at:'2026-09-01T00:00:00Z',sent_at:'2026-09-01T00:00:00Z'}]});
  if(u==='https://api.resend.com/emails'){testsSent.push(JSON.parse(options.body));return Response.json({id:'e1'});}
  if(u==='https://api.resend.com/domains')return Response.json({data:[{name:'hadithcriticblog.com',status:'verified'}]});
  if(u==='https://hadithcriticblog.com/article-catalog.json')return Response.json([{url:'/blogs/transmission-narrators/legacy-fixture/',title:'Legacy preservation fixture',description:'',category:'Transmission & Narrators',tags:[],date:'12 Oct 2026'}]);
  if(u.startsWith('https://hadithcriticblog.com/'))return new Response(null,{status:200});
  if(u.startsWith('https://raw.githubusercontent.com/'))return new Response(legacy);
  if(u==='https://api.cloudflare.com/client/v4/graphql'){const {sinceDay}=JSON.parse(options.body).variables;return Response.json({data:{viewer:{zones:[{...zone,daily:zone.daily.filter(row=>row.dimensions.date>=sinceDay)}]}}});}
  return null;
}
globalThis.fetch=async(url,options)=>{
  const stub=external(String(url),options);if(stub)return stub;
  if(String(url).includes('api.github.com')&&String(url).includes('/git/trees/'))return Response.json({tree:[{path:legacyPath,type:'blob',sha}]});
  if(String(url).includes('api.github.com')&&String(url).includes('/git/blobs/'))return Response.json({encoding:'base64',content:Buffer.from(legacy).toString('base64')});
  return realFetch(url,options);
};
const types={html:'text/html',js:'text/javascript',mjs:'text/javascript',css:'text/css',json:'application/json',woff2:'font/woff2',png:'image/png',webp:'image/webp'};
env.ASSETS={fetch:async request=>{
  let name=new URL(request.url).pathname;if(name==='/')name='/index.html';
  if(name==='/article-manifest.json')return Response.json({articles:[{path:legacyPath,title:'Legacy preservation fixture',date:'2026-10-12'}]});
  if(name.includes('..'))return new Response('',{status:404});
  try{return new Response(await readFile(new URL(`../public${name}`,import.meta.url)),{headers:{'content-type':types[name.split('.').at(-1)]||'application/octet-stream'}});}catch{return new Response('',{status:404});}
}};
const objects=new Map();env.STUDIO_MEDIA={put:async(k,v)=>objects.set(k,v),get:async k=>objects.has(k)?{body:objects.get(k),arrayBuffer:async()=>objects.get(k).buffer}:null,delete:async k=>objects.delete(k)};
const server=createServer(async(req,res)=>{
  // Only this local test origin may invoke the signed proxy.
  const allowed=`http://127.0.0.1:${server.address().port}`;
  if(req.headers.host!==`127.0.0.1:${server.address().port}`||(req.headers.origin&&req.headers.origin!==allowed)){res.writeHead(403);res.end();return;}
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const headers={...req.headers,host:env.STUDIO_ALLOWED_HOST,'cf-access-jwt-assertion':jwt};
  if(headers.origin)headers.origin=`https://${env.STUDIO_ALLOWED_HOST}`;
  const response=await handleRequest(new Request(`https://${env.STUDIO_ALLOWED_HOST}${req.url}`,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})}),env);
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1500,height:1050}});const errors=[],cspErrors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'&&/Content Security Policy/i.test(message.text()))cspErrors.push(message.text());});
page.setDefaultTimeout(15000);
try{
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator('#continue-list li').first().waitFor();await page.waitForTimeout(500);await page.screenshot({path:new URL('../../output/studio/overview.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
  await page.locator('#article-list').getByRole('button',{name:'Synthetic Studio rendering fixture',exact:false}).click();
  await page.locator('#visual-editor').waitFor({state:'visible'});
  assert.equal(await page.locator('#visual-mode').isDisabled(),false);
  await page.locator('#preview-button').click();
  await page.locator('#preview-dialog').waitFor({state:'visible'});
  assert.ok((await page.locator('#preview-content').innerText()).includes('إِنَّ'));
  await page.locator('[data-note="source-a"]').first().click();await page.locator('#note-dialog').waitFor({state:'visible'});await page.locator('#close-note').click();await page.locator('#close-preview').click();
  const proseEditor=page.locator('.tiptap').first();await proseEditor.click();await page.keyboard.press('End');await page.keyboard.type(' Browser-authoring test.');
  await page.locator('#save-button').click();await page.waitForFunction(()=>document.getElementById('save-state').textContent.startsWith('Saved privately'));
  await page.reload();await page.locator('#article-list').getByRole('button',{name:'Synthetic Studio rendering fixture',exact:false}).click();assert.ok((await proseEditor.innerText()).includes('Browser-authoring test.'));
  await mkdir(new URL('../../output/studio/',import.meta.url),{recursive:true});await page.screenshot({path:new URL('../../output/studio/visual-editor.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:false});
  const {default:sharp}=await import('sharp');const image=await sharp({create:{width:1000,height:600,channels:3,background:'#d8b166'}}).png().toBuffer();
  await page.locator('#media-button').click();await page.locator('#media-dialog').waitFor({state:'visible'});await page.locator('#media-file').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:image});await page.locator('#media-alt').fill('Synthetic image alt إِنَّ');await page.locator('#media-crop').selectOption('1');await page.getByRole('button',{name:'Upload private image',exact:true}).click();await page.waitForFunction(()=>document.getElementById('media-status').textContent==='Image stored privately.');
  assert.equal(objects.size,2);await page.getByRole('button',{name:'Use as thumbnail',exact:true}).first().click();await page.locator('#save-button').click();await page.waitForFunction(()=>document.getElementById('save-state').textContent.startsWith('Saved privately'));
  const current=await db.prepare('SELECT * FROM drafts WHERE path=?').bind(path).first();
  await persistDraft(db,{path,source:current.source,document:JSON.parse(current.editor_json),baseSha:current.base_sha,expectedVersion:current.version},'owner');
  await proseEditor.click();await page.keyboard.press('End');await page.keyboard.type(' Reviewed concurrent edit.');await page.locator('#save-button').click();await page.waitForFunction(()=>document.getElementById('save-state').textContent.startsWith('Conflict'));
  await page.locator('#resolve-conflict').click();await page.locator('#conflict-dialog').waitFor({state:'visible'});await page.locator('#conflict-confirm').fill('KEEP EDITOR');await page.locator('#adopt-private-version').click();await page.locator('#save-button').click();await page.waitForFunction(()=>document.getElementById('save-state').textContent.startsWith('Saved privately'));
  await page.locator('#article-list').getByRole('button',{name:'Legacy preservation fixture',exact:false}).click();
  await page.waitForFunction(()=>document.getElementById('editor-path').textContent.includes('legacy-fixture'));
  assert.equal(await page.locator('#visual-mode').isDisabled(),true);
  await page.locator('#meta-title').fill('Changed metadata only');await page.locator('#save-button').click();await page.waitForFunction(()=>document.getElementById('save-state').textContent.startsWith('Saved privately'));
  const saved=await db.prepare('SELECT source FROM drafts WHERE path=?').bind(legacyPath).first();assert.equal(saved.source.split(/---\r?\n/).at(-1),legacy.split(/---\r?\n/).at(-1));
  await page.locator('#new-article').click();await page.locator('#new-title').fill('New visual fixture');await page.locator('#new-description').fill('Synthetic new article');await page.getByRole('button',{name:'Open draft',exact:true}).click();
  await page.locator('#visual-editor').waitFor({state:'visible'});
  assert.equal(await page.locator('#visual-editor').isVisible(),true);
  await page.locator('#visual-editor select[aria-label="Block type"]').selectOption('Prose');await page.getByRole('button',{name:'Insert block',exact:true}).click();await page.locator('.tiptap').first().fill('A new article without editing source.');
  await page.locator('#visual-editor select[aria-label="Paragraph or heading"]').first().selectOption('2');
  await page.locator('.tiptap').first().click();await page.keyboard.press('End');await page.keyboard.press('Enter');await page.keyboard.type('Exact new prose with a footnote.');
  await page.locator('#visual-editor input[aria-label="New footnote ID"]').fill('note-ui');await page.getByRole('button',{name:'Insert footnote at cursor',exact:true}).click();await page.locator('.tiptap').last().fill('Exact citation: Test Author, vol. 3, p. 4. إِنَّ');
  await page.locator('#visual-editor select[aria-label="Block type"]').selectOption('HadithBlock');await page.getByRole('button',{name:'Insert block',exact:true}).click();
  const report=page.locator('.visual-block').last();await report.getByLabel('Translation',{exact:true}).fill('Synthetic English quotation');await report.getByLabel('Arabic',{exact:true}).fill('إِنَّ هَذَا نَصٌّ');await report.getByLabel('Source citation',{exact:true}).fill('Exact fixture citation');
  await page.locator('#visual-editor select[aria-label="Block type"]').selectOption('SourceComparisonTable');await page.getByRole('button',{name:'Insert block',exact:true}).click();
  const table=page.locator('.visual-block').last();await table.getByRole('group',{name:'Rows',exact:true}).getByRole('button',{name:'Add row',exact:true}).click();await table.getByLabel('Column 1',{exact:true}).fill('Witness A');await table.getByLabel('Column 2',{exact:true}).fill('Exact wording | {braces}');
  await page.locator('#media-button').click();await page.getByRole('button',{name:'Use as thumbnail',exact:true}).first().click();
  await page.locator('#save-button').click();await page.waitForFunction(()=>document.getElementById('save-state').textContent.startsWith('Saved privately'));
  const richDraft=await db.prepare('SELECT editor_json,source FROM drafts WHERE path LIKE ?').bind('%studio-new-visual-fixture.mdx').first();const richDoc=JSON.parse(richDraft.editor_json);
  assert.equal(richDoc.blocks.length,3);assert.equal(richDoc.notes[0].id,'note-ui');assert.ok(richDraft.source.includes('إِنَّ هَذَا نَصٌّ'));assert.ok(richDraft.source.includes('/images/studio/'));
  // Tabs: the open draft survives a trip through every other tab.
  const editorText=await page.locator('.tiptap').first().innerText();
  await page.getByRole('link',{name:'Analytics',exact:true}).click();
  await page.locator('#view-analytics .stat__value').first().waitFor();
  assert.equal(await page.locator('#editor').isVisible(),false);
  { const text=await page.locator('#view-analytics').innerText(); assert.ok(text.includes('Changed metadata only'),'the private title names the article'); }
  assert.equal(await page.locator('#article-list').isVisible(),false);
  await page.waitForTimeout(400);await page.screenshot({path:new URL('../../output/studio/analytics.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
  await page.locator('#view-analytics').getByRole('button',{name:'7 days',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('#view-analytics .chart__bar').length===7);
  await page.getByRole('link',{name:'Site health',exact:true}).click();await page.locator('#view-health .check').first().waitFor();
  assert.ok((await page.locator('#view-health').innerText()).includes('hadithcriticblog.com is verified for sending.'));await page.waitForTimeout(400);await page.screenshot({path:new URL('../../output/studio/health.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
  await page.getByRole('link',{name:'Activity',exact:true}).click();await page.locator('#view-activity table').waitFor();
  assert.ok((await page.locator('#view-activity').innerText()).includes('Draft saved'));
  await page.getByRole('link',{name:'Newsletter',exact:true}).click();await page.locator('#view-newsletter .pick').first().waitFor();
  await page.locator('#nl-send').waitFor();assert.equal(await page.locator('#nl-send').isDisabled(),true);
  await page.locator('#view-newsletter').getByLabel('Legacy preservation fixture',{exact:false}).check();
  await page.locator('#nl-intro').fill('Exact intro إِنَّ {{ not a variable }}');
  await page.locator('#nl-preview-button').click();await page.locator('.mail-frame').waitFor();
  const frame=page.frameLocator('.mail-frame');
  assert.equal(await frame.locator('h1').innerText(),'Legacy preservation fixture');
  assert.equal(await frame.locator('h1').evaluate(node=>getComputedStyle(node).fontSize),'22px','inline email styles must survive the Studio CSP');
  assert.ok((await frame.locator('body').innerText()).includes('{{ not a variable }}'));
  await page.locator('#nl-test').click();await page.waitForFunction(()=>document.getElementById('notice').textContent.startsWith('Test sent'));
  assert.deepEqual(testsSent[0].to,['owner@example.com']);
  await page.locator('#nl-confirm').fill('SEND TO 2');assert.equal(await page.locator('#nl-send').isDisabled(),true);
  await page.locator('#nl-confirm').fill('SEND TO 3');assert.equal(await page.locator('#nl-send').isDisabled(),false);
  await page.locator('#nl-intro').fill('Changed after preview');assert.equal(await page.locator('#nl-send').isDisabled(),true,'an edit after the preview must require a new preview');
  await page.locator('#nl-preview-button').click();await page.waitForFunction(()=>!document.getElementById('nl-send').disabled);
  await page.locator('#nl-send').click();await page.waitForFunction(()=>document.getElementById('notice').textContent.startsWith('Sent to 3'));
  assert.equal(broadcastsSent.length,1);assert.equal(broadcastsSent[0].segment_id,'seg-test');assert.ok(broadcastsSent[0].html.includes('{{{RESEND_UNSUBSCRIBE_URL}}}'));
  assert.ok(await db.prepare("SELECT 1 FROM studio_audit WHERE action='newsletter.send' AND path=?").bind(legacyPath).first());
  await page.locator('#view-newsletter .pick').first().waitFor();assert.ok((await page.locator('#view-newsletter .pick').first().innerText()).includes('Announced'));
  await page.screenshot({path:new URL('../../output/studio/newsletter.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  for(const tab of ['Newsletter','Analytics','Site health','Activity']){
    await page.getByRole('link',{name:tab,exact:true}).click();await page.waitForTimeout(400);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),`${tab} overflows a phone screen`);
  }
  await page.getByRole('link',{name:'Analytics',exact:true}).click();await page.locator('#view-analytics .stat__value').first().waitFor();
  await page.screenshot({path:new URL('../../output/studio/analytics-phone.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
  await page.setViewportSize({width:1500,height:1050});
  await page.getByRole('link',{name:'Writing',exact:true}).click();
  await page.locator('#editor').waitFor({state:'visible'});assert.equal(await page.locator('.tiptap').first().innerText(),editorText);
  assert.deepEqual(errors,[]);assert.deepEqual(cspErrors,[]);console.log('Browser flow passed: visual reopen, footnote popover, private cropped media/thumbnail, legacy metadata preservation, new authoring, private saves, and the newsletter, analytics, health and activity tabs.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));globalThis.fetch=realFetch;db.sqlite.close();}
