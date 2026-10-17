/** Explicit public props; no arbitrary JSX, imports, class names or HTML. */
const entry = (folder, fields, required = [], children = false) => ({
  path: `components/article/${folder}.astro`, fields, required, children,
  preview: 'safe-registry', migration: 'source-only; no legacy adapter'
});
export const registry = Object.freeze({
  HadithBlock: entry('sources/HadithBlock', { label: 'text', title: 'text', arabic: 'text', translation: 'text', isnad: 'text', source: 'text', url: 'url' }),
  QuranVerse: entry('sources/QuranVerse', { verse: 'verse', label: 'text' }, ['verse']),
  QuranPassage: entry('sources/QuranPassage', { verse: 'verse', translation: 'slot', arabic: 'slot' }, ['verse', 'translation']),
  BibleVerse: entry('sources/BibleVerse', { reference: 'text', eyebrow: 'text' }, ['reference'], true),
  QuoteBlock: entry('text/QuoteBlock', { author: 'text', source: 'text', sourceUrl: 'url' }, [], true),
  Arabic: entry('text/Arabic', { inline: 'boolean' }, [], true),
  ClaimBox: entry('text/ClaimBox', { title: 'text', facts: 'facts' }, [], true),
  VerdictBox: entry('text/VerdictBox', { title: 'text', status: 'text', facts: 'facts' }, [], true),
  ContextNote: entry('text/ContextNote', { title: 'text', collapsible: 'boolean' }, [], true),
  Source: entry('sources/Source', { kind: 'kind', title: 'text', arabic: 'text', translation: 'text', reference: 'text' }, ['kind']),
  Bibliography: entry('sources/Bibliography', { title: 'text', entries: 'bibliography' }, ['entries']),
  SourceComparisonTable: entry('sources/SourceComparisonTable', { caption: 'text', stickyFirstCol: 'boolean', columns: 'strings', rows: 'rows' }, ['columns', 'rows']),
  IsnadDiagram: entry('figures/IsnadDiagram', { nodes: 'nodes', edges: 'edges', caption: 'text', ariaLabel: 'text', width: 'number', height: 'number', legend: 'boolean', orientation: 'orientation' }, ['nodes', 'edges', 'ariaLabel']),
  VariantTree: entry('figures/VariantTree', { title: 'text', root: 'text', bottleneck: 'text', branches: 'branches', ariaLabel: 'text' }, ['title', 'root', 'bottleneck', 'branches']),
  YouTubeEmbed: entry('media/YouTubeEmbed', { url: 'youtube', title: 'text', channel: 'text', date: 'text' }, ['url'])
});
export const categories = ['Origins & Early History', 'Transmission & Narrators', 'Theology & Epistemology', 'Prophecies & Eschatology'];
export function safeUrl(value, image = false) {
  if (typeof value !== 'string' || /[\s\\\u0000-\u001f]/.test(value)) throw new Error('Invalid URL.');
  if (/^\/(?!\/)/.test(value) && !value.includes('..')) return value;
  if (!image && /^https:\/\//.test(value) && new URL(value).protocol === 'https:') return value;
  throw new Error(image ? 'Images must use a local asset path.' : 'Use a local path or HTTPS URL.');
}
function text(value) { if (typeof value !== 'string' || value.length > 100000) throw new Error('Expected text.'); }
function objectFields(value, allowed, required = []) {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Expected object.');
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`Unknown field: ${key}`);
  for (const key of required) if (value[key] === undefined || value[key] === '') throw new Error(`Required field: ${key}`);
}
export function validateProps(type, props) {
  const spec = registry[type];
  if (!spec) throw new Error(`Unsupported component: ${type}`);
  objectFields(props, Object.keys(spec.fields), spec.required);
  for (const [key, value] of Object.entries(props)) {
    const kind = spec.fields[key];
    if (['text', 'slot', 'verse', 'kind', 'orientation', 'url', 'youtube'].includes(kind)) text(value);
    if (kind === 'boolean' && typeof value !== 'boolean') throw new Error(`${key} must be boolean.`);
    if (kind === 'number' && (!Number.isFinite(value) || value <= 0 || value > 10000)) throw new Error(`${key} is out of range.`);
    if (kind === 'url' && value) safeUrl(value);
    if (kind === 'youtube' && !/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(value)) throw new Error('Expected a YouTube URL.');
    if (kind === 'verse' && !/^\d{1,3}:\d{1,3}(?:-\d{1,3})?(?:,\s*\d{1,3}:\d{1,3}(?:-\d{1,3})?)*$/.test(value)) throw new Error('Invalid verse reference.');
    if (kind === 'kind' && !['quran', 'hadith', 'bible'].includes(value)) throw new Error('Invalid source kind.');
    if (kind === 'orientation' && !['top-down', 'bottom-up'].includes(value)) throw new Error('Invalid orientation.');
    if (['facts', 'bibliography', 'strings', 'rows', 'nodes', 'edges', 'branches'].includes(kind)) {
      if (!Array.isArray(value) || value.length > 500) throw new Error(`${key} must be an array (maximum 500).`);
      for (const row of value) {
        if (kind === 'strings') { text(row); continue; }
        if (kind === 'rows') { if (!Array.isArray(row)) throw new Error('Expected table row.'); row.forEach(text); continue; }
        const schemas = {
          facts: [['value', 'label'], ['value', 'label']],
          bibliography: [['author', 'title', 'details', 'year'], ['author', 'title', 'details']],
          nodes: [['id', 'x', 'y', 'label', 'sublabel', 'labelPos', 'kind'], ['id', 'x', 'y']],
          edges: [['from', 'to', 'kind'], ['from', 'to']],
          branches: [['name', 'from', 'arabic', 'quote', 'sources', 'marks'], ['name', 'quote', 'sources']]
        };
        objectFields(row, ...schemas[kind]);
        for (const [field, item] of Object.entries(row)) {
          if (['x', 'y'].includes(field)) { if (!Number.isFinite(item) || Math.abs(item) > 10000) throw new Error('Invalid diagram coordinate.'); }
          else if (field === 'marks') { if (!Array.isArray(item)) throw new Error('Expected marks.'); item.forEach(text); }
          else text(item);
        }
      }
    }
  }
  if (type === 'SourceComparisonTable') {
    if (!props.columns.length || props.rows.some(row => row.length !== props.columns.length)) throw new Error('Table row widths must match columns.');
  }
  if (type === 'IsnadDiagram') {
    const ids = new Set(props.nodes.map(n => n.id));
    if (ids.size !== props.nodes.length || props.nodes.some(n => !n.id)) throw new Error('Diagram IDs must be unique.');
    if (props.edges.some(e => !ids.has(e.from) || !ids.has(e.to))) throw new Error('Diagram edge references unknown node.');
  }
  return props;
}
