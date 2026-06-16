import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { indentWithTab } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { editorExtensions } from './editorExtensions';

export interface EditorHandle {
  insertText: (text: string) => void;
  focus: () => void;
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor({ value, onChange, onSave }, ref) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onChangeRef.current = onChange;
    onSaveRef.current = onSave;
  }, [onChange, onSave]);

  useEffect(() => {
    if (!hostRef.current) return;

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          ...editorExtensions,
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            spellcheck: 'true',
            autocorrect: 'off',
            autocapitalize: 'off',
          }),
          keymap.of([
            {
              key: 'Mod-s',
              run: () => {
                onSaveRef.current();
                return true;
              },
            },
            indentWithTab,
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }, [value]);

  useImperativeHandle(ref, () => ({
    insertText(text: string) {
      const view = viewRef.current;
      if (!view) return;
      const range = view.state.selection.main;
      view.dispatch({
        changes: { from: range.from, to: range.to, insert: text },
        selection: { anchor: range.from + text.length },
      });
      view.focus();
    },
    focus() {
      viewRef.current?.focus();
    },
  }));

  return <div className="sr-editor" ref={hostRef} />;
});
