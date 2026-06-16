export type FileKind = 'file' | 'directory';

export interface VaultFile {
  path: string;
  name: string;
  kind: FileKind;
  extension?: string;
}

export interface ProjectInfo {
  name: string;
  createdAt: string;
  version: string;
}

export interface ProjectSnapshot {
  project: ProjectInfo;
  files: VaultFile[];
}

export function isMarkdownPath(path: string) {
  return path.toLowerCase().endsWith('.md');
}

export function isIsnadPath(path: string) {
  return path.toLowerCase().endsWith('.isnad.json');
}

export function isCitationPath(path: string) {
  const normalized = path.replaceAll('\\', '/').toLowerCase();
  return normalized === 'citations.json' || normalized.endsWith('/citations.json');
}

export function fileNameFromPath(path: string) {
  return path.split(/[\\/]/).pop() ?? path;
}
