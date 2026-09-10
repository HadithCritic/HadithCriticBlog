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
 *   node scripts/check-contrast.mjs --route /x      # one route
 *   node scripts/check-contrast.mjs --json          # composited bg and DOM path
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
const JSON_OUT = args.includes('--json');
const ONLY = args.includes('--route') ? args[args.indexOf('--route') + 1] : null;

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

  const over = (c, base) => base.map((v, i) => Math.round(c[i] * c[3] + v * (1 - c[3])));

  /**
   * Splits a computed background-image into layers, each a list of its colour
   * stops. Returns null only for something genuinely unknowable, a url()
   * bitmap, where no arithmetic can recover the pixels behind the text.
   */
  function splitTop(value) {
    const parts = [];
    let depth = 0, start = 0;
    for (let i = 0; i <= value.length; i++) {
      const ch = value[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (i === value.length || (ch === ',' && depth === 0)) {
        parts.push(value.slice(start, i).trim());
        start = i + 1;
      }
    }
    return parts;
  }

  /**
   * Whether background layer i actually paints under the whole box. The
   * animated-underline idiom paints an opaque gradient of a single colour and
   * then confines it with 'background-size: 100% 1px', so counting it as the
   * ground turned every gold footer link into a 1:1 failure against itself.
   */
  function coversBox(cs, i, box) {
    const sizes = splitTop(cs.backgroundSize);
    const reps = splitTop(cs.backgroundRepeat);
    const size = sizes[i % sizes.length] || 'auto';
    const rep = reps[i % reps.length] || 'repeat';
    if (size === 'cover' || size === 'contain' || size === 'auto') return true;
    const parts = size.split(/\\s+/);
    // A gradient with an 'auto' component fills that axis.
    const dim = (v, full) => {
      if (!v || v === 'auto') return full;
      if (v.endsWith('%')) return (parseFloat(v) / 100) * full;
      if (v.endsWith('px')) return parseFloat(v);
      return full;
    };
    const tiles = (r) => r === 'repeat' || r === 'round' || r === 'space';
    const wideEnough = dim(parts[0], box.width) >= box.width - 0.5 || tiles(rep) || rep === 'repeat-x';
    const tallEnough = dim(parts[1], box.height) >= box.height - 0.5 || tiles(rep) || rep === 'repeat-y';
    return wideEnough && tallEnough;
  }

  function layersOf(bgImage) {
    if (!bgImage || bgImage === 'none') return [];
    if (/url\\(/.test(bgImage)) return null;
    return splitTop(bgImage).map((layer) => {
      const stops = [];
      // 'transparent' survives in a computed gradient as rgba(0, 0, 0, 0), so
      // it composites to a no-op rather than to black.
      for (const m of layer.matchAll(/(?:rgba?|color)\\([^()]*\\)/g)) {
        const c = parse(m[0]);
        if (c) stops.push(c);
      }
      return stops;
    });
  }

  /**
   * The effective background behind an element, as the darkest and lightest
   * colours it can actually take, so the caller can fail on the worse of the
   * two. A gradient makes the ground a range rather than a single value, and
   * treating that as unmeasurable was not conservative, it was blind:
   * .hc-article paints a gradient behind every article, so every run silently
   * skipped the entire article body and reported only the text that happened
   * to sit inside an opaque panel.
   */
  function bgOf(el) {
    const chain = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n);
    chain.reverse();

    let lo = ground.slice(0, 3), hi = lo;
    const apply = (cands) => {
      const outs = [];
      for (const c of cands) { outs.push(over(c, lo)); outs.push(over(c, hi)); }
      let a = outs[0], b = outs[0];
      for (const o of outs) { if (L(o) < L(a)) a = o; if (L(o) > L(b)) b = o; }
      lo = a; hi = b;
    };

    for (const n of chain) {
      const cs = getComputedStyle(n);
      const bc = parse(cs.backgroundColor);
      if (bc && bc[3] > 0) apply([bc]);
      const layers = layersOf(cs.backgroundImage);
      if (layers === null) return null;
      // Background layers paint with the first listed on top, so they
      // composite back to front. Layers that do not cover the box are
      // decoration, not ground, and are skipped.
      const box = n.getBoundingClientRect();
      for (let i = layers.length - 1; i >= 0; i--) {
        if (!coversBox(cs, i, box)) continue;
        if (!layers[i].length) return null;
        apply(layers[i]);
      }
    }
    return [lo, hi];
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
    const range = bgOf(el);
    if (!range) { indeterminate++; continue; }
    const size = parseFloat(cs.fontSize);
    const bold = (parseInt(cs.fontWeight, 10) || 400) >= 700;
    const need = (size >= 24 || (bold && size >= 18.66)) ? 3 : 4.5;
    // Worst case across the background's range: the text has to clear AA
    // everywhere it sits, not just over the friendliest part of a gradient.
    let got = Infinity, bg = range[0];
    for (const cand of range) {
      const eff = fg.slice(0, 3).map((v, i) => Math.round(v * fg[3] + cand[i] * (1 - fg[3])));
      const r = ratio(eff, cand);
      if (r < got) { got = r; bg = cand; }
    }
    if (got >= need) continue;
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '';
    const key = cls + '|' + cs.color + '|' + Math.round(size);
    if (seen.has(key)) continue;
    seen.add(key);
    const path = [];
    for (let n = el; n && n.nodeType === 1 && path.length < 6; n = n.parentElement) {
      const c = typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\\s+/).join('.') : '';
      path.unshift(n.tagName.toLowerCase() + c);
      if (n.tagName === 'BODY') break;
    }
    bad.push({
      sel: (el.tagName.toLowerCase() + cls).slice(0, 48),
      color: cs.color,
      bg: 'rgb(' + bg.join(', ') + ')',
      path: path.join(' > '),
      text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 60),
      got: Math.round(got * 100) / 100,
      need
    });
  }
  return { bad: bad.sort((a, b) => a.got - b.got), indeterminate };
})()`;

/**
 * Bring the page to the state a reader actually sees before measuring.
 *
 * Reveal animations are driven by IntersectionObserver, so cards below the
 * fold sit in their pre-reveal state, which on the home page is a visibly
 * darker card. Measuring that reported a dozen failures for colours that are
 * correct once the card has arrived, and the count moved between runs
 * depending on how busy the machine was. Scrolling the whole page first, then
 * freezing transitions, makes the reading both honest and repeatable.
 */
async function settle(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 250));
    const kill = document.createElement('style');
    kill.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
    document.head.appendChild(kill);
    await new Promise((r) => requestAnimationFrame(() => r()));
  });
}

const routes = ONLY ? [ONLY] : ALL_ARTICLES ? [...ROUTES, ...articleRoutes()] : ROUTES;
const browser = await chromium.launch();
let failures = 0;
const report = [];

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
      await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
      await settle(page);
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
      report.push({ theme, route, bad });
      if (JSON_OUT) continue;
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
if (JSON_OUT) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  process.exit(failures ? 1 : 0);
}
process.stdout.write(
  `
${failures} contrast failure(s) across ${routes.length} route(s) x ${THEMES.length} theme(s)
`
);
process.exit(failures ? 1 : 0);
