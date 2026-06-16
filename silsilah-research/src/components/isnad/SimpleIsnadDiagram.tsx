import type { IsnadDiagram } from './isnadTypes';

interface SimpleIsnadDiagramProps {
  diagram: IsnadDiagram;
}

export function SimpleIsnadDiagram({ diagram }: SimpleIsnadDiagramProps) {
  return (
    <div className="sr-isnad-chain" aria-label={diagram.title}>
      {diagram.nodes.map((node, index) => (
        <div className="sr-isnad-chain__step" key={node.id}>
          <div className="sr-isnad-chain__node">{node.name}</div>
          {index < diagram.nodes.length - 1 ? (
            <div className="sr-isnad-chain__verb">
              <span aria-hidden="true">↓</span>
              <em>{node.verb}</em>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
