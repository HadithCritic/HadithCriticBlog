#!/usr/bin/env node
/*
 * Imports the redesigned single-page readers into src/data/hadith/pages/<slug>/reader.html.
 *
 * Each redesign arrives as a standalone HTML document with its own copy of a site header. The site serves it
 * inside BaseLayout, so this step keeps the reader exactly as designed and removes only what the layout
 * already provides or what would leak out of the reader:
 *
 *   - the document's own header and navigation (the site header replaces it)
 *   - rules that style html, body or the removed header
 *   - absolute links to the live site, which become site-relative
 *   - a nested <main>, since the layout owns the page's <main>
 *   - the reader's private theme key: its light/dark button now reads and writes the site's `theme` key
 *
 * A reader whose stylesheet is not written under one wrapper class (Faḍāʾil Makka) is wrapped in one and its
 * selectors are prefixed with it, so nothing in it can restyle the site header or footer.
 *
 * Usage: node scripts/hadith/import-reader-renovations.mjs "<folder of redesigned html>" [slug ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { RENOVATED } from './lib/renovated-readers.mjs';

const [sourceDir, ...only] = process.argv.slice(2);
if (!sourceDir) throw new Error('Pass the folder that holds the redesigned HTML files.');

const RENOVATIONS = [
  { slug: 'fada-il-makka', file: 'Fadail_Makka', scope: 'fm-reader', count: 7, units: { count: 7, noun: 'section' } },
  { slug: 'juz-sufyan-ibn-uyayna', file: 'Juz_Sufyan_ibn_Uyayna', count: 50, units: { count: 1, noun: 'section' } },
  { slug: 'kitab-al-hajj-al-majishun', file: 'Kitab_al_Hajj_al_Majishun', count: 18, units: { count: 1, noun: 'section' } },
  { slug: 'kitab-al-qadar-ibn-wahb', file: 'Kitab_al_Qadar_Ibn_Wahb', count: 51, units: { count: 2, noun: 'part' } },
  { slug: 'ahadith-muntakhaba-maghazi-musa-ibn-uqba', file: 'Maghazi_Musa_ibn_Uqba', count: 20, units: { count: 9, noun: 'part' } },
  { slug: 'majlis-fawaid-al-layth-ibn-sad', file: 'Majlis_Fawaid_al_Layth', count: 7, units: { count: 1, noun: 'section' } },
  { slug: 'nuskhat-waki-an-al-amash', file: 'Nuskhat_Waki_an_al_Amash', count: 48, units: { count: 2, noun: 'section' } },
  { slug: 'nuskhat-al-zubayr-ibn-adi', file: 'Nuskhat_al_Zubayr_ibn_Adi', count: 79, units: { count: 1, noun: 'section' } },
  { slug: 'ashara-ahadith-al-layth-ibn-sad', file: 'Ten_Selected_Hadiths_al_Layth', count: 10, units: { count: 1, noun: 'section' } },
].filter(item => RENOVATED.has(item.slug));

const SITE = /https?:\/\/(?:www\.)?hadithcriticblog\.com/g;
const ROUTES = [[/^\/tafsir\/?$/, '/projects/tafsir/'], [/^\/tarikh\/?$/, '/projects/tarikh/']];

/** Splits a stylesheet into its top-level rules, keeping at-rule blocks whole. */
function rules(css) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) { out.push(css.slice(start, i + 1)); start = i + 1; }
    } else if (css[i] === ';' && depth === 0) { out.push(css.slice(start, i + 1)); start = i + 1; }
  }
  if (css.slice(start).trim()) out.push(css.slice(start));
  return out.map(rule => rule.trim()).filter(Boolean);
}

const selectorsOf = rule => rule.slice(0, rule.indexOf('{')).replace(/\/\*[\s\S]*?\*\//g, '').split(',').map(item => item.trim()).filter(Boolean);
const bodyOf = rule => rule.slice(rule.indexOf('{') + 1, rule.lastIndexOf('}'));
const isPageLevel = selector => /^(?:html|body|:root)(?:\[data-theme=["']?(?:light|dark)["']?\])?$/.test(selector) || /^(?:button|input|a|\*(?:::?(?:before|after))?)$/.test(selector);
const isHeader = selector => /\.ly-site-|\.topbar|\.topinner|\.topnav/.test(selector) || /^\.brand\b/.test(selector);

/** Rewrites one stylesheet. With `scope`, every selector is confined to that wrapper class. */
function rewrite(css, scope, leaks) {
  return rules(css).map(rule => {
    if (!rule.includes('{')) return /^@import/i.test(rule) ? '' : rule;
    const head = rule.slice(0, rule.indexOf('{')).trim();
    if (/^@(?:media|supports|container|layer)/i.test(head)) {
      const inner = rewrite(bodyOf(rule), scope, leaks);
      return inner ? `${head}{${inner}}` : '';
    }
    if (head.startsWith('@')) return rule;
    const kept = selectorsOf(rule).filter(selector => !isHeader(selector)).map(selector => {
      if (!scope) {
        if (isPageLevel(selector)) return null;
        if (!/\.(?:sf|ly|mj|mu|hc)-/.test(selector)) leaks.add(selector);
        return selector;
      }
      const theme = selector.match(/^html(\[data-theme=[^\]]+\])\s*(.*)$/);
      if (theme) return `${theme[1]} .${scope}${theme[2] ? ` ${theme[2]}` : ''}`;
      if (/^(?::root|body|html)$/.test(selector)) return `.${scope}`;
      const body = selector.match(/^body(\[[^\]]+\])\s*(.*)$/);
      if (body) return `body${body[1]} .${scope}${body[2] ? ` ${body[2]}` : ''}`;
      return `.${scope} ${selector}`;
    }).filter(Boolean);
    return kept.length ? `${kept.join(',')}{${bodyOf(rule)}}` : '';
  }).filter(Boolean).join('\n');
}

function relink(html) {
  return html.replace(/href="([^"]*)"/g, (whole, href) => {
    if (!SITE.test(href)) { SITE.lastIndex = 0; return whole; }
    SITE.lastIndex = 0;
    let route = href.replace(SITE, '') || '/';
    for (const [from, to] of ROUTES) if (from.test(route)) route = to;
    return `href="${route}"`;
  });
}

function convert({ slug, file, scope, count, units }) {
  const name = fs.readdirSync(sourceDir).find(item => item.startsWith(file) && item.endsWith('.html'));
  if (!name) throw new Error(`No redesigned file starts with ${file}`);
  const document = fs.readFileSync(path.join(sourceDir, name), 'utf8');
  const title = document.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();
  const description = document.match(/<meta\b[^>]*name="description"[^>]*>/i)?.[0].match(/content="([^"]*)"/)?.[1]
    ?? document.match(/<meta\b[^>]*content="([^"]*)"[^>]*name="description"/i)?.[1];
  const bodyTag = document.match(/<body\b([^>]*)>/i);
  const body = document.slice(bodyTag.index + bodyTag[0].length, document.search(/<\/body>/i));
  if (!title || !description || !body) throw new Error(`${slug}: the redesigned document is incomplete.`);

  const leaks = new Set();
  const css = [...document.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => rewrite(match[1], scope, leaks)).join('\n');
  const headers = body.match(/<header\b[^>]*class="(?:ly-site-header|topbar)"[\s\S]*?<\/header>/gi) ?? [];
  if (headers.length !== 1) throw new Error(`${slug}: expected one embedded site header, found ${headers.length}.`);
  let content = relink(body.replace(headers[0], ''))
    .replace(/<main\b/gi, '<div').replace(/<\/main>/gi, '</div>')
    .replace(/(['"])hc-(?:ly|mj|fm)-theme\1/g, "'theme'");
  // Attributes the document set on <body> move to the page body before the reader's own script runs.
  const bodyData = [...bodyTag[1].matchAll(/data-([\w-]+)="([^"]*)"/g)].map(([, key, value]) => `document.body.setAttribute('data-${key}',${JSON.stringify(value)});`).join('');
  if (scope) content = `<div class="${scope}">${content}</div>`;
  const fragment = [
    `<!-- Imported by scripts/hadith/import-reader-renovations.mjs from "${name}". Edit the text here; rerun the script only to take a new design. -->`,
    `<style>\n${css}\n</style>`,
    bodyData ? `<script>${bodyData}</script>` : '',
    content.trim(),
  ].filter(Boolean).join('\n');

  const target = path.resolve('src/data/hadith/pages', slug);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'reader.html'), `${fragment}\n`, 'utf8');
  // The count on the cards is the one the reader states about itself.
  const stated = Number(content.match(/sf-summary__num">(\d+)</)?.[1] ?? count);
  if (stated !== count) throw new Error(`${slug}: the reader states ${stated} entries, the card registry ${count}.`);
  fs.writeFileSync(path.join(target, 'reader-meta.json'), `${JSON.stringify({ count, units, title: title.replace(/\s*[·|]\s*Reader\s*\|\s*HadithCritic$/i, '').replace(/\s*\|\s*HadithCritic$/i, ''), description }, null, 2)}\n`, 'utf8');
  const remaining = [...content.matchAll(/href="(https?:[^"]*)"/g)].map(match => match[1]).filter(href => !/fonts\.(?:googleapis|gstatic)\.com/.test(href));
  console.log(`${slug}: ${(fragment.length / 1024).toFixed(0)} KB, header removed${leaks.size ? `, unscoped selectors: ${[...leaks].slice(0, 12).join(' | ')}` : ''}${remaining.length ? `, external links: ${[...new Set(remaining)].join(' ')}` : ''}`);
}

for (const item of RENOVATIONS.filter(entry => !only.length || only.includes(entry.slug))) convert(item);
