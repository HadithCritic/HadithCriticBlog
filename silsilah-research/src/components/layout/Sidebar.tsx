import type { VaultFile } from '../../lib/files';
import { FileTree } from '../files/FileTree';

interface SidebarProps {
  files: VaultFile[];
  activePath?: string;
  onSelectFile: (path: string) => void;
}

export function Sidebar({ files, activePath, onSelectFile }: SidebarProps) {
  return (
    <aside className="sr-sidebar">
      <div className="sr-sidebar__head">
        <span>Project Files</span>
      </div>
      <FileTree files={files} activePath={activePath} onSelectFile={onSelectFile} />
    </aside>
  );
}
