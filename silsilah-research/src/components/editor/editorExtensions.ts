import { markdown } from '@codemirror/lang-markdown';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';

export const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--sr-editor)',
    color: 'var(--sr-editor-ink)',
  },
  '.cm-scroller': {
    fontFamily: 'var(--sr-writing-font)',
    lineHeight: '1.72',
  },
  '.cm-content': {
    padding: '28px 34px 44px',
    minHeight: '100%',
    caretColor: 'var(--sr-editor-ink)',
    unicodeBidi: 'plaintext',
  },
  '.cm-line': {
    maxWidth: '76ch',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--sr-editor)',
    color: 'oklch(55% 0.012 78)',
    borderRight: '1px solid oklch(85% 0.022 80)',
  },
  '.cm-activeLine': {
    backgroundColor: 'oklch(91% 0.026 82)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'oklch(89% 0.025 82)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'oklch(78% 0.08 214 / 0.24)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
});

export const editorExtensions = [markdown(), syntaxHighlighting(defaultHighlightStyle), editorTheme];
