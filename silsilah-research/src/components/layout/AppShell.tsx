import type { ReactNode } from 'react';
import type { VaultFile } from '../../lib/files';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  projectName: string;
  dirty: boolean;
  files: VaultFile[];
  activePath?: string;
  children: ReactNode;
  researchPanel: ReactNode;
  onOpenProject: () => void;
  onNewFile: () => void;
  onSave: () => void;
  onExportMarkdown: () => void;
  onSelectFile: (path: string) => void;
  onInsertCitation: () => void;
  onInsertHadith: () => void;
  onInsertQuran: () => void;
  onInsertDiagram: () => void;
  onInsertFootnote: () => void;
}

export function AppShell({
  projectName,
  dirty,
  files,
  activePath,
  children,
  researchPanel,
  onOpenProject,
  onNewFile,
  onSave,
  onExportMarkdown,
  onSelectFile,
  onInsertCitation,
  onInsertHadith,
  onInsertQuran,
  onInsertDiagram,
  onInsertFootnote,
}: AppShellProps) {
  return (
    <div className="sr-app-shell">
      <TopBar
        projectName={projectName}
        dirty={dirty}
        onOpenProject={onOpenProject}
        onNewFile={onNewFile}
        onSave={onSave}
        onExportMarkdown={onExportMarkdown}
        onInsertCitation={onInsertCitation}
        onInsertHadith={onInsertHadith}
        onInsertQuran={onInsertQuran}
        onInsertDiagram={onInsertDiagram}
        onInsertFootnote={onInsertFootnote}
      />
      <div className="sr-app-shell__body">
        <Sidebar files={files} activePath={activePath} onSelectFile={onSelectFile} />
        <main className="sr-main-workspace">{children}</main>
        {researchPanel}
      </div>
    </div>
  );
}
