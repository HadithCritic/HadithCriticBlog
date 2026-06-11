import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import {
  Bold,
  BookOpen,
  Copy,
  Eye,
  FilePlus2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  RefreshCw,
  Save,
  Send,
  Table2,
  Trash2,
} from 'lucide-react';

import {
  ClaimBoxNode,
  ContextNoteNode,
  HadithBlockNode,
  QuranVerseNode,
  VerdictBoxNode,
} from './editorExtensions';

type DraftMeta = {
  title: string;
  slug: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  thumbnail: string;
  heroAlt: string;
  readingTime: string;
  author: string;
};

type Draft = {
  id: string;
  createdAt: string;
  updatedAt: string;
  meta: DraftMeta;
  content: JSONContent;
};

type DraftSummary = {
  id: string;
  title: string;
  slug: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const GENERIC_THUMB = '/images/blog_thumbnails/tn.generic.png';
const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

function App() {
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [active, setActive] = useState<Draft | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready');
  const [busy, setBusy] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const loadedDraftId = useRef<string | null>(null);
  const imageInput = useRef<HTMLInputElement | null>(null);
  const thumbnailInput = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        allowBase64: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Write the article body here...',
      }),
      HadithBlockNode,
      ClaimBoxNode,
      ContextNoteNode,
      VerdictBoxNode,
      QuranVerseNode,
    ],
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        class: 'editor-prose',
      },
    },
    onUpdate: ({ editor }) => {
      setActive((current) => (current ? { ...current, content: editor.getJSON() } : current));
    },
  });

  useEffect(() => {
    loadConfig();
    loadDrafts();
  }, []);

  useEffect(() => {
    if (!editor || !active || loadedDraftId.current === active.id) return;
    editor.commands.setContent(active.content || EMPTY_DOC);
    loadedDraftId.current = active.id;
  }, [active, editor]);

  const currentDate = useMemo(() => toDateTimeLocal(active?.meta.date), [active?.meta.date]);
  const tagText = useMemo(() => (active?.meta.tags ?? []).join(', '), [active?.meta.tags]);

  async function loadConfig() {
    const data = await request('/config');
    setCategories(data.categories ?? []);
  }

  async function loadDrafts() {
    const data = await request('/drafts');
    setDrafts(data.drafts ?? []);
  }

  async function createDraft() {
    await runTask('Creating draft...', async () => {
      const data = await request('/drafts', { method: 'POST', body: {} });
      setDrafts((items) => [summarize(data.draft), ...items]);
      setActive(data.draft);
      loadedDraftId.current = null;
      setOverwrite(false);
    });
  }

  async function selectDraft(id: string) {
    await runTask('Loading draft...', async () => {
      const data = await request(`/drafts/${id}`);
      setActive(data.draft);
      loadedDraftId.current = null;
      setOverwrite(false);
    });
  }

  async function saveActive() {
    if (!active) return null;
    const data = await request(`/drafts/${active.id}`, {
      method: 'PUT',
      body: active,
    });
    setActive(data.draft);
    setDrafts((items) => upsertSummary(items, summarize(data.draft)));
    return data.draft as Draft;
  }

  async function duplicateActive() {
    if (!active) return;
    await runTask('Duplicating draft...', async () => {
      const data = await request(`/drafts/${active.id}/duplicate`, { method: 'POST', body: {} });
      setDrafts((items) => [summarize(data.draft), ...items]);
      setActive(data.draft);
      loadedDraftId.current = null;
    });
  }

  async function deleteActive() {
    if (!active) return;
    const confirmed = window.confirm(`Delete "${active.meta.title}" from local drafts?`);
    if (!confirmed) return;

    await runTask('Deleting draft...', async () => {
      await request(`/drafts/${active.id}`, { method: 'DELETE' });
      setDrafts((items) => items.filter((draft) => draft.id !== active.id));
      setActive(null);
      loadedDraftId.current = null;
    });
  }

  async function previewActive() {
    if (!active) return;
    await runTask('Generating Astro preview...', async () => {
      await saveActive();
      const data = await request(`/drafts/${active.id}/preview`, { method: 'POST', body: {} });
      window.open(data.url, '_blank', 'noopener,noreferrer');
    });
  }

  async function publishActive() {
    if (!active) return;
    await runTask('Publishing MDX...', async () => {
      await saveActive();
      const data = await request(`/drafts/${active.id}/publish`, {
        method: 'POST',
        body: { overwrite },
      });
      await loadDrafts();
      return `Published ${data.url}`;
    });
  }

  async function uploadInlineImage(file: File) {
    if (!active || !editor) return;
    await runTask('Optimizing image...', async () => {
      const asset = await uploadAsset(active.id, file, 'image');
      editor.chain().focus().setImage({ src: asset.src, alt: file.name }).run();
    });
  }

  async function uploadThumbnail(file: File) {
    if (!active) return;
    await runTask('Optimizing thumbnail...', async () => {
      const asset = await uploadAsset(active.id, file, 'thumbnail');
      updateMeta({
        thumbnail: asset.src,
        heroAlt: active.meta.heroAlt || file.name.replace(/\.[^.]+$/, ''),
      });
    });
  }

  async function uploadAsset(draftId: string, file: File, purpose: 'image' | 'thumbnail') {
    const dataUrl = await fileToDataUrl(file);
    const data = await request(`/drafts/${draftId}/assets`, {
      method: 'POST',
      body: {
        fileName: file.name,
        purpose,
        dataUrl,
      },
    });
    return data.asset;
  }

  function updateMeta(patch: Partial<DraftMeta>) {
    setActive((current) => {
      if (!current) return current;
      const nextMeta = { ...current.meta, ...patch };
      if (patch.title && (!current.meta.slug || current.meta.slug === 'untitled-article')) {
        nextMeta.slug = slugify(patch.title);
      }
      return { ...current, meta: nextMeta };
    });
  }

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', previousUrl || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  function insertComponent(type: string) {
    if (!editor) return;
    const attrs: Record<string, string> = {};
    if (type === 'hadithBlock') {
      attrs.label = 'Report Text';
      attrs.arabic = '';
      attrs.translation = '';
      attrs.source = '';
    }
    if (type === 'claimBox') {
      attrs.title = 'Core Claim';
      attrs.text = '';
    }
    if (type === 'contextNote') {
      attrs.title = 'Historical Context Note';
      attrs.text = '';
    }
    if (type === 'verdictBox') {
      attrs.title = 'Conclusion';
      attrs.text = '';
    }
    if (type === 'quranVerse') {
      attrs.verse = '49:6';
      attrs.label = '';
    }
    editor.chain().focus().insertContent({ type, attrs }).run();
  }

  async function runTask(label: string, task: () => Promise<string | void>) {
    setBusy(true);
    setStatus(label);
    try {
      const nextStatus = await task();
      setStatus(nextStatus || 'Ready');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="maker-shell">
      <aside className="drafts-panel" aria-label="Drafts">
        <div className="brand-lockup">
          <BookOpen size={21} />
          <div>
            <strong>Blog Maker</strong>
            <span>HadithCritic local authoring</span>
          </div>
        </div>

        <div className="draft-actions">
          <button type="button" className="primary-action" onClick={createDraft} disabled={busy}>
            <FilePlus2 size={16} />
            New draft
          </button>
          <button type="button" className="icon-button" title="Refresh drafts" onClick={loadDrafts} disabled={busy}>
            <RefreshCw size={16} />
          </button>
        </div>

        <nav className="draft-list" aria-label="Local drafts">
          {drafts.map((draft) => (
            <button
              key={draft.id}
              type="button"
              className={draft.id === active?.id ? 'draft-row is-active' : 'draft-row'}
              onClick={() => selectDraft(draft.id)}
            >
              <span>{draft.title || 'Untitled Article'}</span>
              <small>{draft.slug || 'no-slug'} - {draft.category}</small>
            </button>
          ))}
          {!drafts.length && <p className="empty-note">No local drafts yet.</p>}
        </nav>
      </aside>

      <section className="workspace" aria-label="Editor">
        <header className="workspace-bar">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <span>{status}</span>
          </div>
          <div className="workspace-actions">
            <button type="button" className="secondary-action" onClick={() => runTask('Saving draft...', async () => { await saveActive(); })} disabled={!active || busy}>
              <Save size={16} />
              Save draft
            </button>
            <button type="button" className="secondary-action" onClick={previewActive} disabled={!active || busy}>
              <Eye size={16} />
              Preview
            </button>
            <button type="button" className="primary-action" onClick={publishActive} disabled={!active || busy}>
              <Send size={16} />
              Publish files
            </button>
          </div>
        </header>

        {!active ? (
          <div className="empty-workspace">
            <h1>Create or select a draft</h1>
            <p>Drafts stay in the private local workspace until you publish them into Astro content.</p>
            <button type="button" className="primary-action" onClick={createDraft}>
              <FilePlus2 size={16} />
              New draft
            </button>
          </div>
        ) : (
          <div className="editor-layout">
            <section className="editor-column" aria-label="Article body">
              <div className="toolbar" aria-label="Formatting toolbar">
                <Tool active={editor?.isActive('bold')} title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()}>
                  <Bold size={16} />
                </Tool>
                <Tool active={editor?.isActive('italic')} title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()}>
                  <Italic size={16} />
                </Tool>
                <Tool active={editor?.isActive('heading', { level: 2 })} title="Heading 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                  <Heading2 size={16} />
                </Tool>
                <Tool active={editor?.isActive('heading', { level: 3 })} title="Heading 3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
                  <Heading3 size={16} />
                </Tool>
                <Tool active={editor?.isActive('bulletList')} title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                  <List size={16} />
                </Tool>
                <Tool active={editor?.isActive('orderedList')} title="Numbered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                  <ListOrdered size={16} />
                </Tool>
                <Tool active={editor?.isActive('blockquote')} title="Quote" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
                  <Quote size={16} />
                </Tool>
                <Tool active={editor?.isActive('link')} title="Link" onClick={setLink}>
                  <LinkIcon size={16} />
                </Tool>
                <Tool title="Insert table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                  <Table2 size={16} />
                </Tool>
                <Tool title="Insert image" onClick={() => imageInput.current?.click()}>
                  <ImagePlus size={16} />
                </Tool>
                <input
                  ref={imageInput}
                  className="sr-only-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) uploadInlineImage(file);
                  }}
                />
              </div>

              <div className="component-toolbar" aria-label="Article components">
                <button type="button" onClick={() => insertComponent('hadithBlock')}>Hadith block</button>
                <button type="button" onClick={() => insertComponent('claimBox')}>Claim box</button>
                <button type="button" onClick={() => insertComponent('contextNote')}>Context note</button>
                <button type="button" onClick={() => insertComponent('verdictBox')}>Verdict box</button>
                <button type="button" onClick={() => insertComponent('quranVerse')}>Quran verse</button>
              </div>

              <div className="editor-surface">
                <EditorContent editor={editor} />
              </div>
            </section>

            <aside className="meta-panel" aria-label="Post settings">
              <div className="meta-panel__header">
                <h2>Post settings</h2>
                <div className="meta-panel__tools">
                  <button type="button" className="icon-button" title="Duplicate draft" onClick={duplicateActive} disabled={busy}>
                    <Copy size={16} />
                  </button>
                  <button type="button" className="icon-button danger" title="Delete draft" onClick={deleteActive} disabled={busy}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <label className="field">
                <span>Title</span>
                <input value={active.meta.title} onChange={(event) => updateMeta({ title: event.target.value })} />
              </label>

              <label className="field">
                <span>Slug</span>
                <input value={active.meta.slug} onChange={(event) => updateMeta({ slug: slugify(event.target.value) })} />
              </label>

              <label className="field">
                <span>Preview text</span>
                <textarea rows={4} value={active.meta.description} onChange={(event) => updateMeta({ description: event.target.value })} />
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>Date</span>
                  <input type="datetime-local" value={currentDate} onChange={(event) => updateMeta({ date: fromDateTimeLocal(event.target.value) })} />
                </label>
                <label className="field">
                  <span>Reading time</span>
                  <input value={active.meta.readingTime} onChange={(event) => updateMeta({ readingTime: event.target.value })} />
                </label>
              </div>

              <label className="field">
                <span>Category</span>
                <input list="category-options" value={active.meta.category} onChange={(event) => updateMeta({ category: event.target.value })} />
                <datalist id="category-options">
                  {categories.map((category) => <option key={category} value={category} />)}
                </datalist>
              </label>

              <label className="field">
                <span>Tags</span>
                <input value={tagText} onChange={(event) => updateMeta({ tags: splitTags(event.target.value) })} />
              </label>

              <label className="field">
                <span>Author</span>
                <input value={active.meta.author} onChange={(event) => updateMeta({ author: event.target.value })} />
              </label>

              <div className="thumbnail-control">
                <div
                  className="thumbnail-preview"
                  style={{ backgroundImage: `url('${active.meta.thumbnail || GENERIC_THUMB}')` }}
                  aria-label="Thumbnail preview"
                />
                <button type="button" className="secondary-action" onClick={() => thumbnailInput.current?.click()}>
                  <ImagePlus size={16} />
                  Upload thumbnail
                </button>
                <input
                  ref={thumbnailInput}
                  className="sr-only-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) uploadThumbnail(file);
                  }}
                />
              </div>

              <label className="field">
                <span>Thumbnail alt text</span>
                <input value={active.meta.heroAlt} onChange={(event) => updateMeta({ heroAlt: event.target.value })} />
              </label>

              <label className="toggle-field">
                <input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} />
                <span>Overwrite existing article with this slug</span>
              </label>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function Tool({
  children,
  title,
  active,
  onClick,
}: {
  children: ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={active ? 'tool-button is-active' : 'tool-button'} title={title} onClick={onClick}>
      {children}
    </button>
  );
}

async function request(path: string, init: { method?: string; body?: unknown } = {}) {
  const response = await fetch(`/api${path}`, {
    method: init.method ?? 'GET',
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(data.errors) ? data.errors.join('\n') : response.statusText;
    throw new Error(message);
  }
  return data;
}

function summarize(draft: Draft): DraftSummary {
  return {
    id: draft.id,
    title: draft.meta.title,
    slug: draft.meta.slug,
    category: draft.meta.category,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  };
}

function upsertSummary(items: DraftSummary[], next: DraftSummary) {
  const filtered = items.filter((item) => item.id !== next.id);
  return [next, ...filtered].sort((a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf());
}

function splitTags(value: string) {
  return value.split(',').map((tag) => tag.trim()).filter(Boolean);
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 90);
}

function toDateTimeLocal(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeLocal(value: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toISOString();
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default App;
