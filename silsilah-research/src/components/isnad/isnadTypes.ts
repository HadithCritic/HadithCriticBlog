export interface IsnadNode {
  id: string;
  name: string;
  verb: string;
}

export interface IsnadDiagram {
  id: string;
  title: string;
  nodes: IsnadNode[];
}
