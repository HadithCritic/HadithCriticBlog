import { useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface NewFileModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (path: string, contents: string) => Promise<void>;
}

const starters = {
  draft: {
    folder: 'drafts',
    extension: '.md',
    contents: `---
title: "Untitled Draft"
type: "paper"
created: "2026-06-16"
updated: "2026-06-16"
---

# Untitled Draft

`,
  },
  note: {
    folder: 'notes',
    extension: '.md',
    contents: `---
title: "Untitled Note"
type: "note"
created: "2026-06-16"
updated: "2026-06-16"
---

# Untitled Note

`,
  },
  isnad: {
    folder: 'diagrams',
    extension: '.isnad.json',
    contents: JSON.stringify(
      {
        id: 'diagram-new',
        title: 'New Isnad Diagram',
        nodes: [{ id: 'narrator-1', name: 'Narrator name', verb: 'narrated' }],
      },
      null,
      2,
    ),
  },
};

export function NewFileModal({ open, onClose, onCreate }: NewFileModalProps) {
  const [kind, setKind] = useState<keyof typeof starters>('draft');
  const [name, setName] = useState('untitled');
  const [creating, setCreating] = useState(false);

  const path = useMemo(() => {
    const starter = starters[kind];
    const normalizedName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${starter.folder}/${normalizedName || 'untitled'}${starter.extension}`;
  }, [kind, name]);

  async function submit() {
    setCreating(true);
    try {
      await onCreate(path, starters[kind].contents);
      onClose();
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal
      open={open}
      title="New File"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={creating}>
            Create
          </Button>
        </>
      }
    >
      <label className="sr-field">
        <span>Type</span>
        <select value={kind} onChange={(event) => setKind(event.target.value as keyof typeof starters)}>
          <option value="draft">Draft</option>
          <option value="note">Note</option>
          <option value="isnad">Isnad diagram</option>
        </select>
      </label>
      <label className="sr-field">
        <span>Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <p className="sr-modal__hint">{path}</p>
    </Modal>
  );
}
