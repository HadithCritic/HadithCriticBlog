import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parse } from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const articlesRoot = path.join(root, 'src', 'content', 'articles');
const sourceRoot = path.join(root, 'tmp', 'blog-thumbnails', 'source');
const outputRoot = path.join(root, 'public', 'images', 'blog', 'generated');
const generatedMap = path.join(root, 'src', 'data', 'blog', 'blog-artwork-generated.ts');
const excludedSlug = '87-al-sabiun-converts-not-a-sect';
const width = 1672;
const height = 941;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(file);
    return file.endsWith('.mdx') ? [file] : [];
  }));
  return nested.flat();
}

function wrapWords(value, maxChars) {
  const words = value.replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function coverOverlay(title, category) {
  const splitAt = title.search(/\s[:：—–]\s/);
  const headline = splitAt > 0 ? title.slice(0, splitAt).trim() : title;
  const deck = splitAt > 0 ? title.slice(splitAt).replace(/^\s*[:：—–]\s*/, '').trim() : category;
  const lines = wrapWords(headline, 38);
  const deckLines = wrapWords(deck, 50);
  const fontSize = lines.length > 3 ? 52 : lines.length > 2 ? 60 : lines.length === 2 ? 74 : headline.length > 24 ? 86 : 100;
  const lineHeight = Math.round(fontSize * 1.08);
  const deckFontSize = deckLines.length > 2 ? 23 : 27;
  const deckLineHeight = Math.round(deckFontSize * 1.45);
  const blockHeight = lines.length * lineHeight + 28 + deckLines.length * deckLineHeight;
  const titleStartY = Math.max(88, Math.round((480 - blockHeight) / 2 + 80));
  const titleMarkup = lines.map((line, index) =>
    `<text x="836" y="${titleStartY + index * lineHeight}" text-anchor="middle" class="title" font-size="${fontSize}px">${escapeXml(line)}</text>`
  ).join('');
  const deckStartY = titleStartY + lines.length * lineHeight + 24;
  const categoryMarkup = deckLines.map((line, index) => {
    const y = deckStartY + index * deckLineHeight;
    const rule = deckLines.length === 1 ? `<path d="M260 ${y - 12} H520 M1152 ${y - 12} H1412" class="rule"/>` : '';
    return `${rule}<text x="836" y="${y}" text-anchor="middle" class="category" font-size="${deckFontSize}px">${escapeXml(line.toLocaleUpperCase('en-US'))}</text>`;
  }).join('');

  return Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#122531" stop-opacity=".48"/><stop offset=".58" stop-color="#122531" stop-opacity=".16"/><stop offset="1" stop-color="#122531" stop-opacity="0"/></linearGradient>
      <filter id="shadow" x="-20%" y="-30%" width="140%" height="170%"><feGaussianBlur in="SourceAlpha" stdDeviation="5"/><feOffset dy="3"/><feComponentTransfer><feFuncA type="linear" slope=".42"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <style>.title{font-family:Inter,Arial,sans-serif;font-weight:800;letter-spacing:-2px;fill:#fff;filter:url(#shadow)}.category{font-family:Inter,Arial,sans-serif;font-weight:700;letter-spacing:4px;fill:#f4d28a;filter:url(#shadow)}.rule{stroke:#f4d28a;stroke-width:3;opacity:.9}</style>
    </defs>
    <rect width="${width}" height="500" fill="url(#shade)"/>
    ${titleMarkup}${categoryMarkup}
  </svg>`);
}

const files = await walk(articlesRoot);
const records = [];
const missing = [];

for (const file of files) {
  const markdown = await readFile(file, 'utf8');
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) continue;
  const data = parse(match[1]);
  const slug = path.basename(file, '.mdx');
  if (slug === excludedSlug) continue;
  const source = path.join(sourceRoot, `${slug}.png`);
  try {
    await access(source);
  } catch {
    missing.push(slug);
    continue;
  }

  const relative = `/images/blog/generated/${slug}`;
  const title = String(data.title ?? slug.replace(/^\d+-/, '').replaceAll('-', ' '));
  const category = String(data.category ?? 'HadithCritic Research');
  const overlay = coverOverlay(title, category);
  const cover = await sharp(source)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .composite([{ input: overlay }])
    .webp({ quality: 88, effort: 5 })
    .toBuffer();
  await writeFile(path.join(outputRoot, `${slug}.webp`), cover);
  await sharp(cover).resize(720).webp({ quality: 82, effort: 5 }).toFile(path.join(outputRoot, `${slug}-720.webp`));
  await sharp(cover).resize(160).webp({ quality: 76, effort: 4 }).toFile(path.join(outputRoot, `${slug}-160.webp`));

  records.push({
    id: `${path.basename(path.dirname(file))}/${slug}`,
    src: `${relative}.webp`,
    srcset: `${relative}-720.webp 720w, ${relative}.webp 1672w`,
    thumbnail: `${relative}-160.webp`,
    alt: `Illustrated cover for ${title}.`,
    width,
    height,
    fullFrame: true
  });
}

records.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
await mkdir(outputRoot, { recursive: true });
const source = `// Generated by scripts/blog/build-blog-thumbnails.mjs. Do not edit by hand.\nimport type { BlogArtwork } from './blog-artwork';\n\nexport const generatedBlogArtwork: Record<string, BlogArtwork> = ${JSON.stringify(Object.fromEntries(records.map(({ id, ...entry }) => [id, entry])), null, 2)};\n`;
await writeFile(generatedMap, source);

console.log(`Built ${records.length} article thumbnails at ${width}×${height}.`);
if (missing.length) console.log(`Still awaiting artwork (${missing.length}): ${missing.join(', ')}`);
