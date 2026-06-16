import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Citation } from '../components/citations/citationTypes';
import { Editor, type EditorHandle } from '../components/editor/Editor';
import { MarkdownPreview } from '../components/editor/MarkdownPreview';
import { HadithInsertModal } from '../components/hadith/HadithInsertModal';
import { IsnadEditor } from '../components/isnad/IsnadEditor';
import type { IsnadDiagram } from '../components/isnad/isnadTypes';
import { AppShell } from '../components/layout/AppShell';
import { ResearchPanel } from '../components/layout/ResearchPanel';
import { NewFileModal } from '../components/files/NewFileModal';
import type { ProjectInfo, VaultFile } from '../lib/files';
import { fileNameFromPath, isIsnadPath, isMarkdownPath } from '../lib/files';
import { downloadTextFile, normalizeExportName } from '../lib/export';
import { makeFootnoteSnippet, makeQuranSnippet } from '../lib/markdown';
import {
  createFile,
  exportMarkdown,
  getInitialProject,
  listFiles,
  openProject,
  readCitations,
  readFile,
  readIsnad,
  writeFile,
  writeIsnad,
} from '../lib/vault';

type WorkspaceMode = 'split' | 'editor' | 'preview';
type ResearchTab = 'outline' | 'citations' | 'properties';

export default function App() {
  const editorRef = useRef<EditorHandle | null>(null);
  const [project, setProject] = useState<ProjectInfo>({ name: 'SilsilahResearch', createdAt: '', version: '0.1.0' });
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [activePath, setActivePath] = useState<string>();
  const [documentText, setDocumentText] = useState('');
  const [diagram, setDiagram] = useState<IsnadDiagram | null>(null);
  const [dirty, setDirty] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('split');
  const [researchTab, setResearchTab] = useState<ResearchTab>('outline');
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [hadithModalOpen, setHadithModalOpen] = useState(false);
  const [status, setStatus] = useState('Ready');

  const activeIsMarkdown = Boolean(activePath && isMarkdownPath(activePath));
  const activeIsIsnad = Boolean(activePath && isIsnadPath(activePath));

  const loadFile = useCallback(async (path: string) => {
    if (dirty && !window.confirm('Discard unsaved changes and open another file?')) {
      return;
    }

    setActivePath(path);
    setStatus(`Opened ${path}`);
    if (isIsnadPath(path)) {
      setDiagram(await readIsnad(path));
      setDocumentText('');
    } else {
      setDocumentText(await readFile(path));
      setDiagram(null);
    }
    setDirty(false);
  }, [dirty]);

  useEffect(() => {
    async function boot() {
      const snapshot = await getInitialProject();
      setProject(snapshot.project);
      setFiles(snapshot.files);
      setCitations(await readCitations(snapshot.files));
      const firstDraft = snapshot.files.find((file) => file.kind === 'file' && file.path === 'drafts/paper.md');
      const firstMarkdown = firstDraft ?? snapshot.files.find((file) => file.kind === 'file' && isMarkdownPath(file.path));
      if (firstMarkdown) {
        setActivePath(firstMarkdown.path);
        setDocumentText(await readFile(firstMarkdown.path));
      }
    }

    boot().catch((error) => setStatus(error instanceof Error ? error.message : 'Unable to open project.'));
  }, []);

  const refreshFiles = useCallback(async () => {
    const nextFiles = await listFiles();
    setFiles(nextFiles);
    setCitations(await readCitations(nextFiles));
  }, []);

  const saveActiveFile = useCallback(async () => {
    if (!activePath) return;

    if (activeIsIsnad && diagram) {
      await writeIsnad(activePath, diagram);
    } else {
      await writeFile(activePath, documentText);
    }
    setDirty(false);
    setStatus(`Saved ${activePath}`);
    await refreshFiles();
  }, [activeIsIsnad, activePath, diagram, documentText, refreshFiles]);

  async function handleOpenProject() {
    try {
      const snapshot = await openProject();
      setProject(snapshot.project);
      setFiles(snapshot.files);
      setCitations(await readCitations(snapshot.files));
      const firstMarkdown = snapshot.files.find((file) => file.kind === 'file' && isMarkdownPath(file.path));
      if (firstMarkdown) {
        setActivePath(firstMarkdown.path);
        setDocumentText(await readFile(firstMarkdown.path));
        setDiagram(null);
      }
      setDirty(false);
      setStatus(`Opened ${snapshot.project.name}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Project open cancelled.');
    }
  }

  function insertText(text: string) {
    if (!activeIsMarkdown) {
      setStatus('Open a Markdown draft before inserting text.');
      return;
    }
    editorRef.current?.insertText(text);
  }

  function handleInsertCitation(citation: Citation, page?: string) {
    insertText(`[[cite:${citation.id}${page ? `:${page}` : ''}]]`);
    setResearchTab('citations');
  }

  async function handleCreateFile(path: string, contents: string) {
    const nextFiles = await createFile(path, contents);
    setFiles(nextFiles);
    setCitations(await readCitations(nextFiles));
    await loadFile(path);
  }

  async function handleExportMarkdown() {
    if (!activePath || !activeIsMarkdown) {
      setStatus('Open a Markdown draft before exporting.');
      return;
    }

    const contents = await exportMarkdown(activePath);
    if (contents) {
      downloadTextFile(normalizeExportName(activePath), contents, 'text/markdown;charset=utf-8');
    }
    setStatus(`Exported ${fileNameFromPath(activePath)}`);
  }

  function handleInsertDiagram() {
    insertText('\n![Isnad diagram](diagrams/bukhari-2487.svg)\n');
  }

  function handleInsertDiagramReference() {
    const diagramPath = activePath ? activePath.replace(/\.isnad\.json$/i, '.svg') : 'diagrams/isnad-diagram.svg';
    setStatus(`Diagram reference ready: ![Isnad diagram](${diagramPath})`);
  }

  const researchDocument = useMemo(() => (activeIsMarkdown ? documentText : ''), [activeIsMarkdown, documentText]);

  return (
    <AppShell
      projectName={project.name}
      dirty={dirty}
      files={files}
      activePath={activePath}
      onOpenProject={handleOpenProject}
      onNewFile={() => setNewFileOpen(true)}
      onSave={saveActiveFile}
      onExportMarkdown={handleExportMarkdown}
      onSelectFile={loadFile}
      onInsertCitation={() => setResearchTab('citations')}
      onInsertHadith={() => setHadithModalOpen(true)}
      onInsertQuran={() => insertText(makeQuranSnippet())}
      onInsertDiagram={handleInsertDiagram}
      onInsertFootnote={() => insertText(makeFootnoteSnippet())}
      researchPanel={
        <ResearchPanel
          activeTab={researchTab}
          documentText={researchDocument}
          citations={citations}
          onTabChange={setResearchTab}
          onInsertCitation={handleInsertCitation}
        />
      }
    >
      <section className="sr-workspace-toolbar">
        <div>
          <strong>{activePath ? fileNameFromPath(activePath) : 'No file selected'}</strong>
          <span>{activePath || 'Open or create a file to begin.'}</span>
        </div>
        {activeIsMarkdown ? (
          <div className="sr-segmented" role="tablist" aria-label="Editor view">
            {(['editor', 'split', 'preview'] as const).map((mode) => (
              <button
                key={mode}
                className={workspaceMode === mode ? 'is-active' : ''}
                onClick={() => setWorkspaceMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {activeIsIsnad && diagram ? (
        <IsnadEditor
          diagram={diagram}
          onChange={(nextDiagram) => {
            setDiagram(nextDiagram);
            setDirty(true);
          }}
          onSave={saveActiveFile}
          onInsertReference={handleInsertDiagramReference}
        />
      ) : null}

      {activeIsMarkdown ? (
        <div className={`sr-document-surface sr-document-surface--${workspaceMode}`}>
          {workspaceMode !== 'preview' ? (
            <Editor
              ref={editorRef}
              value={documentText}
              onChange={(value) => {
                setDocumentText(value);
                setDirty(true);
              }}
              onSave={saveActiveFile}
            />
          ) : null}
          {workspaceMode !== 'editor' ? <MarkdownPreview source={documentText} citations={citations} /> : null}
        </div>
      ) : null}

      {!activePath ? <div className="sr-empty-workspace">Open a project or create a draft to begin.</div> : null}

      <footer className="sr-statusbar">{status}</footer>

      <NewFileModal open={newFileOpen} onClose={() => setNewFileOpen(false)} onCreate={handleCreateFile} />
      <HadithInsertModal open={hadithModalOpen} onClose={() => setHadithModalOpen(false)} onInsert={insertText} />
    </AppShell>
  );
}
