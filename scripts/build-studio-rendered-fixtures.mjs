import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const examples = [
  { id: 'transmission-narrators/82-the-bottleneck-fussilat-misses', role: 'named slots and embedded tables' },
  { id: 'transmission-narrators/85-aisha-and-the-quran-as-criterion', role: 'nested HTML and GFM footnotes' }
];
const inventory = JSON.parse(await readFile('studio/public/article-manifest.json', 'utf8'));
const byId = new Map(inventory.articles.map((article) => [article.id, article]));
const fixtures = [];

for (const example of examples) {
  const outputPath = `dist/client/blogs/${example.id}/index.html`;
  const html = await readFile(outputPath, 'utf8');
  const matches = [...html.matchAll(/<h([1-6])\b[^>]*\bid="([^"]+)"[^>]*>/g)];
  fixtures.push({
    id: example.id,
    role: example.role,
    sourceSha256: byId.get(example.id)?.sha256,
    renderedSha256: createHash('sha256').update(html).digest('hex'),
    renderedBytes: Buffer.byteLength(html),
    headingIds: matches.map((match) => ({ depth: Number(match[1]), id: match[2] })),
    linkCount: [...html.matchAll(/\shref=/g)].length,
    footnoteReferenceCount: [...html.matchAll(/doc-noteref|user-content-fnref-/g)].length,
    diagramCount: [...html.matchAll(/isnad-diagram|variant-tree/g)].length
  });
}

await writeFile('docs/studio/rendered-fixtures.json', `${JSON.stringify({ generatedFrom: 'dist/client', fixtures }, null, 2)}\n`);
console.log(`Recorded rendered markup hashes for ${fixtures.length} representative articles.`);
