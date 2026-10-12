import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import { serializeDocument, validateDocument, renderPreview, prose } from '../src/model.mjs';
import { validateProps } from '../src/registry.mjs';
import { sample, metadata, path } from './sample.mjs';

test('deterministic serialization preserves Unicode and compiles as MDX with GFM footnotes',async()=>{
  const doc=sample(), source=serializeDocument(doc,metadata,path);
  assert.equal(serializeDocument(JSON.parse(JSON.stringify(doc)),metadata,path),source);
  assert.match(source,/إِنَّ/);assert.match(source,/ʿĀʾisha/);assert.match(source,/\[\^source-a\]/);
  assert.match(source,/import HadithBlock from '\.\.\/\.\.\/\.\.\/components/);
  assert.match(source,/<th slot="header">/);
  const body=source.replace(/^---\n[\s\S]*?\n---\n/,'');
  await compile(body,{remarkPlugins:[remarkGfm]});
  assert.match(source,/\\{literal\\}/);
  // Plain punctuation stays readable in the public source; only syntax is escaped.
  assert.match(source,/al-Zuhrī \(d\. 124\/742\): see {"www\.example\.org"}/);
  assert.doesNotMatch(source,/&#\d+;/);
  assert.doesNotMatch(source,/<script>/);
});
test('footnotes reject duplicate IDs, missing definitions, unused definitions and nested references',()=>{
  let doc=sample();doc.notes.push(doc.notes[0]);assert.throws(()=>validateDocument(doc),/unique/);
  doc=sample();doc.notes.push({id:'SOURCE-A',content:prose('different')});assert.throws(()=>validateDocument(doc),/unique/);
  doc=sample();doc.notes=[];assert.throws(()=>validateDocument(doc),/Missing footnote/);
  doc=sample();doc.notes.push({id:'unused',content:prose('x')});assert.throws(()=>validateDocument(doc),/Unreferenced/);
  doc=sample();doc.notes[0].content.content[0].content.push({type:'footnote',attrs:{id:'source-a'}});assert.throws(()=>validateDocument(doc),/nested/);
});
test('preview escapes code and links, has stable repeated-reference backlinks, never executes MDX',()=>{
  const html=renderPreview(sample());
  assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);
  assert.match(html,/id="ref-source-a-1"/);assert.match(html,/id="ref-source-a-2"/);
  assert.match(html,/href="#ref-source-a-2"/);
  const doc=sample();doc.blocks[0].content.content[1].content[0].marks=[{type:'link',attrs:{href:'javascript:alert(1)'}}];assert.throws(()=>renderPreview(doc),/HTTPS/);
  doc.blocks[0].kind='opaque';assert.throws(()=>renderPreview(doc),/Unknown block/);
});
test('registry rejects arbitrary props, ragged tables, duplicate diagram nodes and dangling edges',()=>{
  assert.throws(()=>validateProps('HadithBlock',{onload:'alert(1)'}),/Unknown field/);
  assert.throws(()=>validateProps('SourceComparisonTable',{columns:['a'],rows:[['a','b']]}),/widths/);
  assert.throws(()=>validateProps('IsnadDiagram',{ariaLabel:'x',nodes:[{id:'a',x:1,y:2},{id:'a',x:2,y:3}],edges:[]}),/unique/);
  assert.throws(()=>validateProps('IsnadDiagram',{ariaLabel:'x',nodes:[{id:'a',x:1,y:2}],edges:[{from:'a',to:'missing'}]}),/unknown node/);
});
test('empty metadata, wrong dates and empty notes fail before saving',()=>{
  assert.throws(()=>serializeDocument(sample(),{...metadata,title:''},path),/required/);
  assert.throws(()=>serializeDocument(sample(),{...metadata,date:'bad'},path),/date/);
  const doc=sample();doc.notes[0].content=prose();assert.throws(()=>validateDocument(doc),/Empty footnote/);
});
test('formatting preserves leading/trailing spaces and responsive images stay private paths until publication',async()=>{
  const doc={schema:1,blocks:[{kind:'prose',content:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:' exact words ',marks:[{type:'bold'},{type:'italic'}]}]}]}},{kind:'image',src:'/images/studio/main.webp',alt:'Exact image description',caption:'Caption {literal}',variants:[{src:'/images/studio/small.webp',width:160},{src:'/images/studio/main.webp',width:1536}]}],notes:[]};
  const source=serializeDocument(doc,metadata,path);assert.match(source,/<em><strong> exact words <\/strong><\/em>/);assert.match(source,/srcset=/);assert.doesNotMatch(source,/private\/|r2\.dev/);
  await compile(source.replace(/^---\n[\s\S]*?\n---\n/,''),{remarkPlugins:[remarkGfm]});
});
test('all 90 legacy sources still match the original inventory checksums',async()=>{
  const inventory=JSON.parse(await readFile(new URL('../public/article-manifest.json',import.meta.url),'utf8'));
  assert.equal(inventory.articles.length,90);
  for(const article of inventory.articles){
    const bytes=await readFile(new URL(`../../${article.path}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),article.sha256,article.path);
  }
});
