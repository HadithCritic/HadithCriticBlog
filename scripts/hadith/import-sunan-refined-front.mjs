#!/usr/bin/env node
/*
 * Import the supplied Sunan Ibn Mājah collection design as an editable page
 * fragment. The site provides its own header, footer, theme, and email signup.
 */
import fs from 'node:fs';
import path from 'node:path';

const [input] = process.argv.slice(2);
if (!input) throw new Error('Pass the refined Sunan Ibn Mājah HTML file.');

const slug = 'sunan-ibn-majah';
const scope = 'sunan-refined';
const site = /https?:\/\/(?:www\.)?hadithcriticblog\.com/g;

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

const bodyOf = rule => rule.slice(rule.indexOf('{') + 1, rule.lastIndexOf('}'));

function scopedCss(css) {
  return rules(css).map(rule => {
    if (!rule.includes('{')) return /^@import/i.test(rule) ? '' : rule;
    const head = rule.slice(0, rule.indexOf('{')).trim();
    if (/^@(?:media|supports|container|layer)/i.test(head)) {
      const inner = scopedCss(bodyOf(rule));
      return inner ? `${head}{${inner}}` : '';
    }
    if (head.startsWith('@')) return rule;
    const selectors = head.split(',').map(item => item.trim()).filter(Boolean).flatMap(selector => {
      if (/\.mj-site-|\.mj-footer|\.mj-theme/.test(selector)) return [];
      const themed = selector.match(/^(?::root|html)(\[data-theme=[^\]]+\])\s*(.*)$/);
      if (themed) return [`html${themed[1]} .${scope}${themed[2] ? ` ${themed[2]}` : ''}`];
      if (/^(?::root|html|body)$/.test(selector) || /^body(?:\[[^\]]+\])?$/.test(selector)) return [`.${scope}`];
      if (/^(?:\*|button|input|a|::selection)$/.test(selector)) return [`.${scope} ${selector}`];
      return [`.${scope} ${selector}`];
    });
    return selectors.length ? `${selectors.join(',')}{${bodyOf(rule)}}` : '';
  }).filter(Boolean).join('\n');
}

const document = fs.readFileSync(input, 'utf8');
const title = document.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
if (!title || !/<main\b/i.test(document)) throw new Error('The supplied file is not the expected refined collection page.');

const styles = [...document.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => scopedCss(match[1])).join('\n');
const bodyMatch = document.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) throw new Error('The supplied page has no body.');

let content = bodyMatch[1]
  .replace(/<header\b[^>]*class="mj-site-header"[\s\S]*?<\/header>/i, '')
  .replace(/<footer\b[^>]*class="mj-footer"[\s\S]*?<\/footer>/i, '')
  .replace(/<a\b[^>]*class="mj-skip"[^>]*>[\s\S]*?<\/a>/i, '')
  .replace(/<main\b[^>]*>/i, '')
  .replace(/<\/main>/i, '')
  .replace(site, '');

// Let BaseLayout own the document theme. Keep the page's filter and atlas
// interactions, removing only its now-absent standalone theme control.
content = content.replace(
  /\s*const root=document\.documentElement;\s*const theme=document\.getElementById\('mj-theme'\);\s*function updateTheme\(\)\{[\s\S]*?\}\s*theme\.addEventListener\([\s\S]*?updateTheme\(\);/,
  ''
);

const cta = content.match(/<section\b[^>]*class="[^"]*pf-cta[^"]*"[\s\S]*?<\/section>/i);
if (!cta) throw new Error('The refined page has no closing email section.');
const actions = cta[0].match(/<div class="pf-hero__actions">[\s\S]*?<\/div>/i);
if (!actions) throw new Error('The closing section has no continuation actions.');
content = content.replace(actions[0], `${actions[0]}\n<div class="mj-email-insert" aria-label="Email updates"><!-- SUNAN-SUBSCRIBE-FORM --></div>`);

const target = path.resolve('src/data/hadith/pages', slug, 'refined-front.html');
fs.mkdirSync(path.dirname(target), { recursive: true });
const output = [
  `<!-- Imported from ${path.basename(input)}. Edit this fragment directly; rerunning the importer replaces it. -->`,
  `<style>${styles}</style>`,
  `<div class="${scope}">${content.trim()}</div>`,
].join('\n');
fs.writeFileSync(target, `${output}\n`, 'utf8');
console.log(`${slug}: imported ${Math.round(output.length / 1024)} KB from ${path.basename(input)}; page header/footer removed and styles scoped.`);
