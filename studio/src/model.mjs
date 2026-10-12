import { registry, categories, validateProps, safeUrl } from './registry.mjs';

export const emptyDocument = () => ({ schema: 1, blocks: [], notes: [] });
export const prose = (text = '') => ({ type: 'doc', content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }] });
export const stableJson = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const literal = value => stableJson(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export const htmlText = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Backslash-escape only the punctuation MDX or GFM could read as syntax, so the
// public source stays readable and raw-body consumers (the site search index,
// reading time) see the words. Every Unicode code point is retained verbatim.
// `&` matters only where it would begin a character reference.
const escapeText = value => value
  .replace(/[\\`*_\[\]{}<>|~#]/g, c => `\\${c}`)
  .replace(/&(?=#|[A-Za-z][A-Za-z0-9]*;)/g, '\\&');
// GFM links bare URLs and emails after parsing, so escapes cannot stop it.
// Those runs are emitted as MDX string expressions, which it never scans.
const AUTOLINK = /(?:https?:\/\/|www\.)[^\s<]*|[A-Za-z0-9._+-]+@[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+/gi;
const mdText = value => {
  let out = '', last = 0;
  for (const match of value.matchAll(AUTOLINK)) {
    // Trailing sentence punctuation stays outside, as GFM itself would leave it.
    const run = match[0].replace(/[.,;:!?)\]'"]+$/, '');
    if (!run) continue;
    out += escapeText(value.slice(last, match.index)) + `{${literal(run)}}`;
    last = match.index + run.length;
  }
  return out + escapeText(value.slice(last));
};
// A line of inline output may begin with text that a block parser would read
// as a list item, quotation, rule or setext underline. Inline markup the
// serializer emits starts with `<` or `[^`, and text `<`, `>`, `[`, `#` and `*`
// are already escaped, so only these leading characters need a further escape.
const escapeLineStarts = value => value.split('\n').map(line => line
  .replace(/^(\s*)([-+=])/, '$1\\$2')
  .replace(/^(\s*\d+)([.)])/, '$1\\$2')).join('\n');
const noteId = id => typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id);
function walk(node, fn, depth = 0) {
  if (depth > 30 || !node || typeof node !== 'object') throw new Error('Invalid or excessively nested prose.');
  fn(node);
  if (node.content !== undefined && !Array.isArray(node.content)) throw new Error('Invalid prose children.');
  for (const child of node.content || []) walk(child, fn, depth + 1);
}
export function validateDocument(doc) {
  if (!doc || doc.schema !== 1 || !Array.isArray(doc.blocks) || !Array.isArray(doc.notes) || doc.blocks.length > 500 || doc.notes.length > 500) throw new Error('Invalid Studio document.');
  if (new TextEncoder().encode(JSON.stringify(doc)).byteLength > 750000) throw new Error('Studio document exceeds 750 KB.');
  const definitions = new Set(), canonicalDefinitions = new Set(), references = new Set();
  for (const note of doc.notes) {
    if (!noteId(note.id) || canonicalDefinitions.has(note.id.toLowerCase())) throw new Error('Footnote IDs must be valid and unique (including case-insensitive GFM labels).');
    definitions.add(note.id);
    canonicalDefinitions.add(note.id.toLowerCase());
  }
  function checkProse(content, inNote = false) {
    if (content?.type !== 'doc') throw new Error('Expected prose document.');
    walk(content, node => {
      if (!['doc', 'paragraph', 'heading', 'text', 'footnote', 'hardBreak', 'horizontalRule', 'blockquote', 'bulletList', 'orderedList', 'listItem'].includes(node.type)) throw new Error(`Unsupported prose node: ${node.type}`);
      if (node.type === 'text' && typeof node.text !== 'string') throw new Error('Invalid text.');
      if (node.type === 'heading' && ![2, 3, 4, 5, 6].includes(node.attrs?.level)) throw new Error('Use headings H2–H6.');
      if (node.type === 'orderedList' && node.attrs?.start !== undefined && (!Number.isSafeInteger(node.attrs.start) || node.attrs.start < 1)) throw new Error('Invalid list start.');
      if (node.type === 'footnote') {
        if (inNote || !noteId(node.attrs?.id)) throw new Error('Invalid or nested footnote reference.');
        references.add(node.attrs.id);
      }
      for (const mark of node.marks || []) {
        if (!['bold', 'italic', 'code', 'link', 'superscript', 'arabic'].includes(mark.type)) throw new Error('Unsupported text mark.');
        if (mark.type === 'link') safeUrl(mark.attrs?.href);
      }
    });
  }
  for (const block of doc.blocks) {
    if (block.kind === 'prose') checkProse(block.content);
    else if (block.kind === 'component') {
      validateProps(block.type, block.props);
      if (block.content) { if (!registry[block.type].children) throw new Error('Component does not accept prose children.'); checkProse(block.content); }
    } else if (block.kind === 'image') {
      safeUrl(block.src, true);
      if (typeof block.alt !== 'string' || !block.alt.trim() || typeof block.caption !== 'string') throw new Error('Images need alt text and caption.');
      if (block.variants !== undefined) {
        if (!Array.isArray(block.variants) || block.variants.length > 4) throw new Error('Invalid image variants.');
        for (const variant of block.variants) {
          safeUrl(variant.src,true);
          if (!Number.isSafeInteger(variant.width) || variant.width < 1 || variant.width > 1536) throw new Error('Invalid variant width.');
        }
      }
    } else throw new Error('Unknown block kind.');
  }
  for (const note of doc.notes) {
    checkProse(note.content, true);
    if (!plainText(note.content).trim()) throw new Error(`Empty footnote: ${note.id}`);
  }
  for (const id of references) if (!definitions.has(id)) throw new Error(`Missing footnote: ${id}`);
  for (const id of definitions) if (!references.has(id)) throw new Error(`Unreferenced footnote: ${id}`);
  return doc;
}
export function validateMetadata(meta) {
  if (!meta || typeof meta.title !== 'string' || !meta.title.trim() || typeof meta.description !== 'string' || !meta.description.trim()) throw new Error('Title and description are required.');
  if (!categories.includes(meta.category)) throw new Error('Unknown category.');
  if (typeof meta.date !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(meta.date) || Number.isNaN(Date.parse(meta.date))) throw new Error('Invalid date.');
  if (meta.updated && Number.isNaN(Date.parse(meta.updated))) throw new Error('Invalid updated date.');
  if (meta.tags !== undefined && (!Array.isArray(meta.tags) || meta.tags.some(t => typeof t !== 'string'))) throw new Error('Tags must be strings.');
  if (meta.thumbnail) { safeUrl(meta.thumbnail, true); if (!meta.heroAlt?.trim()) throw new Error('Thumbnail needs alt text.'); }
  if (meta.draft !== undefined && typeof meta.draft !== 'boolean') throw new Error('draft must be boolean.');
  return meta;
}
export function plainText(node) { return node.type === 'text' ? node.text : (node.content || []).map(plainText).join(''); }
function proseMdx(node, inHeading = false) {
  const children = () => (node.content || []).map(child => proseMdx(child, inHeading || node.type === 'heading')).join('');
  if (node.type === 'text') {
    let value = (node.marks || []).some(mark=>mark.type==='code') ? `<code>{${literal(node.text)}}</code>` : mdText(node.text);
    for (const mark of node.marks || []) {
      if (mark.type === 'bold') value = `<strong>${value}</strong>`;
      if (mark.type === 'italic') value = `<em>${value}</em>`;
      if (mark.type === 'link') value = `<a href={${literal(mark.attrs.href)}}>${value}</a>`;
      if (mark.type === 'superscript') value = `<sup>${value}</sup>`;
      if (mark.type === 'arabic') value = `<span lang="ar" dir="rtl">${value}</span>`;
    }
    return value;
  }
  if (node.type === 'footnote') return `[^${node.attrs.id}]`;
  // A line break inside an ATX heading would end the heading, so it stays inline.
  if (node.type === 'hardBreak') return inHeading ? '<br />' : '  \n';
  if (node.type === 'horizontalRule') return '---\n\n';
  if (node.type === 'paragraph') return `${escapeLineStarts(children())}\n\n`;
  if (node.type === 'heading') return `${'#'.repeat(node.attrs.level)} ${children()}\n\n`;
  if (node.type === 'blockquote') return `${children().trimEnd().split('\n').map(line => `> ${line}`).join('\n')}\n\n`;
  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return (node.content || []).map((item, i) => {
      const marker = node.type === 'orderedList' ? `${(node.attrs?.start || 1) + i}. ` : '- ';
      const lines = proseMdx(item).trimEnd().split('\n');
      return marker + lines[0] + (lines.length > 1 ? '\n' + lines.slice(1).map(line => ' '.repeat(marker.length) + line).join('\n') : '');
    }).join('\n') + '\n\n';
  }
  return children();
}
function componentMdx(block) {
  const spec = registry[block.type];
  const props = Object.entries(block.props).filter(([key]) => !['slot', 'strings', 'rows'].includes(spec.fields[key]));
  const attrs = props.sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ` ${key}={${literal(value)}}`).join('');
  let body = block.content ? proseMdx(block.content).trimEnd() : '';
  if (block.type === 'QuranPassage') body = ['translation', 'arabic'].filter(key => block.props[key]).map(key => `<div slot="${key}">{${literal(block.props[key])}}</div>`).join('\n');
  if (block.type === 'SourceComparisonTable') body = block.props.columns.map(c => `<th slot="header">{${literal(c)}}</th>`).join('\n') + '\n' + block.props.rows.map(row => `<tr>${row.map(c => `<td>{${literal(c)}}</td>`).join('')}</tr>`).join('\n');
  return body ? `<${block.type}${attrs}>\n\n${body}\n\n</${block.type}>` : `<${block.type}${attrs} />`;
}
export function serializeBody(doc, path) {
  validateDocument(doc);
  if (!/^src\/content\/articles\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.mdx$/.test(path)) throw new Error('Invalid structured article path.');
  const depth = path.split('/').length - 2;
  const imports = [...new Set(doc.blocks.filter(b => b.kind === 'component').map(b => b.type))].sort().map(type => `import ${type} from '${'../'.repeat(depth)}${registry[type].path}';`).join('\n');
  const blocks = doc.blocks.map(block => block.kind === 'prose' ? proseMdx(block.content).trimEnd() : block.kind === 'component' ? componentMdx(block) : `<figure><img src={${literal(block.src)}}${block.variants?.length ? ` srcset={${literal(block.variants.map(v=>`${v.src} ${v.width}w`).join(', '))}} sizes="(max-width: 720px) 100vw, 720px"` : ''} alt={${literal(block.alt)}} loading="lazy" /><figcaption>{${literal(block.caption)}}</figcaption></figure>`);
  const notes = doc.notes.map(note => {
    const lines = proseMdx(note.content).trimEnd().split('\n');
    return `[^${note.id}]: ${lines[0]}${lines.length > 1 ? '\n' + lines.slice(1).map(line => `    ${line}`).join('\n') : ''}`;
  });
  return [imports, ...blocks, ...notes].filter(Boolean).join('\n\n') + '\n';
}
export function serializeDocument(doc, meta, path) {
  validateMetadata(meta);
  const fields = ['title', 'description', 'date', 'updated', 'category', 'author', 'tags', 'thumbnail', 'heroAlt', 'draft'];
  const header = fields.filter(key => meta[key] !== undefined && meta[key] !== '').map(key => `${key}: ${stableJson(meta[key])}`).join('\n');
  return `---\n${header}\n---\n\n${serializeBody(doc, path)}`;
}

/** Safe presentation preview. This never compiles or executes author source. */
export function renderPreview(doc) {
  validateDocument(doc);
  const counts = new Map();
  function render(node) {
    let body = (node.content || []).map(render).join('');
    if (node.type === 'text') {
      body = htmlText(node.text);
      for (const mark of node.marks || []) {
        if (mark.type === 'link') body = `<a href="${htmlText(mark.attrs.href)}" rel="noreferrer">${body}</a>`;
        else { const tag = { bold: 'strong', italic: 'em', code: 'code', superscript: 'sup', arabic: 'span' }[mark.type]; body = `<${tag}${mark.type === 'arabic' ? ' lang="ar" dir="rtl"' : ''}>${body}</${tag}>`; }
      }
      return body;
    }
    if (node.type === 'footnote') {
      const id = node.attrs.id, occurrence = (counts.get(id) || 0) + 1;
      counts.set(id, occurrence);
      return `<sup><a id="ref-${id}-${occurrence}" href="#note-${id}" data-note="${id}">${htmlText(id)}</a></sup>`;
    }
    const tag = { paragraph: 'p', heading: `h${node.attrs?.level}`, blockquote: 'blockquote', bulletList: 'ul', orderedList: 'ol', listItem: 'li' }[node.type];
    if (tag) return `<${tag}>${body}</${tag}>`;
    if (node.type === 'horizontalRule') return '<hr />';
    if (node.type === 'hardBreak') return '<br />';
    return body;
  }
  function component(block) {
    const p = block.props, escaped = key => htmlText(p[key] || '');
    const body = block.content ? render(block.content) : '';
    if (block.type === 'SourceComparisonTable') return `<figure><table><caption>${escaped('caption')}</caption><thead><tr>${p.columns.map(c => `<th>${htmlText(c)}</th>`).join('')}</tr></thead><tbody>${p.rows.map(row => `<tr>${row.map(c => `<td>${htmlText(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></figure>`;
    if (block.type === 'Bibliography') return `<section class="hc-works"><h2>${escaped('title') || 'Bibliography'}</h2><ul>${p.entries.map(e => `<li>${htmlText(e.author)}, <cite>${htmlText(e.title)}</cite>, ${htmlText(e.details)}${e.year ? ` (${htmlText(e.year)})` : ''}.</li>`).join('')}</ul></section>`;
    if (block.type === 'Arabic') return `<div lang="ar" dir="rtl">${body}</div>`;
    if (block.type === 'QuranVerse') return `<figure class="hc-verse"><p>Quran ${escaped('verse')}</p><figcaption>Reference only. The site supplies the corpus wording after publication.</figcaption></figure>`;
    if (block.type === 'IsnadDiagram') return `<figure><h3>${escaped('ariaLabel')}</h3><ul>${p.nodes.map(n => `<li>${htmlText(n.label || n.id)}</li>`).join('')}</ul><p>${p.edges.map(e => `${htmlText(e.from)} → ${htmlText(e.to)}`).join('; ')}</p><figcaption>${escaped('caption')}</figcaption></figure>`;
    if (block.type === 'VariantTree') return `<figure><h3>${escaped('title')}</h3><p>${escaped('root')} → ${escaped('bottleneck')}</p>${p.branches.map(b => `<section><h4>${htmlText(b.name)}</h4><p>${htmlText(b.quote)}</p><p lang="ar" dir="rtl">${htmlText(b.arabic || '')}</p><cite>${htmlText(b.sources)}</cite></section>`).join('')}</figure>`;
    if (block.type === 'YouTubeEmbed') return `<p><a href="${escaped('url')}" rel="noreferrer">${escaped('title') || 'YouTube video'}</a></p>`;
    const cls = { HadithBlock: 'hc-report hc-report--leaf', QuranPassage: 'hc-verse', QuoteBlock: 'hc-quote', Source: 'hc-source', BibleVerse: 'hc-source', ClaimBox: 'hc-note', VerdictBox: 'hc-note', ContextNote: 'hc-note' }[block.type] || '';
    return `<figure class="${cls}"><h3>${escaped('title') || escaped('label')}</h3><div class="hc-report__text"><div class="hc-report__en"><p>${escaped('isnad')}</p><p>${escaped('translation')}</p>${body}</div><p class="hc-report__ar" lang="ar" dir="rtl">${escaped('arabic')}</p></div><figcaption>${escaped('source') || escaped('reference') || escaped('verse')}${p.author ? ` · ${escaped('author')}` : ''}</figcaption></figure>`;
  }
  const blocks = doc.blocks.map(b => b.kind === 'prose' ? render(b.content) : b.kind === 'component' ? component(b) : `<figure><img src="${htmlText(b.src)}"${b.variants?.length ? ` srcset="${htmlText(b.variants.map(v=>`${v.src} ${v.width}w`).join(', '))}" sizes="(max-width: 720px) 100vw, 720px"` : ''} alt="${htmlText(b.alt)}" /><figcaption>${htmlText(b.caption)}</figcaption></figure>`).join('');
  const notes = doc.notes.length ? `<section aria-label="Notes"><h2 id="footnote-label">Notes</h2><ol>${doc.notes.map(n => `<li id="note-${n.id}">${render(n.content)}${Array.from({ length: counts.get(n.id) || 0 }, (_, i) => `<a href="#ref-${n.id}-${i + 1}" aria-label="Back to reference ${i + 1}">↩</a>`).join(' ')}</li>`).join('')}</ol></section>` : '';
  return blocks + notes;
}
