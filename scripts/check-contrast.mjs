/**
 * Contrast checker that measures what actually rendered.
 *
 * DESIGN.md requires WCAG AA against the *composited* background, not against
 * raw tokens, and that distinction is not academic here: most text on this site
 * sits on a semi-transparent panel over a gradient, so comparing a colour token
 * to a surface token gives the wrong answer in both directions. A static
 * grep-based pass over the stylesheets reported 113 failures, of which the
 * large majority were light text on a legitimately dark embed. This walks the
 * real DOM instead and composites the actual ancestor stack.
 *
 * Two things it gets right that a naive checker does not:
 *
 *   - `color(srgb r g b / a)`. Chromium returns modern colour syntax for
 *     `color-mix()`, and its components are 0-1 rather than 0-255. Parsing
 *     those as bytes turns a pale parchment panel into near-black and invents
 *     failures that are not there.
 *   - Alpha on the text itself, which has to be composited over the resolved
 *     background before the ratio means anything.
 *
 * Usage, against a running dev server:
 *
 *   npm run dev
 *   node scripts/check-contrast.mjs                 # both themes, key routes
 *   node scripts/check-contrast.mjs --theme light   # one theme
 *   node scripts/check-contrast.mjs --all-articles  # every article too
 *
 * Exit code is 1 when anything fails, so it can gate a build later. It is not
 * in `npm run validate` yet because the article bodies carry a known backlog:
 * see docs/hallmark-audit-after.md.
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321';
const args = process.argv.slice(2);
const themeArg = args.includes('--theme') ? args[args.indexOf('--theme') + 1] : null;
const THEMES = themeArg ? [themeArg] : ['dark', 'light'];
const ALL_ARTICLES = args.includes('--all-articles');

/** The routes that carry the design system, one of each page type. */
const ROUTES = [
  '/',
  '/hadith',
  '/hadith/collection/sahih-al-bukhari',
  '/hadith/5',
  '/narrators',
  '/narrators/484',
  '/narrators/compare?ids=484,3889',
  '/blogs',
  '/academia',
  '/resources',
  '/projects',
  '/contact'
];

function articleRoutes() {
  const root = 'src/content/articles';
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const cat of fs.readdirSync(root)) {
    const dir = path.join(root, cat);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.mdx')) out.push(`/blogs/${cat}/${f.replace(/\.mdx$/, '')}`);
    }
  }
  return out;
}

/** Runs in the page. Returns every text node whose contrast misses AA. */
const PROBE = `(() => {
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = r => 0.2126 * lin(r[0]) + 0.7152 * lin(r[1]) + 0.0722 * lin(r[2]);
  const ratio = (a, b) => { const l1 = L(a), l2 = L(b); const [h, o] = l1 > l2 ? [l1, l2] : [l2, l1]; return (h + 0.05) / (o + 0.05); };

  function parse(s) {
    if (!s || s === 'transparent' || s === 'none') return null;
    const nums = s.match(/[\\d.]+/g);
    if (!nums) return null;
    const p = nums.map(Number);
    // color(srgb 0..1 0..1 0..1 / a) - modern syntax, fractional components.
    if (s.startsWith('color(')) return [Math.round(p[0] * 255), Math.round(p[1] * 255), Math.round(p[2] * 255), p.length > 3 ? p[3] : 1];
    if (p.length < 3) return null;
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }

  const ground = parse(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255, 1];

  // Returns null when the stack contains a gradient or image: the effective
  // background is then a range of colours, and any single ratio would be a
  // guess. Those are counted separately rather than reported as failures. The
  // .hc-btn label sits on a gold gradient, and treating it as text on the page
  // ground invented a 1:1 failure for a button that is perfectly legible.
  function bgOf(el) {
    const stack = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && n !== document.body && n !== document.documentElement) return null;
      const c = parse(cs.backgroundColor);
      if (!c || c[3] <= 0) continue;
      stack.push([c.slice(0, 3), c[3]]);
      if (c[3] >= 0.999) break;
    }
    stack.push([ground.slice(0, 3), 1]);
    let out = stack[stack.length - 1][0];
    for (let i = stack.length - 2; i >= 0; i--) {
      const [c, a] = stack[i];
      out = out.map((v, j) => Math.round(c[j] * a + v * (1 - a)));
    }
    return out;
  }

  const bad = [];
  let indeterminate = 0;
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (!Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const bg = bgOf(el);
    if (!bg) { indeterminate++; continue; }
    const eff = fg.slice(0, 3).map((v, i) => Math.round(v * fg[3] + bg[i] * (1 - fg[3])));
    const size = parseFloat(cs.fontSize);
    const bold = (parseInt(cs.fontWeight, 10) || 400) >= 700;
    const need = (size >= 24 || (bold && size >= 18.66)) ? 3 : 4.5;
    const got = ratio(eff, bg);
    if (got >= need) continue;
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '';
    const key = cls + '|' + cs.color + '|' + Math.round(size);
    if (seen.has(key)) continue;
    seen.add(key);
    bad.push({ sel: (el.tagName.toLowerCase() + cls).slice(0, 48), color: cs.color, got: Math.round(got * 100) / 100, need });
  }
  return { bad: bad.sort((a, b) => a.got - b.got), indeterminate };
})()`;

const routes = ALL_ARTICLES ? [...ROUTES, ...articleRoutes()] : ROUTES;
const browser = await chromium.launch();
let failures = 0;

for (const theme of THEMES) {
  // The theme has to be in localStorage before the document runs, because
  // BaseLayout applies data-theme from it in an inline script before paint.
  // Setting the attribute after load measured whichever theme the previous
  // pass had left behind and reported every colour inverted, which invented a
  // 1.31:1 failure for a wordmark that actually sits at 16.14:1.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript((t) => {
    try { localStorage.setItem('theme', t); } catch {}
  }, theme);
  const page = await context.newPage();

  for (const route of routes) {
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch {
      process.stdout.write(`  skip (unreachable) ${route}
`);
      continue;
    }
    const applied = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (applied !== theme) {
      process.stdout.write(`  warn: ${route} rendered as ${applied}, expected ${theme}
`);
    }
    const { bad, indeterminate } = await page.evaluate(PROBE);
    if (bad.length) {
      failures += bad.length;
      process.stdout.write(`
${theme.padEnd(5)} ${route}  ${bad.length} failing (${indeterminate} on gradients, not measurable)
`);
      for (const b of bad.slice(0, 8)) {
        process.stdout.write(`    ${String(b.got).padStart(5)} (needs ${b.need})  ${b.sel.padEnd(42)} ${b.color}
`);
      }
      if (bad.length > 8) process.stdout.write(`    ... and ${bad.length - 8} more
`);
    }
  }
  await context.close();
}

await browser.close();
process.stdout.write(
  `
${failures} contrast failure(s) across ${routes.length} route(s) x ${THEMES.length} theme(s)
`
);
process.exit(failures ? 1 : 0);
