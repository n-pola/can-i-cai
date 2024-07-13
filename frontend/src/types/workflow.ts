import type { Category, Edge, Workflow, Node, ComponentType } from 'cic-shared';

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
  satisfiesMinimalVersion?: boolean;
  group?: string;
};

export type FrontendEdge = Edge & {
  compatible: 'yes' | 'no' | 'partial';
};

/** Coordinates of an Edge to draw on svg plane */
export interface EdgeCoordinates {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

/** Edge with its coordinates after being positioned */
export interface PositionedFrontendEdge extends FrontendEdge {
  coordinates: EdgeCoordinates;
  id: string;
}

/** Active frontend workflow with all required props */
export interface WorkflowStore extends Omit<Workflow, 'nodes' | 'edges'> {
  id: string;
  stateHash: {
    initial: string | null;
    current: string | null;
  };
  nodes: Map<string, FrontendNode>;
  edges: Map<string, FrontendEdge>;
  groups: Map<string, string[]>;
}

/** Item in the list of workflows in the local storage that reference full workflows by id */
export interface WorkflowStorageItem {
  id: string;
  name: string;
  componentCount: number;
  updateAt: number;
}
