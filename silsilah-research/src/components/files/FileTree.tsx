import { BookText, FileCode2, FileJson, Folder, GitBranch, StickyNote } from 'lucide-react';
import type { VaultFile } from '../../lib/files';
import { isIsnadPath, isMarkdownPath } from '../../lib/files';

interface FileTreeProps {
  files: VaultFile[];
  activePath?: string;
  onSelectFile: (path: string) => void;
}

function iconFor(path: string, kind: VaultFile['kind']) {
  if (kind === 'directory') return <Folder size={15} />;
  if (isIsnadPath(path)) return <GitBranch size={15} />;
  if (isMarkdownPath(path)) return path.includes('notes/') ? <StickyNote size={15} /> : <BookText size={15} />;
  if (path.endsWith('.json')) return <FileJson size={15} />;
  return <FileCode2 size={15} />;
}

function groupLabel(path: string) {
  if (path === 'drafts') return 'Drafts';
  if (path === 'notes') return 'Notes';
  if (path === 'sources') return 'Sources';
  if (path === 'diagrams') return 'Diagrams';
  if (path === 'exports') return 'Exports';
  return path.split('/').at(-1) ?? path;
}

export function FileTree({ files, activePath, onSelectFile }: FileTreeProps) {
  const visibleFiles = files.filter((file) => file.name !== '.keep');
  const directories = visibleFiles.filter((file) => file.kind === 'directory').sort((a, b) => a.path.localeCompare(b.path));
  const rootFiles = visibleFiles.filter((file) => file.kind === 'file' && !file.path.includes('/')).sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className="sr-file-tree">
      {directories.map((directory) => {
        const children = visibleFiles
          .filter((file) => file.kind === 'file' && file.path.startsWith(`${directory.path}/`))
          .sort((a, b) => a.path.localeCompare(b.path));

        if (children.length === 0) return null;

        return (
          <section className="sr-file-group" key={directory.path}>
            <div className="sr-file-group__label">
              {iconFor(directory.path, directory.kind)}
              <span>{groupLabel(directory.path)}</span>
            </div>
            {children.map((file) => (
              <button
                key={file.path}
                className={`sr-file-item ${activePath === file.path ? 'is-active' : ''}`}
                onClick={() => onSelectFile(file.path)}
              >
                {iconFor(file.path, file.kind)}
                <span>{file.name}</span>
              </button>
            ))}
          </section>
        );
      })}

      {rootFiles.length ? (
        <section className="sr-file-group">
          <div className="sr-file-group__label">
            <Folder size={15} />
            <span>Project</span>
          </div>
          {rootFiles.map((file) => (
            <button
              key={file.path}
              className={`sr-file-item ${activePath === file.path ? 'is-active' : ''}`}
              onClick={() => onSelectFile(file.path)}
            >
              {iconFor(file.path, file.kind)}
              <span>{file.name}</span>
            </button>
          ))}
        </section>
      ) : null}
    </div>
  );
}
