import test from 'node:test';
import assert from 'node:assert/strict';
import { imageType,uploadMedia,removeMedia } from '../src/media.mjs';
import { database } from './helpers.mjs';
test('uploads reject active formats and oversized bodies; sniff bytes instead of browser MIME',()=>{
  assert.throws(()=>imageType(new TextEncoder().encode('<svg onload="alert(1)"></svg>')),/PNG/);
  assert.throws(()=>imageType(new Uint8Array(8*1024*1024+1)),/8 MB/);
  const bytes=new Uint8Array(20);bytes.set([137,80,78,71,13,10,26,10]);assert.deepEqual(imageType(bytes),['image/png','png']);
});
test('private uploads are audited; historical references prevent destructive deletion',async()=>{
  const db=database(),objects=new Map();const env={STUDIO_DB:db,STUDIO_MEDIA:{put:async(k,v)=>objects.set(k,v),delete:async k=>objects.delete(k)}};
  const bytes=new Uint8Array(20);bytes.set([137,80,78,71,13,10,26,10]);
  const image=await uploadMedia(new Request('https://studio.example/api/media',{method:'POST',headers:{'x-image-alt':encodeURIComponent('Exact إِنَّ alt')},body:bytes}),env,{subject:'owner'});
  assert.equal(image.alt,'Exact إِنَّ alt');assert.equal(objects.size,1);assert.match(image.path,/^\/images\/studio\//);
  await db.prepare('INSERT INTO draft_revisions(path,version,source,created_at,created_by) VALUES(?,?,?,?,?)').bind('x',1,image.path,'now','owner').run();
  assert.equal((await removeMedia(image.id,env,{subject:'owner'})).status,409);assert.equal(objects.size,1);
  await db.prepare('DELETE FROM draft_revisions').run();assert.equal((await removeMedia(image.id,env,{subject:'owner'})).archived,true);assert.equal(objects.size,1);db.sqlite.close();
});
