import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './helpers.mjs';
import { persistDraft, mutationAllowed, CHECKPOINT_INTERVAL_MS, MUTATIONS_PER_MINUTE } from '../src/store.mjs';
test('two competing creators cannot overwrite source or insert a losing revision/audit',async()=>{
  const db=database();
  const [a,b]=await Promise.all([persistDraft(db,{path:'x',source:'Exact إِنَّ',expectedVersion:0},'owner'),persistDraft(db,{path:'x',source:'Losing text',expectedVersion:0},'owner')]);
  assert.equal(a.version,1);assert.equal(b,null);
  assert.equal((await db.prepare('SELECT * FROM draft_revisions').first()).source,'Exact إِنَّ');
  assert.equal((await db.prepare('SELECT count(*) AS count FROM studio_audit').first()).count,1);
  db.sqlite.close();
});
test('competing updates, missing drafts, structured reopen and rollback keep exact snapshots',async()=>{
  const db=database();
  const original={path:'x',source:'Original\r\nعِكْرِمَة',expectedVersion:0,document:{schema:1}};
  await persistDraft(db,original,'owner');
  const [a,b]=await Promise.all([persistDraft(db,{...original,source:'Revision 2',expectedVersion:1},'owner'),persistDraft(db,{...original,source:'Losing update',expectedVersion:1},'owner')]);
  assert.equal(a.version,2);assert.equal(b,null);
  assert.equal(await persistDraft(db,{path:'absent',source:'invalid',expectedVersion:7},'owner'),null);
  const old=await db.prepare('SELECT * FROM draft_revisions WHERE version=1').first();
  assert.equal(old.source,original.source);assert.deepEqual(JSON.parse(old.editor_json),original.document);
  const restored=await persistDraft(db,{path:'x',source:old.source,expectedVersion:2},'owner');assert.equal(restored.version,3);
  assert.equal((await db.prepare('SELECT count(*) AS count FROM draft_revisions').first()).count,3);
  db.sqlite.close();
});
test('mutation rate limits reset by minute without storing credentials',async()=>{
  const db=database();for(let i=0;i<MUTATIONS_PER_MINUTE;i++)assert.equal(await mutationAllowed(db,'owner',100000),true);
  assert.equal(await mutationAllowed(db,'owner',100000),false);assert.equal(await mutationAllowed(db,'owner',200000),true);db.sqlite.close();
});
test('archive and restore are versioned and preserve exact source and historical state',async()=>{
  const db=database(),payload={path:'x',source:'Exact إِنَّ\r\n',expectedVersion:0};await persistDraft(db,payload,'owner');
  await persistDraft(db,{...payload,expectedVersion:1,archived:true},'owner');
  assert.ok((await db.prepare('SELECT archived_at FROM drafts').first()).archived_at);
  await persistDraft(db,{...payload,expectedVersion:2,archived:false},'owner');
  assert.equal((await db.prepare('SELECT archived_at FROM drafts').first()).archived_at,null);
  assert.equal((await db.prepare('SELECT source FROM drafts').first()).source,payload.source);
  assert.ok((await db.prepare('SELECT archived_at FROM draft_revisions WHERE version=2').first()).archived_at);db.sqlite.close();
});
test('autosaves add a revision only once per checkpoint interval; deliberate saves always do',async()=>{
  const db=database(),start=Date.parse('2026-10-12T10:00:00Z'),payload={path:'x',source:'Draft one',expectedVersion:0};
  assert.equal((await persistDraft(db,{...payload,checkpoint:false},'owner',start)).revision,true);
  assert.equal((await persistDraft(db,{...payload,source:'Draft two',expectedVersion:1,checkpoint:false},'owner',start+60000)).revision,false);
  assert.equal((await persistDraft(db,{...payload,source:'Draft three',expectedVersion:2,checkpoint:false},'owner',start+120000)).revision,false);
  assert.equal((await persistDraft(db,{...payload,source:'Deliberate',expectedVersion:3},'owner',start+180000)).revision,true);
  assert.equal((await persistDraft(db,{...payload,source:'Later autosave',expectedVersion:4,checkpoint:false},'owner',start+CHECKPOINT_INTERVAL_MS+190000)).revision,true);
  const versions=(await db.prepare('SELECT version FROM draft_revisions ORDER BY version').all()).results.map(row=>row.version);
  assert.deepEqual(versions,[1,4,5]);
  assert.equal((await db.prepare('SELECT source FROM drafts').first()).source,'Later autosave');
  assert.equal((await db.prepare('SELECT count(*) AS count FROM studio_audit').first()).count,5);
  db.sqlite.close();
});
