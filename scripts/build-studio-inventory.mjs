import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';

const paths = await Array.fromAsync(glob('src/content/articles/**/*.{md,mdx}'));
const articles = [];

function frontmatterValue(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  if (!match) return '';
  const value = match[1].trim();
  if (value.startsWith('"')) {
    try { return JSON.parse(value); } catch { return value.slice(1, -1); }
  }
  if (value.startsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

for (const path of paths.sort()) {
  // Git checks sources out as CRLF on Windows and LF on Linux. Inventory the
  // canonical Git text, so a checkout alone cannot break preservation checks.
  const source = (await readFile(path, 'utf8')).replaceAll('\r\n', '\n');
  const features = {
    imports: /^import\s/m.test(source),
    namedSlots: /<Fragment\s+slot=/.test(source),
    rawHtml: /<(?:div|span|table|thead|tbody|tr|td|th|figure|figcaption|section|details|summary|br|hr)\b/i.test(source),
    jsxExpressions: /\b(?:nodes|edges|rows|facts)=\{/.test(source) || /<[A-Z]\w*\s+[^>]*\{[^\n]*\/>/.test(source),
    footnotes: /\[\^[^\]]+\]/.test(source),
    customIds: /^#{1,6} .*\s+\{#[\w-]+\}\s*$/m.test(source),
    customComponents: /<[A-Z][A-Za-z0-9]*(?:\s|\/?>)/.test(source),
    tables: /^\|.*\|\s*$/m.test(source)
  };
  const sourceOnly = features.imports || features.namedSlots || features.rawHtml || features.jsxExpressions || features.footnotes || features.customIds || features.customComponents;
  const compatibility = sourceOnly ? 'source-only' : features.tables ? 'partial visual' : 'visual-safe';
  const relative = path.replaceAll('\\', '/').replace(/^src\/content\/articles\//, '');
  const title = frontmatterValue(source, 'title') || relative.split('/').at(-1).replace(/\.(md|mdx)$/i, '').replace(/^\d+-/, '').replaceAll('-', ' ');
  const hash = createHash('sha256').update(source).digest('hex');
  articles.push({
    path: `src/content/articles/${relative}`,
    id: relative.replace(/\.(md|mdx)$/i, ''),
    title,
    category: frontmatterValue(source, 'category'),
    date: frontmatterValue(source, 'date'),
    tags: (() => {
      const match = source.match(/^tags:\s*(\[.*\])\s*$/m);
      if (!match) return [];
      try { return JSON.parse(match[1]); } catch { return []; }
    })(),
    sha256: hash,
    bytes: Buffer.byteLength(source),
    compatibility,
    features
  });
}

const counts = Object.fromEntries(['visual-safe', 'partial visual', 'source-only'].map((kind) => [kind, articles.filter((article) => article.compatibility === kind).length]));
const manifest = { generatedAt: new Date().toISOString(), articleCount: articles.length, counts, articles };
await mkdir('studio/public', { recursive: true });
await mkdir('docs/studio', { recursive: true });
await writeFile('studio/public/article-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
const rows = articles.map((article) => `| \`${article.id}\` | ${article.compatibility} | ${Object.entries(article.features).filter(([, enabled]) => enabled).map(([feature]) => feature).join(', ') || '—'} | \`${article.sha256}\` |`);
const report = `# Studio article inventory\n\nGenerated ${manifest.generatedAt} from the checked-out source. This is a conservative syntax screen, not a proof of semantic round-trip safety. Files with imports, JSX, custom components, HTML, named slots, footnotes or custom heading IDs stay in source mode.\n\n- Articles: ${articles.length}\n- Visual-safe candidate: ${counts['visual-safe']}\n- Partial visual candidate: ${counts['partial visual']}\n- Source-only: ${counts['source-only']}\n\nAll SHA-256 values below are the baseline for the legacy MDX files. Re-run npm run studio:inventory after any intentional article edit.\n\n| Article | Compatibility | Detected features | SHA-256 |\n|---|---|---|---|\n${rows.join('\n')}\n`;
await writeFile('docs/studio/article-inventory.md', report);
console.log(`Inventoried ${articles.length} articles: ${counts['visual-safe']} visual-safe, ${counts['partial visual']} partial visual, ${counts['source-only']} source-only.`);
