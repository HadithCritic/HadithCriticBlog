import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'src');
const files = [];
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
  const file = join(directory, entry.name);
  entry.isDirectory() ? walk(file) : /\.(astro|css|ts|tsx|js|mjs|mdx)$/.test(file) && files.push(file);
});
walk(sourceRoot);

const failures = [];
const warnings = [];
const report = (list, file, line, message) => list.push(`${relative(root, file)}:${line} ${message}`);
// For each line, find the line where its innermost enclosing `{ ... }` block
// started (-1 if at the top level). Used to scope the overflow-masking check
// to its own CSS rule instead of the whole file.
function findBlockStartLines(lines) {
  const starts = new Array(lines.length).fill(-1);
  const stack = [];
  for (let i = 0; i < lines.length; i++) {
    for (const char of lines[i]) {
      if (char === '{') stack.push(i);
      else if (char === '}') stack.pop();
    }
    starts[i] = stack.length ? stack[stack.length - 1] : -1;
  }
  return starts;
}

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const blockStarts = findBlockStartLines(lines);
  const mainCount = (content.match(/<main\b/g) || []).length;
  if (mainCount > 1) report(failures, file, 1, 'nested or duplicate <main> landmarks');
  for (const tag of content.matchAll(/<a\b[\s\S]*?>/g)) {
    if (/target=["']_blank["']/.test(tag[0]) && !/rel=["'][^"']*noopener[^"']*noreferrer/.test(tag[0])) {
      const line = content.slice(0, tag.index).split(/\r?\n/).length;
      report(failures, file, line, 'target=_blank without noopener noreferrer');
    }
  }
  lines.forEach((line, index) => {
    const number = index + 1;
    if (/href=["']#["']/.test(line)) report(failures, file, number, 'placeholder href="#"');
    if (/<img\b[^>]*>/.test(line) && !/\balt=/.test(line)) report(failures, file, number, 'content image missing alt');
    if (/<(?:div|span)\b[^>]*(?:on:click|onclick)=/.test(line) && !/\b(role=|on:keydown|onkeydown=)/.test(line)) report(failures, file, number, 'non-semantic clickable element');
    if (/max-width:\s*100(?:d)?vw/.test(line) || /overflow-x:\s*hidden/.test(line)) {
      // A fixed-position overlay (modal, lightbox) legitimately spans the full
      // viewport; only flag this outside that context, where it usually means
      // a global wrapper is masking a horizontal-scroll bug.
      const blockStart = blockStarts[index];
      const blockLines = blockStart === -1 ? lines : lines.slice(blockStart, index + 1);
      const isFixedOverlay = blockLines.some((l) => /position:\s*fixed/.test(l));
      if (!isFixedOverlay) report(failures, file, number, 'global overflow masking rule');
    }
    if (/animation-iteration-count:\s*infinite|repeat:\s*-1|\b(?:elastic|bounce)\b/i.test(line)) report(warnings, file, number, 'discouraged motion pattern');
    if (/backdrop-filter/.test(line)) report(warnings, file, number, 'backdrop filter should remain exceptional');
    if (/border-radius:\s*(?:2[1-9]|[3-9]\d)px/.test(line)) report(warnings, file, number, 'large radius outside allowed components');
    if (/\b(unlock|supercharge|seamless|revolutionize)\b/i.test(line)) report(warnings, file, number, 'generic UI phrase');

    // Type floor: nothing renders below 12px (0.75rem). Enforced rather than
    // conventional because three separate passes reintroduced sub-12px
    // labels, most of them inside per-article MDX <style> blocks. `em` is
    // skipped: it compounds against a parent this check cannot resolve.
    for (const m of line.matchAll(/font-size:\s*(?:clamp\(\s*)?(\d*\.?\d+)(rem|px)\b/g)) {
      const size = m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
      if (size < 12) report(failures, file, number, `font-size ${m[1]}${m[2]} below the 12px floor`);
    }
    // The `font:` shorthand hides a size from the check above.
    for (const m of line.matchAll(/font:\s*(?:[\w-]+\s+)*?(\d*\.?\d+)(rem|px)\b/g)) {
      const size = m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
      if (size < 12) report(failures, file, number, `font shorthand ${m[1]}${m[2]} below the 12px floor`);
    }
  });

  // Role split between the two geometric sans faces. Glacial (--font-ui) is
  // apparatus only: uppercase, letterspaced, 12-13px. Used sentence-case at
  // reading sizes it is indistinguishable from Poppins and the page reads
  // flat. See DESIGN.md > Typography.
  for (const block of content.matchAll(/\{([^{}]*)\}/g)) {
    const body = block[1];
    if (!/font-family:\s*var\(--font-ui/.test(body)) continue;
    if (/text-transform:\s*uppercase/.test(body)) continue;
    const size = body.match(/font-size:\s*(?:clamp\(\s*)?(\d*\.?\d+)rem/);
    if (size && parseFloat(size[1]) >= 0.95) {
      const line = content.slice(0, block.index).split(/\r?\n/).length;
      report(warnings, file, line, `--font-ui at ${size[1]}rem without uppercase (apparatus face at reading size)`);
    }
  }
}
for (const warning of warnings) console.warn(`warning: ${warning}`);
for (const failure of failures) console.error(`error: ${failure}`);
if (failures.length) process.exit(1);
console.log(`Design audit passed (${files.length} source files checked).`);
