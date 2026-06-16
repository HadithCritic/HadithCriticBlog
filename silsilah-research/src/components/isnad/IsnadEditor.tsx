import { Download, Plus, Trash2 } from 'lucide-react';
import type { IsnadDiagram } from './isnadTypes';
import { Button } from '../ui/Button';
import { SimpleIsnadDiagram } from './SimpleIsnadDiagram';

interface IsnadEditorProps {
  diagram: IsnadDiagram;
  onChange: (diagram: IsnadDiagram) => void;
  onSave: () => void;
  onInsertReference: () => void;
}

export function IsnadEditor({ diagram, onChange, onSave, onInsertReference }: IsnadEditorProps) {
  function updateNode(index: number, key: 'name' | 'verb', value: string) {
    onChange({
      ...diagram,
      nodes: diagram.nodes.map((node, nodeIndex) => (nodeIndex === index ? { ...node, [key]: value } : node)),
    });
  }

  function addNode() {
    const next = diagram.nodes.length + 1;
    onChange({
      ...diagram,
      nodes: [
        ...diagram.nodes,
        {
          id: `node-${next}`,
          name: 'Narrator name',
          verb: 'narrated',
        },
      ],
    });
  }

  function removeNode(index: number) {
    onChange({
      ...diagram,
      nodes: diagram.nodes.filter((_, nodeIndex) => nodeIndex !== index),
    });
  }

  function exportSvg() {
    const svg = buildSvg(diagram);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${diagram.id || 'isnad-diagram'}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="sr-isnad-editor">
      <section className="sr-isnad-form">
        <header>
          <label className="sr-field">
            <span>Diagram title</span>
            <input value={diagram.title} onChange={(event) => onChange({ ...diagram, title: event.target.value })} />
          </label>
          <div className="sr-isnad-form__actions">
            <Button icon={<Plus size={16} />} onClick={addNode}>
              Add Node
            </Button>
            <Button icon={<Download size={16} />} onClick={exportSvg}>
              Export SVG
            </Button>
            <Button onClick={onInsertReference}>Insert Reference</Button>
            <Button variant="primary" onClick={onSave}>
              Save
            </Button>
          </div>
        </header>

        <div className="sr-isnad-node-list">
          {diagram.nodes.map((node, index) => (
            <article className="sr-isnad-node-row" key={node.id}>
              <label className="sr-field">
                <span>Name</span>
                <input value={node.name} onChange={(event) => updateNode(index, 'name', event.target.value)} />
              </label>
              <label className="sr-field">
                <span>Transmission verb</span>
                <input value={node.verb} onChange={(event) => updateNode(index, 'verb', event.target.value)} />
              </label>
              <Button
                variant="icon"
                icon={<Trash2 size={16} />}
                aria-label={`Remove ${node.name}`}
                onClick={() => removeNode(index)}
                disabled={diagram.nodes.length <= 1}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="sr-isnad-preview">
        <h2>{diagram.title}</h2>
        <SimpleIsnadDiagram diagram={diagram} />
      </section>
    </div>
  );
}

function buildSvg(diagram: IsnadDiagram) {
  const width = 720;
  const nodeHeight = 44;
  const gap = 48;
  const padding = 40;
  const height = padding * 2 + diagram.nodes.length * nodeHeight + (diagram.nodes.length - 1) * gap + 54;
  const escape = (value: string) =>
    value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

  const nodes = diagram.nodes
    .map((node, index) => {
      const y = padding + 54 + index * (nodeHeight + gap);
      const arrow = index < diagram.nodes.length - 1
        ? `<text x="${width / 2}" y="${y + nodeHeight + 24}" text-anchor="middle" font-size="16" fill="#6b6257">↓ ${escape(node.verb)}</text>`
        : '';
      return `<rect x="120" y="${y}" width="480" height="${nodeHeight}" rx="8" fill="#f7f1e6" stroke="#d8b166" />
<text x="${width / 2}" y="${y + 28}" text-anchor="middle" font-family="serif" font-size="17" fill="#171412">${escape(node.name)}</text>
${arrow}`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="#fbf8f1"/>
<text x="${width / 2}" y="42" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#171412">${escape(diagram.title)}</text>
${nodes}
</svg>`;
}
