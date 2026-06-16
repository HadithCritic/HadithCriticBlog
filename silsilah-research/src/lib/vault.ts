import type { Citation } from '../components/citations/citationTypes';
import type { IsnadDiagram } from '../components/isnad/isnadTypes';
import type { ProjectSnapshot, VaultFile } from './files';
import { isCitationPath } from './files';
import { sampleCitations, sampleFiles, sampleProject } from './sampleVault';

const browserFiles: Record<string, string> = { ...sampleFiles };

function isTauriRuntime() {
  return typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);
}

async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

function listBrowserFiles(): VaultFile[] {
  const directories = new Set<string>();
  const files: VaultFile[] = [];

  for (const path of Object.keys(browserFiles)) {
    const parts = path.split('/');
    parts.slice(0, -1).forEach((_, index) => {
      directories.add(parts.slice(0, index + 1).join('/'));
    });
    files.push({
      path,
      name: parts.at(-1) ?? path,
      kind: 'file',
      extension: path.endsWith('.isnad.json') ? '.isnad.json' : path.slice(path.lastIndexOf('.')),
    });
  }

  return [
    ...Array.from(directories)
      .sort()
      .map((path) => ({
        path,
        name: path.split('/').at(-1) ?? path,
        kind: 'directory' as const,
      })),
    ...files.sort((a, b) => a.path.localeCompare(b.path)),
  ];
}

export async function openProject(): Promise<ProjectSnapshot> {
  if (isTauriRuntime()) {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Open SilsilahResearch Project',
    });
    if (!selected || Array.isArray(selected)) {
      throw new Error('No project folder selected.');
    }
    return invokeCommand<ProjectSnapshot>('open_project_folder', { path: selected });
  }

  return {
    project: sampleProject,
    files: listBrowserFiles(),
  };
}

export async function getInitialProject(): Promise<ProjectSnapshot> {
  if (isTauriRuntime()) {
    return openProject();
  }

  return {
    project: sampleProject,
    files: listBrowserFiles(),
  };
}

export async function listFiles(): Promise<VaultFile[]> {
  if (isTauriRuntime()) {
    return invokeCommand<VaultFile[]>('list_files');
  }

  return listBrowserFiles();
}

export async function readFile(path: string): Promise<string> {
  if (isTauriRuntime()) {
    return invokeCommand<string>('read_file', { path });
  }

  return browserFiles[path] ?? '';
}

export async function writeFile(path: string, contents: string): Promise<void> {
  if (isTauriRuntime()) {
    await invokeCommand('write_file', { path, contents });
    return;
  }

  browserFiles[path] = contents;
}

export async function createFile(path: string, contents: string): Promise<VaultFile[]> {
  if (isTauriRuntime()) {
    await invokeCommand('create_file', { path, contents });
    return listFiles();
  }

  browserFiles[path] = contents;
  return listBrowserFiles();
}

export async function createFolder(path: string): Promise<VaultFile[]> {
  if (isTauriRuntime()) {
    await invokeCommand('create_folder', { path });
    return listFiles();
  }

  const normalized = path.replace(/\/$/, '');
  browserFiles[`${normalized}/.keep`] = '';
  return listBrowserFiles();
}

export async function readCitations(files: VaultFile[]): Promise<Citation[]> {
  const citationFile = files.find((file) => file.kind === 'file' && isCitationPath(file.path));
  if (!citationFile) {
    return sampleCitations;
  }

  try {
    return JSON.parse(await readFile(citationFile.path)) as Citation[];
  } catch {
    return [];
  }
}

export async function readIsnad(path: string): Promise<IsnadDiagram> {
  return JSON.parse(await readFile(path)) as IsnadDiagram;
}

export async function writeIsnad(path: string, diagram: IsnadDiagram): Promise<void> {
  await writeFile(path, JSON.stringify(diagram, null, 2));
}

export async function exportMarkdown(path: string): Promise<string> {
  if (isTauriRuntime()) {
    return invokeCommand<string>('export_markdown', { path });
  }

  return browserFiles[path] ?? '';
}
