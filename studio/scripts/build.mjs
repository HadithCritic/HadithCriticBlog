import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
await build({ entryPoints: ['src/editor.mjs'], outfile: 'public/editor.js', bundle: true, format: 'esm', minify: true, legalComments: 'eof' });
await mkdir('public/shared', { recursive: true });
for (const name of ['model', 'registry']) await copyFile(`src/${name}.mjs`, `public/shared/${name}.mjs`);
// Public styles only. No environment, draft data, or server module is bundled.
for (const name of ['article', 'article-plates']) await copyFile(`../src/styles/${name}.css`, `public/${name}.css`);
// The article styles name a few public engravings by absolute path; copy them
// to the same paths so the preview draws what the site draws.
for (const name of ['article', 'article-plates']) {
  const css = await readFile(`../src/styles/${name}.css`, 'utf8');
  for (const [, src] of css.matchAll(/url\(['"]?(\/images\/[^'")]+)['"]?\)/g)) {
    await mkdir(dirname(`public${src}`), { recursive: true });
    await copyFile(`../public${src}`, `public${src}`);
  }
}
await mkdir('public/fonts', { recursive: true });
for (const name of ['source-serif-4-roman.woff2', 'source-serif-4-italic.woff2', 'SourceSerif4-LICENSE.md']) await copyFile(`../public/fonts/${name}`, `public/fonts/${name}`);

// Already-public artwork only: the brand emblem, one editorial engraving and
// each published article's own thumbnails, keyed by collection id.
await mkdir('public/brand', { recursive: true });
await copyFile('../public/images/brand/hc-logo-transparent-192.png', 'public/brand/hc-mark-192.png');
await copyFile('../public/images/brand/geometric-emblem-96.webp', 'public/brand/hc-mark-96.webp');
for (const [source, name] of [
  ['images/academic-studies-art.webp', 'art-writing'],
  ['images/editorial/contact-hero-1086.webp', 'art-newsletter'],
  ['images/editorial/projects-hero-1086.webp', 'art-analytics'],
  ['images/editorial/academia-hero-1086.webp', 'art-health'],
  ['images/editorial/youtube-hero-1086.webp', 'art-activity']
]) await copyFile(`../public/${source}`, `public/brand/${name}.webp`);
const { blogArtwork } = await import(pathToFileURL(resolve('../src/data/blog-artwork.ts')).href);
await mkdir('public/artwork', { recursive: true });
const artwork = {};
for (const [id, entry] of Object.entries(blogArtwork)) {
  const small = entry.thumbnail, medium = entry.srcset.split(',').map(part => part.trim().split(' ')[0]).find(src => /-720\.webp$/.test(src));
  const copy = async src => { const name = src.split('/').at(-1); await copyFile(`../public${src}`, `public/artwork/${name}`); return `/artwork/${name}`; };
  artwork[id] = { thumb: await copy(small), card: medium ? await copy(medium) : await copy(small) };
}
await writeFile('public/artwork.json', JSON.stringify(artwork));
