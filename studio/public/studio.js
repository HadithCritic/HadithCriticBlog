import { createVisualEditor, parseYaml, patchYamlField } from './editor.js';
import { emptyDocument, serializeDocument } from './shared/model.mjs';
import { mountDashboard } from './dashboard.js';

const CATEGORY_NAMES = {
  'origins-early-history': 'Origins & Early History',
  'transmission-narrators': 'Transmission & Narrators',
  'theology-epistemology': 'Theology & Epistemology',
  'prophecies-eschatology': 'Prophecies & Eschatology'
};
const AUTOSAVE_DELAY_MS = 1600;
// Studio allows 50 changes a minute; an autosave refused for that waits this long.
const RATE_LIMIT_RETRY_MS = 20000;
const ARTICLE_ROOT = 'src/content/articles/';
const $ = (id) => document.getElementById(id);
const state = {
  articles: [], artwork: {}, config: null, active: null, original: '', frontmatter: '', frontmatterPrefix: '', body: '',
  initialFields: null, version: 0, baseSha: '', dirty: false, filter: 'all', timer: 0, loading: false, saving: false,
  document: null, savedDocument: null, archived: false
};
let preparedJob = null;
let conflictReview = null;

const visual = createVisualEditor($('visual-editor'), (doc) => { state.document = doc; markDirty(); }, {
  outline: $('outline'),
  onRequestImage: () => openMedia()
});
const fields = {
  title: $('meta-title'), description: $('meta-description'), date: $('meta-date'), updated: $('meta-updated'),
  category: $('meta-category'), author: $('meta-author'), tags: $('meta-tags'), thumbnail: $('meta-thumbnail'), heroAlt: $('meta-hero-alt')
};

/* ── Source and metadata ─────────────────────────────────────── */

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)*/);
  if (!match) return { block: '', prefix: '', body: source, metadata: {} };
  const metadata = parseYaml(match[1]) || {};
  return { block: match[1], prefix: match[0], body: source.slice(match[0].length), metadata };
}

function currentMetadata() {
  return {
    title: fields.title.value, description: fields.description.value, date: fields.date.value, category: fields.category.value,
    author: fields.author.value, tags: fields.tags.value.split(',').map((tag) => tag.trim()).filter(Boolean), draft: true,
    ...(fields.updated.value ? { updated: fields.updated.value } : {}),
    ...(fields.thumbnail.value ? { thumbnail: fields.thumbnail.value, heroAlt: fields.heroAlt.value } : {})
  };
}

/** Legacy sources change only the edited YAML fields; the body bytes are kept. */
function currentSource() {
  if (state.document) return serializeDocument(state.document, currentMetadata(), state.active.path);
  let block = state.frontmatter;
  const initial = state.initialFields || {};
  const currentTags = fields.tags.value.split(',').map((tag) => tag.trim()).filter(Boolean);
  const initialTags = String(initial.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  let metadataChanged = false;
  const update = (name, key, value, options) => {
    if (fields[name].value === initial[name]) return;
    metadataChanged = true;
    block = patchYamlField(block, key, value, options);
  };
  update('title', 'title', fields.title.value.trim());
  update('description', 'description', fields.description.value.trim());
  update('date', 'date', fields.date.value || new Date().toISOString().slice(0, 10));
  update('updated', 'updated', fields.updated.value, { omitEmpty: true });
  update('category', 'category', fields.category.value);
  update('author', 'author', fields.author.value.trim() || 'HadithCritic', { omitEmpty: true });
  if (JSON.stringify(currentTags) !== JSON.stringify(initialTags)) {
    metadataChanged = true;
    block = patchYamlField(block, 'tags', currentTags);
  }
  update('thumbnail', 'thumbnail', fields.thumbnail.value.trim(), { omitEmpty: true });
  update('heroAlt', 'heroAlt', fields.heroAlt.value.trim(), { omitEmpty: true });
  const editedBody = $('body').value;
  const originalBodyNormalized = state.body.replace(/\r\n?/g, '\n');
  const body = editedBody === originalBodyNormalized ? state.body : editedBody;
  const eol = state.frontmatterPrefix.startsWith('---\r\n') ? '\r\n' : '\n';
  const separator = state.frontmatterPrefix.match(/\r?\n---((?:\r?\n)*)$/)?.[1] ?? '\n\n';
  const prefix = metadataChanged ? `---${eol}${block}${eol}---${separator}` : state.frontmatterPrefix;
  return `${prefix}${body}`;
}

function getFields() {
  return Object.fromEntries(Object.entries(fields).map(([name, input]) => [name, input.value]));
}

function setFields(metadata) {
  fields.title.value = metadata.title || '';
  fields.description.value = metadata.description || '';
  fields.date.value = String(metadata.date || '').slice(0, 10);
  fields.updated.value = String(metadata.updated || '').slice(0, 10);
  fields.category.value = Object.values(CATEGORY_NAMES).includes(metadata.category) ? metadata.category : Object.values(CATEGORY_NAMES)[0];
  fields.author.value = metadata.author || 'HadithCritic';
  fields.tags.value = Array.isArray(metadata.tags) ? metadata.tags.join(', ') : '';
  fields.thumbnail.value = metadata.thumbnail || '';
  fields.heroAlt.value = metadata.heroAlt || '';
  renderThumbnail();
}

/* ── Network ─────────────────────────────────────────────────── */

async function api(url, options = {}) {
  const response = await fetch(url, { cache: 'no-store', ...options, headers: { ...(options.body ? { 'content-type': 'application/json' } : {}), ...options.headers } });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!response.ok) {
    const error = new Error(data.error || `${response.status} ${response.statusText}`);
    error.status = response.status;
    error.currentVersion = data.currentVersion;
    throw error;
  }
  return data;
}

/* ── Small helpers ───────────────────────────────────────────── */

const el = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};

function slugify(value) {
  return value.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'new-study';
}

function dateLabel(value) {
  if (!value) return 'Undated';
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(parsed);
}

function relativeTime(value) {
  if (!value) return '—';
  const minutes = Math.round((Date.now() - new Date(value).valueOf()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return dateLabel(value);
}

const articleId = (path) => path.slice(ARTICLE_ROOT.length).replace(/\.mdx?$/i, '');
const artworkFor = (article) => state.artwork[articleId(article.path)] || null;

function setSaveState(text, kind = '') {
  const node = $('save-state');
  node.textContent = text;
  node.className = `save-state${kind ? ` is-${kind}` : ''}`;
}

function showNotice(message, error = false) {
  const node = $('notice');
  node.textContent = message;
  node.hidden = false;
  node.classList.toggle('is-error', error);
  clearTimeout(showNotice.timer);
  showNotice.timer = setTimeout(() => { node.hidden = true; }, 6500);
}

function setPressed(buttons, active) {
  for (const item of buttons) {
    item.classList.toggle('is-active', item === active);
    item.setAttribute('aria-pressed', String(item === active));
  }
}

/* ── Article list and overview ───────────────────────────────── */

function articleRow(article) {
  const item = el('li', undefined, `article-row${state.active?.path === article.path ? ' is-selected' : ''}`);
  const button = el('button');
  button.type = 'button';
  button.addEventListener('click', () => openArticle(article.path));
  const art = artworkFor(article);
  const thumb = el('span', undefined, 'article-row__thumb');
  if (art) {
    const img = el('img');
    img.src = art.thumb; img.alt = ''; img.loading = 'lazy'; img.width = 44; img.height = 44;
    thumb.append(img);
  } else {
    thumb.append(el('span', article.privateVersion !== null ? 'Draft' : 'MDX'));
  }
  const text = el('span', undefined, 'article-row__text');
  const title = el('span', article.title, 'article-row__title');
  const meta = el('span', undefined, 'article-row__meta');
  meta.append(el('span', dateLabel(article.date)));
  if (article.archived) meta.append(el('span', 'Archived', 'badge'));
  else if (article.privateVersion !== null) meta.append(el('span', article.sha ? `Private v${article.privateVersion}` : 'Private draft', 'badge badge--gold'));
  text.append(title, meta);
  button.append(thumb, text);
  item.append(button);
  return item;
}

function renderList() {
  const query = $('search').value.trim().toLocaleLowerCase();
  const filtered = state.articles.filter((article) => {
    if (state.filter === 'archived') { if (!article.archived) return false; }
    else if (article.archived) return false;
    if (state.filter === 'published' && !article.sha) return false;
    if (state.filter === 'drafts' && article.privateVersion === null) return false;
    const haystack = `${article.title} ${article.category} ${(article.tags || []).join(' ')} ${article.path}`.toLocaleLowerCase();
    return !query || haystack.includes(query);
  }).sort((a, b) => String(b.privateUpdatedAt || '').localeCompare(String(a.privateUpdatedAt || '')) || String(b.date).localeCompare(String(a.date)));
  $('article-list').replaceChildren(...filtered.map(articleRow));
  $('list-status').textContent = `${filtered.length.toLocaleString()} ${filtered.length === 1 ? 'study' : 'studies'}`;
  renderOverview();
}

function featureCard(article, label) {
  const item = el('li');
  const button = el('button', undefined, 'feature');
  button.type = 'button';
  button.addEventListener('click', () => openArticle(article.path));
  const art = artworkFor(article);
  const media = el('span', undefined, 'feature__media');
  if (art) { const img = el('img'); img.src = art.thumb; img.alt = ''; img.loading = 'lazy'; media.append(img); }
  else media.append(el('span', 'New', 'feature__placeholder'));
  const text = el('span', undefined, 'feature__text');
  text.append(el('span', article.title, 'feature__title'), el('span', label, 'feature__meta'));
  const arrow = el('span', 'Continue', 'feature__go');
  button.append(media, text, arrow);
  item.append(button);
  return item;
}

function renderOverview() {
  const publicCount = state.articles.filter((article) => article.sha).length;
  const drafts = state.articles.filter((article) => article.privateVersion !== null && !article.archived);
  const archived = state.articles.filter((article) => article.archived).length;
  const latest = drafts.map((article) => article.privateUpdatedAt).filter(Boolean).sort().at(-1);
  $('stat-public').textContent = publicCount.toLocaleString();
  $('stat-drafts').textContent = drafts.length.toLocaleString();
  $('stat-archived').textContent = archived.toLocaleString();
  $('stat-recent').textContent = relativeTime(latest);

  const recent = [...drafts].sort((a, b) => String(b.privateUpdatedAt).localeCompare(String(a.privateUpdatedAt))).slice(0, 4);
  const continueList = $('continue-list');
  continueList.replaceChildren(...recent.map((article) => featureCard(article, `${article.sha ? `Revision of a public study · v${article.privateVersion}` : `New study · v${article.privateVersion}`} · ${relativeTime(article.privateUpdatedAt)}`)));
  if (!recent.length) continueList.append(el('li', 'No private drafts yet. Start a new draft, or open a public study to revise it privately.', 'empty-line'));

  const published = state.articles.filter((article) => article.sha && !article.archived).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);
  $('published-list').replaceChildren(...published.map((article) => {
    const item = el('li');
    const button = el('button', undefined, 'art-card');
    button.type = 'button';
    button.addEventListener('click', () => openArticle(article.path));
    const art = artworkFor(article);
    const media = el('span', undefined, 'art-card__media');
    if (art) { const img = el('img'); img.src = art.card; img.alt = ''; img.loading = 'lazy'; media.append(img); }
    button.append(media, el('span', article.category || 'Study', 'art-card__branch'), el('span', article.title, 'art-card__title'), el('span', dateLabel(article.date), 'art-card__date'));
    item.append(button);
    return item;
  }));
}

function renderSetup() {
  const config = state.config;
  const rows = [
    ['ok', 'Signed in through Access', 'Every request is verified against the one owner identity.'],
    ['ok', 'Private drafts and revisions', 'Saved to the Studio store. Autosave keeps a checkpoint every ten minutes.'],
    config?.media ? ['ok', 'Private image library', 'Uploads are stored privately until publication.'] : ['off', 'Image library not connected', 'Add the private R2 binding to upload images.'],
    config?.publishing ? ['ok', `Publishing to ${config.branch}`, 'Every public write is prepared, reviewed and confirmed.'] : ['off', 'Publishing disabled', 'Drafts stay private. Publication needs the GitHub App and verified branch rules.']
  ];
  $('setup-list').replaceChildren(...rows.map(([status, title, detail]) => {
    const item = el('li', undefined, `setup setup--${status}`);
    const icon = el('span', undefined, 'setup__icon');
    icon.innerHTML = `<svg aria-hidden="true"><use href="#${status === 'ok' ? 'i-check' : 'i-dot'}"/></svg>`;
    const text = el('span', undefined, 'setup__text');
    text.append(el('strong', title), el('span', detail));
    item.append(icon, text);
    return item;
  }));
}

function upsertArticle(changes) {
  const index = state.articles.findIndex((article) => article.path === changes.path);
  if (index === -1) state.articles = [...state.articles, { tags: [], sha: '', archived: false, privateVersion: null, ...changes }];
  else state.articles = state.articles.map((article, i) => i === index ? { ...article, ...changes } : article);
  renderList();
}

async function loadArticles() {
  $('list-status').textContent = 'Reading the archive…';
  try {
    const result = await api('/api/articles');
    state.articles = result.articles;
    renderList();
  } catch (error) {
    $('list-status').textContent = error.status === 401 ? 'Access session expired. Reload after signing in again.' : `Could not load the archive: ${error.message}`;
  }
}

/* ── Editor state ────────────────────────────────────────────── */

function renderDiff() {
  if (!state.active) return;
  const before = state.original.split(/\r?\n/);
  const after = currentSource().split(/\r?\n/);
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < before.length - prefix && suffix < after.length - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  const removed = before.length - prefix - suffix;
  const added = after.length - prefix - suffix;
  $('diff-count').textContent = removed || added ? `${removed} removed · ${added} added` : 'No changes';
  const lines = [];
  for (let index = Math.max(0, prefix - 2); index < prefix; index++) lines.push(`  ${before[index]}`);
  for (let index = prefix; index < before.length - suffix; index++) lines.push(`− ${before[index]}`);
  for (let index = prefix; index < after.length - suffix; index++) lines.push(`+ ${after[index]}`);
  for (let index = before.length - suffix; index < Math.min(before.length, before.length - suffix + 2); index++) lines.push(`  ${before[index]}`);
  $('diff-preview').textContent = lines.join('\n') || 'No source changes';
}

function updateCounts() {
  if (state.document) $('body').value = parseFrontmatter(currentSource()).body;
  const text = $('body').value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  $('word-count').textContent = `${words.toLocaleString()} ${words === 1 ? 'word' : 'words'}`;
  $('plain-preview').textContent = text;
  renderDiff();
}

function markDirty() {
  if (!state.active) return;
  state.dirty = true;
  clearTimeout(state.timer);
  try {
    updateCounts();
    $('validation').textContent = '';
  } catch (error) {
    // An incomplete document cannot be serialized, so it is not saved yet.
    $('validation').textContent = error.message;
    setSaveState(`Not saved yet: ${error.message}`, 'error');
    return;
  }
  setSaveState('Unsaved changes', 'dirty');
  if (fields.title.value.trim() && fields.description.value.trim()) {
    state.timer = setTimeout(() => saveDraft(true), AUTOSAVE_DELAY_MS);
  }
}

function setMode(isVisual) {
  $('visual-editor').hidden = !isVisual;
  document.querySelector('.source-pane').hidden = isVisual;
  $('body').readOnly = !!state.document;
  setPressed([$('visual-mode'), $('source-mode')], isVisual ? $('visual-mode') : $('source-mode'));
  $('mode-label').textContent = isVisual ? 'Visual authoring' : state.document ? 'Generated source' : 'Legacy source';
  $('mode-description').textContent = isVisual
    ? 'Research blocks are saved as structured fields. The MDX is generated from them, with footnote IDs kept stable.'
    : state.document
      ? 'Read only. This is the exact MDX the visual document produces.'
      : 'This study is edited as its original MDX. It is never converted, so every byte you do not change stays as it was.';
  $('outline-card').hidden = !state.document;
  if (state.document && !isVisual) {
    try { $('body').value = parseFrontmatter(currentSource()).body; } catch (error) { $('validation').textContent = error.message; }
  }
}

function renderThumbnail() {
  const path = fields.thumbnail.value.trim();
  const image = $('thumb-preview');
  const media = path.match(/^\/images\/studio\/([a-f0-9-]{36})\./);
  const name = path.split('/').at(-1)?.replace(/\.webp$/, '');
  const art = name ? Object.values(state.artwork).find((entry) => entry.card.includes(name) || entry.thumb.includes(name)) : null;
  const src = media ? `/api/media/${media[1]}` : art?.thumb;
  image.hidden = !src;
  if (src) { image.src = src; image.alt = fields.heroAlt.value; }
}

function showEditor(show) {
  $('editor').hidden = !show;
  $('empty-state').hidden = show;
  document.body.classList.toggle('is-editing', show);
}

function fillEditor(result) {
  const parsed = parseFrontmatter(result.source);
  state.frontmatter = parsed.block;
  state.frontmatterPrefix = parsed.prefix;
  state.body = parsed.body;
  state.document = result.editor_json ? JSON.parse(result.editor_json) : null;
  state.savedDocument = state.document ? structuredClone(state.document) : null;
  visual.load(state.document || emptyDocument());
  $('visual-mode').disabled = !state.document;
  $('preview-button').disabled = !state.document;
  $('body').value = parsed.body;
  setFields(parsed.metadata);
  setMode(!!state.document);
  state.initialFields = getFields();
  state.original = result.source;
  state.version = result.version || 0;
  state.baseSha = result.base_sha || result.baseSha || '';
  state.archived = !!result.archived_at;
  $('archive-button').lastChild.textContent = state.archived ? 'Restore' : 'Archive';
  state.dirty = false;
  $('resolve-conflict').hidden = true;
  $('validation').textContent = '';
  $('editor-title').textContent = fields.title.value || state.active.path.split('/').at(-1);
  $('editor-kind').textContent = state.document ? 'Visual document' : state.baseSha ? 'Revision of a public study' : 'Private working copy';
  $('editor-path').textContent = state.active.path;
  $('revision-label').textContent = state.version ? `Private version ${state.version}` : 'Not saved yet';
  $('base-label').textContent = state.baseSha ? `Git blob ${state.baseSha.slice(0, 10)}` : 'New file, private until published';
  $('baseline-label').textContent = `${parsed.body.length.toLocaleString()} characters · frontmatter is edited in the record panel`;
  setSaveState(state.version ? 'Private version loaded' : 'No private changes', state.version ? 'saved' : '');
  $('history-button').disabled = !state.version;
  showEditor(true);
  updateCounts();
  renderList();
}

async function leaveIfSaved() {
  if (!state.dirty) return true;
  await saveDraft(true);
  return !state.dirty;
}

async function openArticle(path) {
  if (state.active?.path === path) return;
  if (!await leaveIfSaved()) return;
  clearTimeout(state.timer);
  state.loading = true;
  setSaveState('Loading source…');
  try {
    const result = await api(`/api/article?path=${encodeURIComponent(path)}`);
    state.active = { path };
    fillEditor(result);
    window.scrollTo({ top: 0 });
    if (result.publicChanged) showNotice('The public file changed after this private draft was based on it. Your draft is safe; compare before publishing.', true);
  } catch (error) {
    showNotice(`Could not open article: ${error.message}`, true);
    setSaveState('Could not open source', 'error');
  } finally {
    state.loading = false;
  }
}

async function saveDraft(automatic = false) {
  if (!state.active || state.loading || state.saving || !state.dirty) return;
  if (!fields.title.value.trim() || !fields.description.value.trim()) {
    setSaveState('Add a title and description to save', 'error');
    return;
  }
  clearTimeout(state.timer);
  let source;
  try { source = currentSource(); } catch (error) {
    $('validation').textContent = error.message;
    setSaveState(`Not saved yet: ${error.message}`, 'error');
    return;
  }
  state.saving = true;
  $('save-button').disabled = true;
  setSaveState(automatic ? 'Autosaving…' : 'Saving private version…');
  const savedFields = getFields();
  const savedDocument = state.document ? structuredClone(state.document) : null;
  const savedMetadata = state.document ? currentMetadata() : null;
  try {
    const result = await api('/api/draft', {
      method: 'PUT',
      body: JSON.stringify({ path: state.active.path, source, expectedVersion: state.version, baseSha: state.baseSha, autosave: automatic, ...(savedDocument ? { document: savedDocument, metadata: savedMetadata } : {}) })
    });
    state.version = result.version;
    $('resolve-conflict').hidden = true;
    conflictReview = null;
    state.original = source;
    state.savedDocument = savedDocument;
    const parsed = parseFrontmatter(source);
    state.frontmatter = parsed.block;
    state.frontmatterPrefix = parsed.prefix;
    state.body = parsed.body;
    state.initialFields = savedFields;
    state.dirty = currentSource() !== source;
    $('revision-label').textContent = `Private version ${state.version}${result.revision ? '' : ' · autosaved'}`;
    $('history-button').disabled = false;
    const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(result.updatedAt));
    setSaveState(state.dirty ? 'Saved · newer edits are waiting' : `Saved privately · ${time}`, state.dirty ? 'dirty' : 'saved');
    if (!automatic) showNotice('Private draft saved. The public repository was not changed.');
    upsertArticle({ path: state.active.path, title: savedFields.title, category: savedFields.category, date: savedFields.date, privateVersion: state.version, privateUpdatedAt: result.updatedAt, archived: state.archived });
    if (state.dirty) state.timer = setTimeout(() => saveDraft(true), AUTOSAVE_DELAY_MS);
  } catch (error) {
    if (error.status === 409) {
      $('resolve-conflict').hidden = false;
      setSaveState('Conflict: another session saved first', 'error');
      showNotice(`This draft is now version ${error.currentVersion}. Your text is still in the editor; compare and resolve before saving.`, true);
    } else if (error.status === 429 && automatic) {
      setSaveState('Saving paused for a moment · your text is safe here', 'dirty');
      clearTimeout(state.timer);
      state.timer = setTimeout(() => saveDraft(true), RATE_LIMIT_RETRY_MS);
    } else {
      setSaveState('Private save failed', 'error');
      showNotice(`The draft was not saved: ${error.message}`, true);
    }
  } finally {
    state.saving = false;
    $('save-button').disabled = false;
  }
}

function leaveEditor() {
  showEditor(false);
  state.active = null;
  renderList();
}

/* ── History ─────────────────────────────────────────────────── */

async function loadRevision(version) {
  const snapshot = await api(`/api/revision?path=${encodeURIComponent(state.active.path)}&version=${version}`);
  const parsed = parseFrontmatter(snapshot.source);
  state.frontmatter = parsed.block;
  state.frontmatterPrefix = parsed.prefix;
  state.body = parsed.body;
  state.document = snapshot.editor_json ? JSON.parse(snapshot.editor_json) : null;
  visual.load(state.document || emptyDocument());
  $('visual-mode').disabled = !state.document;
  $('preview-button').disabled = !state.document;
  $('body').value = parsed.body;
  setFields(parsed.metadata);
  setMode(!!state.document);
  state.initialFields = getFields();
  $('history-dialog').close();
  markDirty();
  showNotice(`Version ${version} loaded. Save it to make it the current private version.`);
}

async function openHistory() {
  if (!state.active) return;
  const result = await api(`/api/revisions?path=${encodeURIComponent(state.active.path)}`);
  const list = $('history-list');
  list.replaceChildren(...result.revisions.map((revision) => {
    const item = el('li', undefined, 'history-entry');
    const label = el('span');
    label.append(el('strong', `Version ${revision.version}`), el('small', `${dateLabel(revision.created_at)} · ${new Date(revision.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`));
    const restore = el('button', 'Load version', 'button button--small');
    restore.type = 'button';
    restore.addEventListener('click', () => loadRevision(revision.version).catch((error) => showNotice(error.message, true)));
    item.append(label, restore);
    return item;
  }));
  if (!result.revisions.length) list.append(el('li', 'No private revisions saved yet.', 'dialog-note'));
  $('history-dialog').showModal();
}

/* ── New draft ───────────────────────────────────────────────── */

async function startNewDraft() {
  if (!await leaveIfSaved()) return;
  $('new-dialog').showModal();
}

function openNewDraft(event) {
  event.preventDefault();
  const title = $('new-title').value.trim();
  const description = $('new-description').value.trim();
  const categorySlug = $('new-category').value;
  const slug = slugify(title);
  let path = `${ARTICLE_ROOT}${categorySlug}/studio-${slug}.mdx`;
  let suffix = 2;
  while (state.articles.some((article) => article.path === path)) path = `${ARTICLE_ROOT}${categorySlug}/studio-${slug}-${suffix++}.mdx`;
  const metadata = {
    title, description, date: new Date().toISOString().slice(0, 10), category: CATEGORY_NAMES[categorySlug],
    author: 'HadithCritic', tags: [], draft: true
  };
  state.active = { path };
  state.version = 0;
  state.baseSha = '';
  $('new-dialog').close();
  $('new-form').reset();
  fillEditor({ path, source: serializeDocument(emptyDocument(), metadata, path), version: 0, base_sha: '', editor_json: JSON.stringify(emptyDocument()) });
  state.dirty = true;
  markDirty();
  document.querySelector('#visual-editor select')?.focus();
}

/* ── Conflict review ─────────────────────────────────────────── */

async function openConflict() {
  try {
    const latest = await api(`/api/article?path=${encodeURIComponent(state.active.path)}`);
    const publicSource = state.baseSha ? await api(`/api/public-source?path=${encodeURIComponent(state.active.path)}`) : null;
    conflictReview = { path: state.active.path, latest, publicSource };
    $('conflict-mine').textContent = currentSource();
    $('conflict-private').textContent = latest.source;
    $('conflict-public').textContent = publicSource?.source || 'No public base for this new article.';
    $('adopt-public-base').disabled = !publicSource;
    $('conflict-confirm').value = '';
    $('conflict-status').textContent = '';
    $('conflict-dialog').showModal();
  } catch (error) {
    showNotice(error.message, true);
  }
}

function adoptReviewedVersion(publicBase = false) {
  if (!conflictReview || conflictReview.path !== state.active.path || $('conflict-confirm').value !== 'KEEP EDITOR') {
    $('conflict-status').textContent = 'Review the sources and type KEEP EDITOR first.';
    return;
  }
  state.version = conflictReview.latest.version;
  state.baseSha = publicBase ? conflictReview.publicSource.base_sha : conflictReview.latest.base_sha;
  state.original = conflictReview.latest.source;
  $('conflict-dialog').close();
  markDirty();
}

/* ── Duplicate and archive ───────────────────────────────────── */

async function duplicate() {
  try {
    await saveDraft();
    if (state.dirty) throw new Error('Save or resolve current edits before duplicating.');
    const source = currentSource();
    const doc = state.document;
    const newPath = state.active.path.replace(/\.mdx?$/, `-copy-${crypto.randomUUID().slice(0, 8)}.mdx`);
    state.active = { path: newPath };
    fillEditor({ source, version: 0, base_sha: '', editor_json: doc ? JSON.stringify(doc) : null });
    markDirty();
  } catch (error) {
    showNotice(error.message, true);
  }
}

async function toggleArchive() {
  try {
    await saveDraft();
    if (state.dirty || !state.version) throw new Error('Save or resolve edits first.');
    await api('/api/draft/state', { method: 'POST', body: JSON.stringify({ path: state.active.path, expectedVersion: state.version, archived: !state.archived }) });
    const result = await api(`/api/article?path=${encodeURIComponent(state.active.path)}`);
    fillEditor(result);
    await loadArticles();
  } catch (error) {
    showNotice(error.message, true);
  }
}

/* ── Preview ─────────────────────────────────────────────────── */

async function openPreview() {
  try {
    const result = await api('/api/preview', { method: 'POST', body: JSON.stringify({ document: state.document }) });
    // Only HTML produced by the schema renderer; arbitrary MDX never reaches innerHTML.
    $('preview-content').innerHTML = result.html;
    for (const image of $('preview-content').querySelectorAll('img')) {
      const match = image.getAttribute('src').match(/^\/images\/studio\/([a-f0-9-]{36})\./);
      if (match) image.src = `/api/media/${match[1]}`;
      if (image.hasAttribute('srcset')) image.setAttribute('srcset', image.getAttribute('srcset').replace(/\/images\/studio\/([a-f0-9-]{36})\.(?:png|jpg|webp)/g, (_match, id) => `/api/media/${id}`));
    }
    $('preview-dialog').showModal();
  } catch (error) {
    showNotice(error.message, true);
  }
}

function togglePreviewTheme() {
  const stage = $('preview-theme-wrap');
  const light = stage.dataset.theme !== 'light';
  stage.dataset.theme = light ? 'light' : 'dark';
  $('preview-theme').setAttribute('aria-pressed', String(light));
  $('preview-theme').textContent = light ? 'Dark reader' : 'Light reader';
}

/* ── Media ───────────────────────────────────────────────────── */

function mediaCard(image) {
  const card = el('article', undefined, `media-card${image.deleted_at ? ' is-archived' : ''}`);
  const img = el('img');
  img.src = `/api/media/${image.id}`; img.alt = image.alt; img.loading = 'lazy';
  const caption = el('p', image.alt, 'media-card__alt');
  const meta = el('p', `${image.width ? `${image.width}px · ` : ''}${Math.round(image.bytes / 1024)} KB${image.deleted_at ? ' · Archived' : ''}`, 'media-card__meta');
  const actions = el('div', undefined, 'media-card__actions');
  const insert = el('button', 'Insert image', 'button button--small');
  insert.type = 'button';
  insert.disabled = !state.document || !!image.deleted_at;
  insert.onclick = () => { visual.insertImage(image); $('media-dialog').close(); };
  const thumbnail = el('button', 'Use as thumbnail', 'button button--small');
  thumbnail.type = 'button';
  thumbnail.disabled = !!image.deleted_at;
  thumbnail.onclick = () => { fields.thumbnail.value = image.path; fields.heroAlt.value = image.alt; renderThumbnail(); markDirty(); $('media-dialog').close(); };
  const remove = el('button', image.deleted_at ? 'Restore image' : 'Archive unused image', 'button button--small button--ghost');
  remove.type = 'button';
  remove.onclick = async () => {
    try {
      await api(`/api/media/${image.id}${image.deleted_at ? '/restore' : ''}`, { method: image.deleted_at ? 'POST' : 'DELETE', ...(image.deleted_at ? { body: '{}' } : {}) });
      await loadMedia();
    } catch (error) { $('media-status').textContent = error.message; }
  };
  actions.append(insert, thumbnail, remove);
  card.append(img, caption, meta, actions);
  return card;
}

async function loadMedia() {
  const result = await api('/api/media');
  // Variants are served beside their original; the library lists originals.
  $('media-list').replaceChildren(...result.media.map(mediaCard));
  if (!result.media.length) $('media-list').append(el('p', 'No private images yet.', 'dialog-note'));
}

async function openMedia() {
  try {
    await loadMedia();
    $('media-dialog').showModal();
  } catch (error) {
    showNotice(error.message, true);
  }
}

async function uploadMediaFile(event) {
  event.preventDefault();
  $('media-status').textContent = 'Preparing and uploading…';
  try {
    const file = $('media-file').files[0];
    if (!file || file.size > 8 * 1024 * 1024) throw new Error('Choose an image under 8 MB.');
    const bitmap = await createImageBitmap(file);
    const ratio = Number($('media-crop').value);
    const sw = ratio ? Math.min(bitmap.width, bitmap.height * ratio) : bitmap.width;
    const sh = ratio ? sw / ratio : bitmap.height;
    const draw = async (width, quality) => {
      const canvas = el('canvas');
      canvas.width = width;
      canvas.height = Math.round(sh / sw * width);
      canvas.getContext('2d').drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (!blob) throw new Error('Image conversion failed.');
      return blob;
    };
    const width = Math.round(sw * Math.min(1, 1536 / sw, 1536 / sh));
    const headers = { 'content-type': 'image/webp', 'x-image-alt': encodeURIComponent($('media-alt').value) };
    const response = await fetch('/api/media', { method: 'POST', body: await draw(width, 0.9), headers: { ...headers, 'x-image-width': String(width) } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    for (const variantWidth of [720, 160].filter((candidate) => candidate < width)) {
      const uploaded = await fetch('/api/media', { method: 'POST', body: await draw(variantWidth, 0.88), headers: { ...headers, 'x-image-parent': result.id, 'x-image-width': String(variantWidth) } });
      if (!uploaded.ok) throw new Error('Original uploaded; a responsive variant failed. Keep the original and retry variants separately.');
    }
    bitmap.close();
    $('media-status').textContent = 'Image stored privately.';
    $('media-form').reset();
    await loadMedia();
  } catch (error) {
    $('media-status').textContent = error.message;
  }
}

/* ── Publication ─────────────────────────────────────────────── */

function setPublicationStatus(text) { $('publication-status').textContent = text; }

async function readGitHistory() {
  try {
    const result = await api(`/api/publication/history?path=${encodeURIComponent(state.active.path)}`);
    $('git-history').textContent = result.commits.map((commit) => `${commit.sha} ${commit.commit.message}`).join('\n');
    $('git-history').hidden = false;
  } catch (error) { setPublicationStatus(error.message); }
}

async function preparePublication() {
  try {
    await saveDraft();
    if (state.dirty) throw new Error('Save or resolve current edits first.');
    preparedJob = await api('/api/publication/prepare', { method: 'POST', body: JSON.stringify({ path: state.active.path, expectedVersion: state.version, action: $('publication-action').value, revision: $('rollback-sha').value }) });
    $('publication-source').textContent = preparedJob.source;
    setPublicationStatus(`Prepared ${preparedJob.id} · review every byte before confirmation.`);
    $('confirm-publication').disabled = false;
    $('cancel-publication').disabled = false;
  } catch (error) { setPublicationStatus(error.message); }
}

async function confirmPublication() {
  if (!preparedJob) return;
  try {
    const result = await api('/api/publication/confirm', { method: 'POST', body: JSON.stringify({ id: preparedJob.id, expectedHead: preparedJob.expectedHead, confirmPath: $('confirm-path').value }) });
    setPublicationStatus(`${result.status}: ${result.commit}. ${result.deployment || 'Live deployment must be verified separately.'}`);
    if (result.status === 'committed') {
      $('confirm-publication').disabled = true;
      const latest = await api(`/api/article?path=${encodeURIComponent(state.active.path)}`);
      state.baseSha = latest.base_sha;
      await loadArticles();
    }
  } catch (error) { setPublicationStatus(error.message); }
}

async function cancelPublication() {
  if (!preparedJob) return;
  try {
    await api('/api/publication/cancel', { method: 'POST', body: JSON.stringify({ id: preparedJob.id }) });
    preparedJob = null;
    $('cancel-publication').disabled = true;
    $('confirm-publication').disabled = true;
    setPublicationStatus('Prepared job cancelled. No public write.');
  } catch (error) { setPublicationStatus(error.message); }
}

async function listPublicationJobs() {
  try {
    const result = await api(`/api/publications?path=${encodeURIComponent(state.active.path)}`);
    $('publication-job-list').replaceChildren(...result.jobs.map((job) => {
      const button = el('button', `${job.id}: ${job.action} · ${job.status}`, 'button button--small');
      button.type = 'button';
      button.onclick = async () => {
        try {
          preparedJob = await api(`/api/publication/job?id=${encodeURIComponent(job.id)}`);
          $('publication-source').textContent = preparedJob.source;
          $('confirm-path').value = '';
          $('confirm-publication').disabled = !['prepared', 'committing', 'uncertain'].includes(preparedJob.status);
          $('cancel-publication').disabled = preparedJob.status !== 'prepared';
          setPublicationStatus(`Loaded immutable job ${job.id}. Review before retrying.`);
        } catch (error) { setPublicationStatus(error.message); }
      };
      return button;
    }));
  } catch (error) { setPublicationStatus(error.message); }
}

async function checkPublication() {
  if (!preparedJob) return;
  try {
    const result = await api(`/api/publication/status?id=${encodeURIComponent(preparedJob.id)}`);
    setPublicationStatus(`${result.status}\n${result.checks.map((check) => `${check.name}: ${check.status} / ${check.conclusion || 'pending'}`).join('\n')}\n${result.deployment}`);
  } catch (error) { setPublicationStatus(error.message); }
}

/* ── Wiring ──────────────────────────────────────────────────── */

$('search').addEventListener('input', renderList);
const filters = [...document.querySelectorAll('[data-filter]')];
for (const button of filters) {
  button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    setPressed(filters, button);
    renderList();
  });
}
$('new-article').addEventListener('click', startNewDraft);
$('overview-new').addEventListener('click', startNewDraft);
$('close-new').addEventListener('click', () => $('new-dialog').close());
$('cancel-new').addEventListener('click', () => $('new-dialog').close());
$('new-form').addEventListener('submit', openNewDraft);
$('close-history').addEventListener('click', () => $('history-dialog').close());
$('history-button').addEventListener('click', () => openHistory().catch((error) => showNotice(error.message, true)));
$('save-button').addEventListener('click', () => saveDraft(false));
$('body').addEventListener('input', markDirty);
for (const field of Object.values(fields)) {
  field.addEventListener('input', () => {
    $('editor-title').textContent = fields.title.value || state.active?.path.split('/').at(-1) || 'Article title';
    if (field === fields.thumbnail || field === fields.heroAlt) renderThumbnail();
    markDirty();
  });
}
$('restore-source').addEventListener('click', () => {
  if (!state.active) return;
  const parsed = parseFrontmatter(state.original);
  state.frontmatter = parsed.block;
  state.frontmatterPrefix = parsed.prefix;
  state.body = parsed.body;
  state.document = state.savedDocument ? structuredClone(state.savedDocument) : null;
  visual.load(state.document || emptyDocument());
  $('body').value = parsed.body;
  setFields(parsed.metadata);
  setMode(!!state.document);
  state.initialFields = getFields();
  state.dirty = false;
  updateCounts();
  setSaveState(state.version ? `Version ${state.version} restored in editor` : 'Loaded source restored', 'saved');
});
const titleForPath = (path) => state.articles.find((article) => article.path === path)?.title || null;
const dashboard = mountDashboard({
  api, showNotice, titleForPath,
  // Cloudflare reports the request path, which may be percent-encoded.
  titleFor: (urlPath) => {
    let id = urlPath;
    try { id = decodeURIComponent(urlPath); } catch { /* keep the raw path */ }
    id = id.replace(/^\/blogs\//, '').replace(/\/$/, '');
    return state.articles.find((article) => articleId(article.path) === id)?.title || null;
  },
  openArticle: (path) => { dashboard.go('writing'); openArticle(path); }
});
for (const link of [$('back-link'), $('nav-overview'), document.querySelector('.brand')]) {
  link.addEventListener('click', async (event) => {
    event.preventDefault();
    // From another tab, Writing returns to whatever was open there.
    const elsewhere = dashboard.current() !== 'writing';
    dashboard.go('writing');
    if (elsewhere && link === $('nav-overview')) return;
    if (!state.active) return;
    if (await leaveIfSaved()) leaveEditor();
  });
}
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveDraft(false);
  }
});
window.addEventListener('beforeunload', (event) => { if (state.dirty) event.preventDefault(); });
$('visual-mode').addEventListener('click', () => setMode(true));
$('source-mode').addEventListener('click', () => setMode(false));
$('resolve-conflict').addEventListener('click', openConflict);
$('close-conflict').addEventListener('click', () => $('conflict-dialog').close());
$('adopt-private-version').addEventListener('click', () => adoptReviewedVersion(false));
$('adopt-public-base').addEventListener('click', () => adoptReviewedVersion(true));
$('duplicate-button').addEventListener('click', duplicate);
$('archive-button').addEventListener('click', toggleArchive);
$('preview-button').addEventListener('click', openPreview);
$('close-preview').addEventListener('click', () => $('preview-dialog').close());
$('preview-width').addEventListener('change', () => { $('rendered-preview').dataset.width = $('preview-width').value; });
$('preview-theme').addEventListener('click', togglePreviewTheme);
$('preview-content').addEventListener('click', (event) => {
  const link = event.target.closest('[data-note]');
  if (!link) return;
  event.preventDefault();
  $('note-content').replaceChildren($(`note-${link.dataset.note}`).cloneNode(true));
  $('note-dialog').showModal();
});
$('close-note').addEventListener('click', () => $('note-dialog').close());
$('media-button').addEventListener('click', openMedia);
$('close-media').addEventListener('click', () => $('media-dialog').close());
$('media-form').addEventListener('submit', uploadMediaFile);
$('publish-button').addEventListener('click', () => {
  preparedJob = null;
  $('confirm-publication').disabled = true;
  $('publication-source').textContent = 'Prepare a saved version to see the exact source.';
  $('confirm-path').value = '';
  $('publication-dialog').showModal();
});
$('close-publication').addEventListener('click', () => $('publication-dialog').close());
$('git-history-button').addEventListener('click', readGitHistory);
$('prepare-publication').addEventListener('click', preparePublication);
$('confirm-publication').addEventListener('click', confirmPublication);
$('cancel-publication').addEventListener('click', cancelPublication);
$('publication-jobs').addEventListener('click', listPublicationJobs);
$('publication-checks').addEventListener('click', checkPublication);
window.addEventListener('offline', () => showNotice('Connection lost. Keep this page open; your edits have not been saved.', true));
window.addEventListener('online', () => { if (state.dirty) saveDraft(true); });

$('overview-date').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
renderSetup();
api('/api/config').then((config) => {
  state.config = config;
  $('publish-button').disabled = !config.publishing;
  $('media-button').disabled = !config.media;
  renderSetup();
}).catch(() => {});
fetch('/artwork.json').then((response) => response.ok ? response.json() : {}).then((artwork) => { state.artwork = artwork; renderList(); }).catch(() => {});
loadArticles();
