export function downloadTextFile(filename: string, contents: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function normalizeExportName(path: string) {
  const name = path.split(/[\\/]/).pop() || 'document.md';
  return name.toLowerCase().endsWith('.md') ? name : `${name}.md`;
}
