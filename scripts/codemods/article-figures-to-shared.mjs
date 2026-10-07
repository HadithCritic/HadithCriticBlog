// One-off codemod: move every article's hand-built figures onto the shared
// figure vocabulary in src/styles/article.css (.hc-fig and its parts), and
// delete the per-article <style> blocks that drew them.
//
//   node scripts/codemods/article-figures-to-shared.mjs [--write] [--report] [files...]
//
// Without --write it prints what it would change. Text is never touched: only
// `class` attributes are rewritten and <style> blocks removed. Each bespoke
// class is given a role from its name (cell, join, label, title, Arabic,
// quote, tags, nested grid, ornament); the outermost bespoke element of each
// block becomes an .hc-fig whose layout is read from its children and from the
// grid the deleted stylesheet gave it.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const REPORT = args.includes('--report');
const ROOT = 'src/content/articles';

const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') ? [p] : [];
});
const files = args.filter((a) => !a.startsWith('--'));
const targets = files.length ? files : walk(ROOT);

/* Classes the shared system already styles; carried through untouched. */
const KEEP = /^(hadith-block__arabic|hadith-block__translation|hc-mark(--[a-z]+)?|ar-inline|ar-block|hc-quran|variant-table|variant-table-wrap|b46-table-container|hc-fig.*|hc-source.*|hc-note.*|hc-table.*)$/;
const VOID = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'wbr', 'source']);

const base = (token) => token.replace(/^b\d+-/, '');
const part = (token) => {
  const b = base(token);
  const i = b.lastIndexOf('__');
  return i >= 0 ? b.slice(i + 2) : b;
};

const RULES = [
  ['ornament', /(seal|icon|Icon|^mark$|glyph|wheelCore|ornament|rule$|Rule$|flowLine)/],
  ['join', /(arrow|Arrow|connector|Bridge$|bridge$|Center$|center$|Gate$|gate$|^vs$|equals)/],
  ['ar', /(^arabic$|Arabic|^ar$|-ar$|_ar$|ling-arabic|arabicQuote)/],
  ['quote', /(quote-text|^quote$|Quote$|testimony$|punchline|irony-quote|debate-quote|^quote-content$|verse-text|claim-statement)/],
  ['tags', /(tags$|chips$|badges$|^stats$|markers$|callout-row|takeaway-strip)/],
  ['kicker', /(eyebrow|kicker|Kicker|label|Label|badge|^tag$|-tag$|date|period|^num$|-num$|number|Number|aspect|Head$|^head$|-head$|header$|Header$|^top$|-top$|^meta$|-meta$|^source$|report-source|quote-source|verse-ref|^author$|-author$|quote-author|Author$|narrator-id|count$|faction|^side$)/],
  ['title', /(title|Title|^name$|-name$|heading|question|faq-q|stat-value|value$|^term$)/],
  ['grid', /((grid|Grid|matrix|Matrix|board|Board|list|List|ledger|Ledger|Map|stack|Stack|lanes|container|cards|columns|split|pair|Flow|flow|steps|Steps|ladder|Ladder|Loop|Wheel|Visual|Diagram|diagram|Proof|chains|strip|comparison|reconstruction|breakdown|wrapper)$|^map$|-map$|^timeline$|Timeline$|^timeline-(list|grid|col)|chronology-panel|^two-col$|^stats-hero$|wording-header|overlap-header|flow-panel$)/],
  ['item', /(card|Card|item|Item|cell|Cell|col$|Col$|column|node|Node|step|Step|panel|Panel|box|Box|dossier|Side$|side$|block|region|stage|row|Row|entry|exchange|frame|Frame|case|Case|model|lane|group|half|pane|opening|brief|intro|hero|opener|note|Note|test$|proof-row|faq-item|^report$|^source-card|chrono-event|timeline-content|timeline-period|Answer$|fruit|criterion)/],
];

function roleOf(token) {
  const p = part(token);
  const b = base(token);
  for (const [role, re] of RULES) if (re.test(p)) return role;
  // A modifier on its own (`danger`, `left`, `n2`) or a wrapper (`copy`,
  // `content`, `body`) carries no setting of its own.
  if (/(copy|content|body|desc|text|sub|small|detail|explanation|answer|faq-a|caption)$/.test(p)) return 'note-or-plain';
  if (b !== p) return 'plain';
  return 'plain';
}

/* Tokenise the markup portion of an MDX file into tags, tracking nesting. */
function parse(src) {
  const tags = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"'{]|"[^"]*"|'[^']*'|\{[^}]*\})*)>/g;
  let m;
  while ((m = re.exec(src))) {
    const [whole, name, attrs] = m;
    const closing = whole.startsWith('</');
    const selfClosing = /\/\s*$/.test(attrs) || VOID.has(name.toLowerCase());
    const cls = /\bclass(Name)?="([^"]*)"/.exec(attrs);
    tags.push({
      name, closing, selfClosing, start: m.index, end: m.index + whole.length,
      classStart: cls ? m.index + whole.indexOf(cls[0]) : -1,
      classText: cls ? cls[0] : null,
      classes: cls ? cls[2].split(/\s+/).filter(Boolean) : []
    });
  }
  // Build a tree.
  const rootNode = { children: [], tag: null, parent: null };
  let cur = rootNode;
  for (const t of tags) {
    if (t.closing) {
      // pop to matching open
      let n = cur;
      while (n && n.tag && n.tag.name !== t.name) n = n.parent;
      if (n && n.tag) cur = n.parent;
      continue;
    }
    if (/^[A-Z]/.test(t.name)) {
      // Astro component: transparent container
    }
    const node = { tag: t, children: [], parent: cur };
    cur.children.push(node);
    if (!t.selfClosing) cur = node;
  }
  return rootNode;
}

const isBespoke = (c) => !KEEP.test(c) && c !== 'hc-plate' && c !== 'hc-panel';

function gridHint(styles, token) {
  // Find `.token { ... grid-template-columns: ... }` in the deleted CSS.
  const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\.${esc}\\s*(?:,[^{]*)?\\{([^}]*)\\}`, 'g');
  let m;
  let cols = 0;
  while ((m = re.exec(styles))) {
    const g = /grid-template-columns:\s*([^;]+);?/.exec(m[1]);
    if (!g) continue;
    const v = g[1].trim();
    const rep = /^repeat\((\d+),/.exec(v);
    if (rep) cols = Number(rep[1]);
    else if (!/auto-(fit|fill)/.test(v)) cols = v.split(/\s+(?![^(]*\))/).length;
  }
  return cols;
}

function convertFile(file) {
  let src = readFileSync(file, 'utf8');
  const styles = [...src.matchAll(/<style>\{`([\s\S]*?)`\}<\/style>|<style>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? m[2]).join('\n');
  const tree = parse(src);
  const edits = []; // {start, end, text}
  const log = [];

  const roleFor = (node) => {
    const bes = node.tag.classes.filter(isBespoke);
    if (!bes.length) return null;
    let roles = bes.map(roleOf);
    // A head-row modifier (`ledger-row--head`) marks the row of column labels;
    // it stays unclassed so the table pass can recognise it.
    if (bes.slice(1).some((t) => /head$/i.test(t)) && node.children.filter((k) => k.tag).length >= 2) return { role: 'plain', token: bes[0], all: bes };
    // The base class names the part; a modifier after it (`node source`,
    // `card danger`) only refines it. A modifier may still mark Arabic,
    // an ornament or a join, which change how the text itself is set.
    if (!['plain', 'note-or-plain'].includes(roles[0]) && !roles.slice(1).some((r) => ['ar', 'ornament', 'join'].includes(r))) roles = [roles[0]];
    // Prefer the most specific role found among the tokens.
    for (const r of ['ornament', 'join', 'ar', 'quote', 'tags', 'kicker', 'title', 'grid', 'item', 'note-or-plain', 'plain']) {
      if (!roles.includes(r)) continue;
      // A "head" that holds headings and paragraphs is a header block, not
      // a label: leave it unstyled and let its children take their parts.
      const blockKids = node.children.some((k) => k.tag && /^(h[1-6]|p|div|ul|ol|blockquote|section|article|figure)$/.test(k.tag.name));
      if ((r === 'kicker' || r === 'title') && blockKids) return { role: 'plain', token: bes[roles.indexOf(r)], all: bes };
      // A container of nothing but short spans is a run of terms, whatever
      // its name said (`sihr-opening__ledger`, `map__tags`).
      const elKids = node.children.filter((k) => k.tag);
      if (!['ar', 'quote', 'ornament', 'join'].includes(r) && node.tag.name !== 'span' && elKids.length >= 2
        && elKids.every((k) => k.tag.name === 'span' && !k.children.some((g) => g.tag && /^(div|p|h[1-6])$/.test(g.tag.name)))) {
        const outside = src.slice(node.tag.end, findClose(node)).replace(/<span\b[\s\S]*?<\/span>/g, '').trim();
        if (!outside) return { role: 'tags', token: bes[roles.indexOf(r)], all: bes };
      }
      return { role: r, token: bes[roles.indexOf(r)], all: bes };
    }
    return null;
  };

  /* Some figures were styled only through descendant selectors
     (`.b26-scale article span`), so their parts carry no class. Infer the
     part from structure instead: repeated unclassed blocks are cells, a run
     of bare spans is a tag list, a short leading span is a cell's label. */
  const BLOCK = /^(article|div|section|figure|aside|details|blockquote)$/;
  const innerText = (node) => src.slice(node.tag.end, findClose(node)).replace(/<[^>]+>/g, '').trim();
  const structuralRole = (node) => {
    const t = node.tag;
    if (!t || /^[A-Z]/.test(t.name) || t.classes.length || t.selfClosing) return null;
    const parent = node.parent;
    if (!parent || !parent.tag) return null;
    const sibs = parent.children.filter((k) => k.tag);
    const kids = node.children.filter((k) => k.tag);
    if (BLOCK.test(t.name) && sibs.filter((k) => k.tag.name === t.name && !k.tag.classes.length).length >= 2) return 'item';
    if ((t.name === 'div' || t.name === 'p') && kids.length >= 2 && kids.every((k) => k.tag.name === 'span' && !k.tag.classes.length)) {
      const outside = src.slice(t.end, findClose(node)).replace(/<span\b[\s\S]*?<\/span>/g, '').trim();
      if (!outside) return 'tags';
    }
    if (t.name === 'span' && BLOCK.test(parent.tag.name) && sibs[0] === node && sibs[1] && /^(h[2-6]|p|div|ul|ol|blockquote)$/.test(sibs[1].tag.name) && !kids.length && innerText(node).length <= 40) return 'kicker';
    return null;
  };
  const hasStructure = (node) => node.children.some((k) => k.tag && structuralRole(k) === 'item');

  const setClass = (node, newClasses) => {
    const t = node.tag;
    if (t.classStart < 0) {
      if (!newClasses.length) return;
      const at = t.start + 1 + t.name.length;
      edits.push({ start: at, end: at, text: ` class="${newClasses.join(' ')}"` });
      log.push(`${t.name}(bare) -> ${newClasses.join(' ')}`);
      return;
    }
    const kept = t.classes.filter((c) => !isBespoke(c) && c !== 'hc-plate' && c !== 'hc-panel');
    const finalList = [...new Set([...newClasses, ...kept])];
    const attr = finalList.length ? `class="${finalList.join(' ')}"` : '';
    // Remove the attribute and the space before it when emptied.
    let start = t.classStart;
    let end = t.classStart + t.classText.length;
    if (!attr && src[start - 1] === ' ') start -= 1;
    edits.push({ start, end, text: attr });
    log.push(`${t.name}.${t.classes.join('.')} -> ${finalList.join(' ') || '(none)'}`);
  };

  const layoutFor = (node, info) => {
    const kids = node.children.filter((k) => k.tag);
    const kidRoles = kids.map((k) => roleFor(k)?.role ?? structuralRole(k) ?? (/^h[2-6]$/.test(k.tag.name) ? 'title' : 'plain'));
    const name = (info.all ?? []).map(base).join(' ');
    // A sequence of bare terms (Dispute, Faction, Doctrine) reads as one line.
    if (kidRoles.includes('join') && kids.every((k, i) => kidRoles[i] !== 'item' || (innerText(k).length <= 36 && !k.children.some((g) => g.tag)))) return 'hc-fig--chain';
    if (kidRoles.includes('join')) return 'hc-fig--flow';
    if ((kidRoles.includes('quote') || kidRoles.includes('ar')) && !kidRoles.includes('item') && !kidRoles.includes('grid')) return 'hc-fig--extract';
    if (/(brief|opening|intro|hero|opener|cover|wahi-hero)/.test(name) && !/(card|grid)/.test(name)) return 'hc-fig--lead';
    const items = kidRoles.filter((r) => r === 'item' || r === 'grid').length;
    const heads = kids.filter((k, i) => kidRoles[i] === 'kicker' && k.tag.name !== 'span' && k.tag.name !== 'p').length;
    const hint = (info.all ?? []).map((t) => gridHint(styles, t)).find((n) => n > 0) ?? 0;
    if (/(ledger|timeline|faq|rows|chrono|moon-ledger|source-ledger|route-ledger)/i.test(name) && items >= 2) return 'hc-fig--rows';
    // Columns only suit short cells. In a 41rem measure, cells that run to
    // paragraphs read better stacked, and middling ones two across.
    const cellText = kids.filter((_, i) => kidRoles[i] === 'item' || kidRoles[i] === 'grid').map((k) => innerText(k).length);
    const longest = cellText.length ? Math.max(...cellText) : 0;
    const mean = cellText.length ? cellText.reduce((a, b) => a + b, 0) / cellText.length : 0;
    // Column heads fix the column count: a matrix reads across its rows.
    if (heads >= 2 && heads <= 4) return `hc-fig--c${heads}`;
    if (items >= 2 && (mean > 420 || longest > 700)) return null;
    if (items >= 2 && (mean > 200 || longest > 380)) return 'hc-fig--c2';
    if (hint >= 2 && hint <= 4 && (items >= 2 || heads >= 2)) return `hc-fig--c${hint}`;
    if (items >= 2) return 'hc-fig--cols';
    return null;
  };

  const visit = (node, inFig) => {
    for (const child of node.children) {
      if (!child.tag) continue;
      let info = roleFor(child);
      if (!info && inFig) {
        const inferred = structuralRole(child);
        if (inferred) info = { role: inferred, token: '', all: [] };
      }
      if (!info) {
        // An Astro component or plain element: descend without changing.
        visit(child, inFig);
        continue;
      }
      let classes = [];
      let childInFig = inFig;
      if (child.tag.classes.length && !child.tag.selfClosing && child.children.length === 0) {
        const close = findClose(child);
        if (!src.slice(child.tag.end, close).trim()) {
          // An empty element that only drew a line or a shape: remove it.
          const closeEnd = src.indexOf('>', close) + 1;
          let start = child.tag.start;
          while (start > 0 && (src.charCodeAt(start - 1) === 32 || src.charCodeAt(start - 1) === 9)) start -= 1;
          let end = closeEnd;
          if (src.charCodeAt(end) === 13) end += 1;
          if (src.charCodeAt(end) === 10) end += 1;
          edits.push({ start, end, text: '' });
          log.push(`${child.tag.name}.${child.tag.classes.join('.')} -> removed (empty)`);
          continue;
        }
      }
      if (!inFig) {
        // Outermost bespoke element: the figure.
        if (['kicker', 'title', 'ar', 'quote', 'note-or-plain', 'plain', 'tags'].includes(info.role) && !hasBespokeDescendant(child) && !hasStructure(child)) {
          // A lone styled element outside any figure (an inline Arabic run,
          // a styled paragraph): keep only its text setting.
          classes = info.role === 'ar' ? ['hc-fig__ar'] : info.role === 'quote' ? ['hc-fig__quote'] : [];
        } else {
          const layout = layoutFor(child, info);
          classes = ['hc-fig', ...(layout ? [layout] : [])];
          childInFig = true;
        }
      } else {
        switch (info.role) {
          case 'ornament': classes = ['hc-fig__ornament']; break;
          case 'join': {
            const text = src.slice(child.tag.end, findClose(child)).replace(/<[^>]+>/g, '').trim();
            classes = ['hc-fig__join', ...(/^[→←↓↑⟶⟵⇒⇐➜➔>»→\s]+$/u.test(text) ? ['hc-fig__join--arrow'] : [])];
            break;
          }
          case 'ar': classes = ['hc-fig__ar']; break;
          case 'quote': classes = ['hc-fig__quote']; break;
          case 'tags': classes = ['hc-fig__tags']; break;
          case 'kicker': {
            // A head cell directly inside a grid is a cell that is a label.
            const parentLayout = child.parent?.layout;
            classes = parentLayout && /c\d|cols/.test(parentLayout) ? ['hc-fig__item', 'hc-fig__kicker'] : ['hc-fig__kicker'];
            break;
          }
          case 'title': classes = /^h[2-6]$/.test(child.tag.name) ? [] : ['hc-fig__title']; break;
          case 'grid': {
            const layout = layoutFor(child, info);
            classes = ['hc-fig', ...(layout ? [layout] : [])];
            break;
          }
          case 'item': {
            const p = child.parent;
            const parentIsGrid = p?.layout && p.layout !== 'hc-fig--lead';
            if (parentIsGrid) classes = ['hc-fig__item'];
            else {
              const layout = layoutFor(child, info);
              classes = layout ? ['hc-fig', layout] : ['hc-fig__item'];
            }
            break;
          }
          case 'note-or-plain': classes = /(desc|small|sub|caption|note)$/.test(part(info.token)) ? ['hc-fig__note'] : []; break;
          default: classes = [];
        }
      }
      child.layout = classes.find((c) => c.startsWith('hc-fig--')) ?? (classes.includes('hc-fig') ? 'stack' : null);
      setClass(child, classes);
      visit(child, childInFig);
    }
  };

  function hasBespokeDescendant(node) {
    return node.children.some((k) => k.tag && (k.tag.classes.some(isBespoke) || hasBespokeDescendant(k)));
  }

  function findClose(node) {
    // End offset of the element's content: start of its closing tag.
    const re = new RegExp(`</?${node.tag.name}\\b[^>]*>`, 'g');
    re.lastIndex = node.tag.end;
    let depth = 1;
    let m;
    while ((m = re.exec(src))) {
      if (m[0].startsWith('</')) depth -= 1;
      else if (!m[0].endsWith('/>')) depth += 1;
      if (depth === 0) return m.index;
    }
    return node.tag.end;
  }

  visit(tree, false);

  // Apply class edits back to front, then drop the style blocks.
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) src = src.slice(0, e.start) + e.text + src.slice(e.end);
  const before = src;
  src = src.replace(/\r?\n?<style>\{`[\s\S]*?`\}<\/style>\r?\n?/g, '\n').replace(/\r?\n?<style>[\s\S]*?<\/style>\r?\n?/g, '\n');
  const strippedStyle = before !== src;
  return { src, log, strippedStyle };
}

let changed = 0;
for (const file of targets) {
  const original = readFileSync(file, 'utf8');
  const { src, log, strippedStyle } = convertFile(file);
  if (src === original) continue;
  changed += 1;
  console.log(`\n# ${file}  (${log.length} class edits${strippedStyle ? ', style removed' : ''})`);
  if (REPORT) for (const l of log) console.log('  ' + l);
  if (WRITE) writeFileSync(file, src);
}
console.log(`\n${changed} file(s) ${WRITE ? 'written' : 'would change'}`);
