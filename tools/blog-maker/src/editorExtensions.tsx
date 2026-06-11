import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

type NodeViewProps = {
  node: {
    attrs: Record<string, string>;
  };
  updateAttributes: (attrs: Record<string, string>) => void;
  deleteNode: () => void;
};

function Field({
  label,
  value,
  onChange,
  multiline = false,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  dir?: 'rtl' | 'ltr';
}) {
  return (
    <label className="component-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value || ''} dir={dir} onChange={(event) => onChange(event.target.value)} rows={4} />
      ) : (
        <input value={value || ''} dir={dir} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ComponentShell({
  label,
  children,
  deleteNode,
}: {
  label: string;
  children: ReactNode;
  deleteNode: () => void;
}) {
  return (
    <NodeViewWrapper className="component-node" data-drag-handle>
      <div className="component-node__head">
        <strong>{label}</strong>
        <button type="button" className="icon-button" title="Remove block" onClick={deleteNode}>
          <Trash2 size={15} />
        </button>
      </div>
      <div className="component-node__grid">{children}</div>
    </NodeViewWrapper>
  );
}

function HadithBlockView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  return (
    <ComponentShell label="Hadith block" deleteNode={deleteNode}>
      <Field label="Label" value={node.attrs.label} onChange={(label) => updateAttributes({ label })} />
      <Field label="Arabic" value={node.attrs.arabic} dir="rtl" multiline onChange={(arabic) => updateAttributes({ arabic })} />
      <Field label="Translation" value={node.attrs.translation} multiline onChange={(translation) => updateAttributes({ translation })} />
      <Field label="Source" value={node.attrs.source} onChange={(source) => updateAttributes({ source })} />
    </ComponentShell>
  );
}

function PanelBlockView({ node, updateAttributes, deleteNode, label }: NodeViewProps & { label: string }) {
  return (
    <ComponentShell label={label} deleteNode={deleteNode}>
      <Field label="Title" value={node.attrs.title} onChange={(title) => updateAttributes({ title })} />
      <Field label="Text" value={node.attrs.text} multiline onChange={(text) => updateAttributes({ text })} />
    </ComponentShell>
  );
}

function QuranVerseView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  return (
    <ComponentShell label="Quran verse" deleteNode={deleteNode}>
      <Field label="Verse reference" value={node.attrs.verse} onChange={(verse) => updateAttributes({ verse })} />
      <Field label="Optional label" value={node.attrs.label} onChange={(label) => updateAttributes({ label })} />
    </ComponentShell>
  );
}

export const HadithBlockNode = Node.create({
  name: 'hadithBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      label: { default: 'Report Text' },
      arabic: { default: '' },
      translation: { default: '' },
      source: { default: '' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="hadith-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'hadith-block' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(HadithBlockView);
  },
});

function panelNode(name: string, label: string, defaultTitle: string) {
  return Node.create({
    name,
    group: 'block',
    atom: true,
    draggable: true,
    addAttributes() {
      return {
        title: { default: defaultTitle },
        text: { default: '' },
      };
    },
    parseHTML() {
      return [{ tag: `div[data-type="${name}"]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes, { 'data-type': name })];
    },
    addNodeView() {
      return ReactNodeViewRenderer((props) => <PanelBlockView {...props} label={label} />);
    },
  });
}

export const ClaimBoxNode = panelNode('claimBox', 'Claim box', 'Core Claim');
export const ContextNoteNode = panelNode('contextNote', 'Context note', 'Historical Context Note');
export const VerdictBoxNode = panelNode('verdictBox', 'Verdict box', 'Conclusion');

export const QuranVerseNode = Node.create({
  name: 'quranVerse',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      verse: { default: '49:6' },
      label: { default: '' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="quran-verse"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'quran-verse' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(QuranVerseView);
  },
});
