import { readFile,access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const fixtures=JSON.parse(await readFile('docs/studio/rendered-fixtures.json','utf8'));
for(const fixture of fixtures.fixtures){
  const source=(await readFile(`src/content/articles/${fixture.id}.mdx`,'utf8')).replaceAll('\r\n','\n');
  assert.equal(createHash('sha256').update(source).digest('hex'),fixture.sourceSha256,fixture.id);
  const html=await readFile(`dist/client/blogs/${fixture.id}/index.html`,'utf8');
  const headings=[...html.matchAll(/<h([1-6])\b[^>]*\bid="([^"]+)"[^>]*>/g)].map(match=>({depth:Number(match[1]),id:match[2]}));
  assert.deepEqual(headings,fixture.headingIds,`${fixture.id}: heading IDs`);
  assert.equal([...html.matchAll(/\shref=/g)].length,fixture.linkCount,`${fixture.id}: links`);
  assert.equal([...html.matchAll(/doc-noteref|user-content-fnref-/g)].length,fixture.footnoteReferenceCount,`${fixture.id}: footnotes`);
  assert.equal([...html.matchAll(/isnad-diagram|variant-tree/g)].length,fixture.diagramCount,`${fixture.id}: diagrams`);
}
for(const path of ['studio/index.html','studio.js','editor.js','article-manifest.json']){
  let exists=false;try{await access(`dist/client/${path}`);exists=true;}catch{}
  assert.equal(exists,false,`Private Studio asset unexpectedly reached public output: ${path}`);
}
for(const path of ['search-index.json','rss.xml','index.html']){
  const source=await readFile(`dist/client/${path}`,'utf8');assert.ok(!source.includes('Synthetic Studio rendering fixture'),`Fixture leaked into ${path}`);
}
console.log('Preserved article fixtures: source hashes, heading IDs, links, footnotes and diagrams. Studio assets and synthetic drafts are absent from public output.');
