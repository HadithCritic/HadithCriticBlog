// Synthetic fixture only: never stages private documents into the public site.
import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { serializeDocument } from '../src/model.mjs';
import { sample,metadata,path,PUNCTUATION } from '../tests/sample.mjs';
const root=new URL('../../scratch/studio-render/',import.meta.url);
await mkdir(new URL('src/pages/',root),{recursive:true});
const source=serializeDocument(sample(),metadata,path).replaceAll('../../../components/','../../../src/components/');
await writeFile(new URL('src/sample.mdx',root),source);
await writeFile(new URL('src/pages/index.astro',root),`---\nimport Sample from '../sample.mdx';\n---\n<html lang="en"><head><title>Synthetic fixture</title></head><body><Sample /></body></html>`);
await writeFile(new URL('astro.config.mjs',root),`import {defineConfig} from 'astro/config';\nimport {fileURLToPath} from 'node:url';\nimport mdx from '@astrojs/mdx';\nimport {unified} from '@astrojs/markdown-remark';\nimport gfm from 'remark-gfm';\nexport default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),outDir:'./dist',publicDir:'./empty-public',integrations:[mdx()],markdown:{processor:unified({remarkPlugins:[gfm]})}});`);
await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['node_modules/astro/bin/astro.mjs','build','--root','scratch/studio-render','--config','astro.config.mjs','--output','static'],{cwd:new URL('../../',import.meta.url),stdio:'inherit'});
  child.on('exit',code=>code===0?resolve():reject(new Error(`Astro render failed: ${code}`)));child.on('error',reject);
});
const html=await readFile(new URL('dist/index.html',root),'utf8');
for(const exact of ['ʿĀʾisha','إِنَّ','عِكْرِمَة {literal}','Authored test translation','Exact citation, vol. 1, p. 2','Synthetic transmission diagram','Test variants']) assert.ok(html.includes(exact),`Missing rendered text: ${exact}`);
// Prose punctuation renders as the authored characters, with no link or markup invented.
const escapedHtml=PUNCTUATION.replace(/&/g,'&#x26;').replace(/</g,'&#x3C;').replace(/>/g,'>');
const paragraph=html.match(/<p>- 1\. al-Zuhr[\s\S]*?<\/p>/)?.[0];
assert.ok(paragraph,'Missing punctuation paragraph');
const decoded=paragraph.slice(3,-4).replace(/&#x3C;/g,'<').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x26;/g,'&').replace(/&amp;/g,'&');
assert.equal(decoded,PUNCTUATION,'Punctuation paragraph changed in the Astro render');
assert.match(html,/data-footnote-ref/);assert.match(html,/data-footnote-backref/);
assert.ok(!html.includes('<script>alert'));
assert.match(html,/<thead><tr><th>Witness<\/th><th>Wording<\/th><\/tr><\/thead>/);
console.log('Actual Astro render passed: components, named slots, Unicode, table headers, footnote links and backlinks.');
