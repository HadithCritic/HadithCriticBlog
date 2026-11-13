#!/usr/bin/env node
/*
 * Checks the hadith library's artwork against the registries that route it, and prints what each file is.
 *
 *   public/images/hadith/covers/<collection-slug>.webp   named by the collection's site slug
 *   public/images/hadith/medallions/<compiler>.webp      named by the `medallion` key in src/lib/hadith-compilers.ts
 *
 * Fails when a published collection's compiler names a medallion file that is missing, or when a file in
 * either folder belongs to no collection or compiler the registry knows. Usage: node scripts/hadith/verify-hadith-art.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = 'public/images/hadith';
const stems = dir => fs.readdirSync(path.join(root, dir)).map(file => file.replace(/\.webp$/, ''));
const registry = fs.readFileSync('src/lib/hadith-compilers.ts', 'utf8');
const art = fs.readFileSync('src/lib/hadith-art.ts', 'utf8');

// Shared compiler constants (const MALIK: Compiler = {...}) and the per-collection entries that use them.
const shared = new Map([...registry.matchAll(/const ([A-Z_]+): Compiler = \{ name: '([^']+)'[^}]*?medallion: '([^']+)'/g)].map(hit => [hit[1], { name: hit[2], medallion: hit[3] }]));
const compilers = new Map();
for (const line of registry.split('\n')) {
  const entry = line.match(/^\s*'([a-z0-9-]+)': (.+?),?\s*$/);
  if (!entry) continue;
  const spread = entry[2].match(/^(?:\{ \.\.\.)?([A-Z_]+)\b/);
  const base = spread && shared.get(spread[1]);
  compilers.set(entry[1], {
    name: entry[2].match(/name: '([^']+)'/)?.[1] ?? base?.name ?? '',
    medallion: entry[2].match(/medallion: '([^']+)'/)?.[1] ?? base?.medallion ?? '',
  });
}
const borrowed = new Map([...art.matchAll(/^\s*'([a-z0-9-]+)': '([a-z0-9-]+)',/gm)].map(hit => [hit[1], hit[2]]));
const published = [...JSON.parse(fs.readFileSync('src/data/hadith/reader-editions.json', 'utf8')).map(item => item.slug), 'al-shama-il-al-muhammadiyah'];
// Birr al-Wālidayn is al-Bukhārī's; the library page reads his entry for it.
const compilerOf = slug => compilers.get(slug === 'birr-al-walidayn' ? 'sahih-al-bukhari' : slug);

const covers = new Set(stems('covers'));
const medallions = new Set(stems('medallions'));
const problems = [];
console.log('Published collections');
for (const slug of published.sort()) {
  const compiler = compilerOf(slug);
  const cover = covers.has(slug) ? `covers/${slug}.webp` : borrowed.has(slug) ? `covers/${borrowed.get(slug)}.webp (borrowed)` : 'page/library-room.webp (no cover of its own)';
  if (borrowed.has(slug) && !covers.has(borrowed.get(slug))) problems.push(`${slug} borrows a missing cover: ${borrowed.get(slug)}`);
  if (!compiler) problems.push(`${slug} has no compiler in hadith-compilers.ts`);
  else if (compiler.medallion && !medallions.has(compiler.medallion)) problems.push(`${slug}: medallion file missing for ${compiler.name}: ${compiler.medallion}.webp`);
  console.log(`  ${slug.padEnd(44)} ${cover.padEnd(62)} ${compiler ? `${compiler.name} -> medallions/${compiler.medallion || '(none)'}.webp` : '(no compiler)'}`);
}

const knownSlugs = new Set([...compilers.keys(), ...published]);
const usedMedallions = new Map();
for (const [slug, compiler] of compilers) if (compiler.medallion) usedMedallions.set(compiler.medallion, [...(usedMedallions.get(compiler.medallion) ?? []), slug]);
const unpublished = [...covers].filter(slug => !published.includes(slug) && ![...borrowed.values()].includes(slug));
console.log(`\nCovers for collections that are not published yet (${unpublished.length}): ${unpublished.sort().join(', ')}`);
for (const slug of covers) if (!knownSlugs.has(slug)) problems.push(`covers/${slug}.webp matches no collection slug in the registry`);
console.log('\nMedallions');
for (const stem of [...medallions].sort()) {
  const slugs = usedMedallions.get(stem);
  if (!slugs) { problems.push(`medallions/${stem}.webp belongs to no compiler in the registry`); continue; }
  console.log(`  ${`${stem}.webp`.padEnd(30)} ${compilers.get(slugs[0]).name.padEnd(46)} ${slugs.join(', ')}`);
}
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n${problems.map(item => `  - ${item}`).join('\n')}`);
  process.exit(1);
}
console.log(`\nAll ${covers.size} covers and ${medallions.size} medallions are named for a collection or compiler in the registry.`);
