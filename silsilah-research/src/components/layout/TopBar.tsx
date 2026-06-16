import { BookOpen, Download, FilePlus2, FolderOpen, Footprints, Pilcrow, Quote, Save, Search, Settings } from 'lucide-react';
import { SilsilahLogo } from '../brand/SilsilahLogo';
import { Button } from '../ui/Button';

interface TopBarProps {
  projectName: string;
  dirty: boolean;
  onOpenProject: () => void;
  onNewFile: () => void;
  onSave: () => void;
  onExportMarkdown: () => void;
  onInsertCitation: () => void;
  onInsertHadith: () => void;
  onInsertQuran: () => void;
  onInsertDiagram: () => void;
  onInsertFootnote: () => void;
}

export function TopBar({
  projectName,
  dirty,
  onOpenProject,
  onNewFile,
  onSave,
  onExportMarkdown,
  onInsertCitation,
  onInsertHadith,
  onInsertQuran,
  onInsertDiagram,
  onInsertFootnote,
}: TopBarProps) {
  return (
    <header className="sr-topbar">
      <div className="sr-topbar__project">
        <SilsilahLogo className="sr-project-mark" />
        <div>
          <strong>{projectName}</strong>
          <span>{dirty ? 'Unsaved changes' : 'Local vault'}</span>
        </div>
      </div>

      <nav className="sr-topbar__actions" aria-label="Project actions">
        <Button icon={<FolderOpen size={16} />} onClick={onOpenProject}>
          Open Project
        </Button>
        <Button icon={<FilePlus2 size={16} />} onClick={onNewFile}>
          New File
        </Button>
        <Button icon={<Search size={16} />} disabled>
          Search
        </Button>
        <div className="sr-menu">
          <Button icon={<Pilcrow size={16} />}>Insert</Button>
          <div className="sr-menu__content">
            <button onClick={onInsertCitation}>
              <Quote size={15} /> Citation
            </button>
            <button onClick={onInsertHadith}>
              <BookOpen size={15} /> Hadith Block
            </button>
            <button onClick={onInsertQuran}>
              <BookOpen size={15} /> Qur'an Block
            </button>
            <button onClick={onInsertDiagram}>
              <Footprints size={15} /> Isnad Diagram
            </button>
            <button onClick={onInsertFootnote}>
              <Pilcrow size={15} /> Footnote
            </button>
          </div>
        </div>
        <div className="sr-menu">
          <Button icon={<Download size={16} />}>Export</Button>
          <div className="sr-menu__content">
            <button onClick={onExportMarkdown}>
              <Download size={15} /> Markdown
            </button>
            <button disabled>DOCX later</button>
            <button disabled>PDF later</button>
          </div>
        </div>
        <Button icon={<Save size={16} />} variant={dirty ? 'primary' : 'secondary'} onClick={onSave}>
          Save
        </Button>
        <Button icon={<Settings size={16} />} variant="icon" disabled aria-label="Settings" />
      </nav>
    </header>
  );
}
