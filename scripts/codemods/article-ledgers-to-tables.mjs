// One-off codemod, run after article-figures-to-shared.mjs: a figure that is
// a table in all but name (a head row of labels, then rows with the same
// number of plain cells) becomes a <SourceComparisonTable>. Text is unchanged.
//
//   node scripts/codemods/article-ledgers-to-tables.mjs [--write]
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WRITE = process.argv.includes('--write');
const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') ? [p] : [];
});

/* Direct element children of the markup between `from` and `to`. */
function children(src, from, to) {
  const out = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  re.lastIndex = from;
  let depth = 0;
  let open = null;
  let m;
  while ((m = re.exec(src)) && m.index < to) {
    const [whole, closing, name, self] = m;
    if (['br', 'img', 'hr', 'wbr'].includes(name) || self) {
      if (depth === 0) out.push({ name, start: m.index, end: m.index + whole.length, inner: '', attrs: whole });
      continue;
    }
    if (!closing) {
      if (depth === 0) open = { name, start: m.index, openEnd: m.index + whole.length, attrs: whole };
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0 && open) {
        out.push({ ...open, end: m.index + whole.length, inner: src.slice(open.openEnd, m.index) });
        open = null;
      }
    }
  }
  return out;
}

const INLINE_ONLY = (html) => !/<(div|p|h[1-6]|ul|ol|section|article|blockquote|table)\b/.test(html);
const cellHtml = (html) => html.trim()
  .replace(/<span class="hc-fig__ar">/g, '<span lang="ar" dir="rtl">')
  .replace(/\s*\n\s*/g, ' ');

/* A matrix: k head cells, then rows of k plain cells, all direct children
   of one grid figure (`--c2` to `--c4`). */
function convertMatrices(src) {
  let count = 0;
  const re = /<div class="hc-fig hc-fig--c([234])"[^>]*>/g;
  let m;
  while ((m = re.exec(src))) {
    const at = m.index;
    const k = Number(m[1]);
    const fig = children(src, at, src.length)[0];
    if (!fig || fig.start !== at) continue;
    const kids = children(src, fig.openEnd, fig.end - '</div>'.length);
    const heads = kids.slice(0, k);
    const body = kids.slice(k);
    const isHead = (c) => c.name === 'div' && /class="hc-fig__item hc-fig__kicker"/.test(c.attrs) && INLINE_ONLY(c.inner);
    const isCell = (c) => c.name === 'div' && /class="hc-fig__item"/.test(c.attrs) && INLINE_ONLY(c.inner);
    if (heads.length !== k || !heads.every(isHead) || !body.length || body.length % k || !body.every(isCell)) continue;
    const rows = [];
    for (let i = 0; i < body.length; i += k) rows.push(body.slice(i, i + k));
    const table = [
      '<SourceComparisonTable>',
      `  <Fragment slot="header">${heads.map((c) => `<th>${cellHtml(c.inner)}</th>`).join('')}</Fragment>`,
      ...rows.map((row) => `  <tr>${row.map((c) => `<td>${cellHtml(c.inner)}</td>`).join('')}</tr>`),
      '</SourceComparisonTable>'
    ].join('\n');
    src = src.slice(0, at) + table + src.slice(fig.end);
    re.lastIndex = at + table.length;
    count += 1;
  }
  return { src, count };
}

let changed = 0;
for (const file of walk('src/content/articles')) {
  const original = readFileSync(file, 'utf8');
  let src = original.replace(/\r\n/g, '\n');
  let converted = 0;
  ({ src, count: converted } = convertMatrices(src));
  const figRe = /<(div|section) class="hc-fig(?: hc-fig--[a-z0-9]+)?"[^>]*>/g;
  for (let mm = figRe.exec(src); mm; mm = figRe.exec(src)) {
    const at = mm.index;
    const openEnd = src.indexOf('>', at) + 1;
    // Find the matching close of the figure.
    const all = children(src, at, src.length);
    const fig = all[0];
    if (!fig || fig.start !== at) continue;
    const rows = children(src, fig.openEnd, src.lastIndexOf('</', fig.end - 1));
    if (rows.length < 3 || rows.some((r) => r.name !== 'div')) continue;
    const head = rows[0];
    if (/class=/.test(head.attrs)) continue; // a head row carries no class
    const cells = rows.map((r) => children(src, r.openEnd, r.end - '</div>'.length));
    const width = cells[0].length;
    if (width < 2 || width > 5) continue;
    if (cells.some((c) => c.length !== width || c.some((x) => x.name !== 'div' || !INLINE_ONLY(x.inner)))) continue;
    const label = /aria-label="([^"]*)"/.exec(src.slice(at, openEnd));
    const table = [
      '<SourceComparisonTable>',
      `  <Fragment slot="header">${cells[0].map((c) => `<th>${cellHtml(c.inner)}</th>`).join('')}</Fragment>`,
      ...cells.slice(1).map((row) => `  <tr>${row.map((c) => `<td>${cellHtml(c.inner)}</td>`).join('')}</tr>`),
      '</SourceComparisonTable>'
    ].join('\n');
    src = src.slice(0, at) + table + src.slice(fig.end);
    figRe.lastIndex = at + table.length;
    converted += 1;
    void label;
  }
  if (!converted) continue;
  if (!src.includes('import SourceComparisonTable')) {
    const lastImport = src.lastIndexOf('\nimport ');
    const eol = src.indexOf('\n', lastImport + 1);
    src = src.slice(0, eol + 1) + "import SourceComparisonTable from '../../../components/article/sources/SourceComparisonTable.astro';\n" + src.slice(eol + 1);
  }
  changed += 1;
  console.log(`${file}: ${converted} ledger(s) -> table`);
  if (WRITE) writeFileSync(file, src);
}
console.log(`${changed} file(s) ${WRITE ? 'written' : 'would change'}`);
