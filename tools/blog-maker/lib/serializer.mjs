import YAML from 'yaml';

export const GENERIC_THUMB = '/images/blog_thumbnails/tn.generic.png';

export const COMPONENT_IMPORTS = {
  HadithBlock: "import HadithBlock from '../../components/article/HadithBlock.astro';",
  ClaimBox: "import ClaimBox from '../../components/article/ClaimBox.astro';",
  ContextNote: "import ContextNote from '../../components/article/ContextNote.astro';",
  VerdictBox: "import VerdictBox from '../../components/article/VerdictBox.astro';",
  QuranVerse: "import QuranVerse from '../../components/article/QuranVerse.astro';",
};

const IMPORT_ORDER = ['HadithBlock', 'ClaimBox', 'ContextNote', 'VerdictBox', 'QuranVerse'];

export function emptyDoc() {
  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 90);
}

export function normalizeSlug(value, fallback = 'untitled-article') {
  return slugify(value) || fallback;
}

export function validateDraft(draft) {
  const errors = [];
  const meta = draft?.meta ?? {};
  const slug = normalizeSlug(meta.slug || meta.title);

  if (!meta.title?.trim()) errors.push('Title is required.');
  if (!meta.description?.trim()) errors.push('Preview text is required.');
  if (!meta.category?.trim()) errors.push('Category is required.');
  if (!meta.date || Number.isNaN(new Date(meta.date).valueOf())) errors.push('Valid publish date is required.');
  if (!slug) errors.push('Slug is required.');
  if (!hasMeaningfulBody(draft?.content)) errors.push('Article body is empty.');

  return { ok: errors.length === 0, errors, slug };
}

export function serializeDraftToMdx(draft, options = {}) {
  const usedComponents = new Set();
  const meta = draft.meta ?? {};
  const slug = normalizeSlug(meta.slug || meta.title);
  const thumbnail = options.thumbnailResolver
    ? options.thumbnailResolver(meta.thumbnail || GENERIC_THUMB)
    : meta.thumbnail || GENERIC_THUMB;

  const frontmatter = {
    title: meta.title?.trim() ?? '',
    description: meta.description?.trim() ?? '',
    date: toIsoDate(meta.date),
    category: meta.category?.trim() ?? 'Blog',
    tags: normalizeTags(meta.tags),
    thumbnail,
  };

  if (meta.author?.trim()) frontmatter.author = meta.author.trim();
  if (meta.heroAlt?.trim()) frontmatter.heroAlt = meta.heroAlt.trim();
  if (meta.readingTime?.trim()) frontmatter.readingTime = meta.readingTime.trim();
  if (options.preview) frontmatter.preview = true;
  if (options.draft) frontmatter.draft = true;

  const body = renderBlocks(draft.content?.content ?? [], {
    usedComponents,
    assetResolver: options.assetResolver,
  }).trim();

  const imports = IMPORT_ORDER
    .filter((name) => usedComponents.has(name))
    .map((name) => COMPONENT_IMPORTS[name]);

  const parts = [
    '---',
    YAML.stringify(frontmatter, { lineWidth: 0 }).trimEnd(),
    '---',
    '',
  ];

  if (imports.length) {
    parts.push(...imports, '');
  }

  parts.push(body, '');

  return {
    slug,
    mdx: parts.join('\n'),
    usedComponents: [...usedComponents],
  };
}

export function hasMeaningfulBody(doc) {
  let found = false;

  walkNode(doc, (node) => {
    if (found) return;
    if (node.type === 'text' && node.text?.trim()) found = true;
    if (['image', 'hadithBlock', 'claimBox', 'contextNote', 'verdictBox', 'quranVerse'].includes(node.type)) {
      found = true;
    }
  });

  return found;
}

function walkNode(node, visitor) {
  if (!node) return;
  visitor(node);
  for (const child of node.content ?? []) walkNode(child, visitor);
}

function toIsoDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.valueOf()) ? new Date().toISOString() : date.toISOString();
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  return String(tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function renderBlocks(nodes, context) {
  return nodes
    .map((node) => renderBlock(node, context))
    .filter((part) => part !== null && part !== undefined)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n');
}

function renderBlock(node, context) {
  switch (node.type) {
    case 'paragraph':
      return renderInline(node.content ?? [], context).trim();
    case 'heading':
      return `${'#'.repeat(clampHeading(node.attrs?.level))} ${renderInline(node.content ?? [], context).trim()}`;
    case 'bulletList':
      return renderList(node, context, false);
    case 'orderedList':
      return renderList(node, context, true);
    case 'listItem':
      return renderBlocks(node.content ?? [], context);
    case 'blockquote':
      return renderBlocks(node.content ?? [], context)
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n');
    case 'codeBlock':
      return `\`\`\`${node.attrs?.language || ''}\n${node.content?.[0]?.text ?? ''}\n\`\`\``;
    case 'horizontalRule':
      return '---';
    case 'image':
      return renderImage(node, context);
    case 'table':
      return renderTable(node, context);
    case 'hadithBlock':
      return renderHadithBlock(node, context);
    case 'claimBox':
      return renderPanelBlock('ClaimBox', node, context);
    case 'contextNote':
      return renderPanelBlock('ContextNote', node, context);
    case 'verdictBox':
      return renderPanelBlock('VerdictBox', node, context);
    case 'quranVerse':
      return renderQuranVerse(node, context);
    default:
      if (node.content?.length) return renderBlocks(node.content, context);
      return '';
  }
}

function renderInline(nodes, context) {
  return nodes.map((node) => renderInlineNode(node, context)).join('');
}

function renderInlineNode(node, context) {
  if (node.type === 'hardBreak') return '  \n';
  if (node.type === 'image') return renderImage(node, context);
  if (node.type !== 'text') return renderInline(node.content ?? [], context);

  let text = escapeMdxText(node.text ?? '');
  const marks = node.marks ?? [];

  for (const mark of marks) {
    if (mark.type === 'code') text = `\`${text.replace(/`/g, '\\`')}\``;
  }
  for (const mark of marks) {
    if (mark.type === 'bold') text = `**${text}**`;
    if (mark.type === 'italic') text = `_${text}_`;
    if (mark.type === 'strike') text = `~~${text}~~`;
  }
  for (const mark of marks) {
    if (mark.type === 'link' && mark.attrs?.href) text = `[${text}](${mark.attrs.href})`;
  }

  return text;
}

function renderList(node, context, ordered) {
  return (node.content ?? [])
    .map((item, index) => {
      const marker = ordered ? `${index + 1}. ` : '- ';
      const rendered = renderBlocks(item.content ?? [], context).trim();
      const [first = '', ...rest] = rendered.split('\n');
      const continuation = rest.map((line) => `  ${line}`).join('\n');
      return continuation ? `${marker}${first}\n${continuation}` : `${marker}${first}`;
    })
    .join('\n');
}

function renderImage(node, context) {
  const rawSrc = node.attrs?.src || '';
  const src = context.assetResolver ? context.assetResolver(rawSrc) : rawSrc;
  const alt = escapeMdxText(node.attrs?.alt || '');
  return src ? `![${alt}](${src})` : '';
}

function renderTable(node, context) {
  const rows = node.content ?? [];
  if (!rows.length) return '';

  const renderedRows = rows.map((row) =>
    (row.content ?? []).map((cell) => renderInline(cell.content?.[0]?.content ?? cell.content ?? [], context).replace(/\s+/g, ' ').trim())
  );
  const width = Math.max(...renderedRows.map((row) => row.length));
  const normalized = renderedRows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ''));
  const [head, ...body] = normalized;

  return [
    `| ${head.join(' | ')} |`,
    `| ${Array.from({ length: width }, () => '---').join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function renderHadithBlock(node, context) {
  context.usedComponents.add('HadithBlock');
  const attrs = node.attrs ?? {};
  const lines = ['<HadithBlock'];

  if (attrs.label) lines.push(`  label="${escapeAttribute(attrs.label)}"`);
  if (attrs.arabic) lines.push(`  arabic="${escapeAttribute(attrs.arabic)}"`);
  if (attrs.translation) lines.push(`  translation="${escapeAttribute(attrs.translation)}"`);
  if (attrs.source) lines.push(`  source="${escapeAttribute(attrs.source)}"`);

  lines.push('/>');
  return lines.join('\n');
}

function renderPanelBlock(componentName, node, context) {
  context.usedComponents.add(componentName);
  const title = escapeAttribute(node.attrs?.title || defaultPanelTitle(componentName));
  const text = escapeMdxText(node.attrs?.text || '').trim();
  return `<${componentName} title="${title}">\n\n${text}\n\n</${componentName}>`;
}

function renderQuranVerse(node, context) {
  context.usedComponents.add('QuranVerse');
  const attrs = node.attrs ?? {};
  const verse = escapeAttribute(attrs.verse || '');
  const label = attrs.label ? ` label="${escapeAttribute(attrs.label)}"` : '';
  return `<QuranVerse verse="${verse}"${label} />`;
}

function clampHeading(level) {
  const numeric = Number(level) || 2;
  return Math.min(6, Math.max(1, numeric));
}

function defaultPanelTitle(componentName) {
  if (componentName === 'ClaimBox') return 'Core Claim';
  if (componentName === 'ContextNote') return 'Historical Context Note';
  return 'Conclusion';
}

export function escapeMdxText(value) {
  return String(value ?? '').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
}

export function escapeAttribute(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/\n+/g, ' ')
    .trim();
}
