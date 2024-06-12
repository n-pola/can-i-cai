import type { Category, Edge, Workflow, Node } from 'cic-shared';

export type ComponentType = 'component' | 'custom' | 'external-image';

/** Additional category not provided by backend, as it as custom logic in frontend */
export type AdditionalCategory = Omit<Category, 'id'> & { type: ComponentType };

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FrontendNode = Node & {
  boundingBox: BoundingBox;
};

export type FrontendEdge = Edge & {
  compatible: boolean;
};

export interface WorkflowStore extends Omit<Workflow, 'nodes' | 'edges'> {
  id: string;
  nodes: Map<string, FrontendNode>;
  edges: Map<string, FrontendEdge>;
}
