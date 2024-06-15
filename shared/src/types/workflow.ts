import { CustomComponent, PopulatedComponent, PopulatedCustomComponent } from './components';

/** Neighboring edges of a node */
export interface Adjacency {
  /** Incoming edges (ids) */
  in: string[];
  /** Outgoing edges (ids) */
  out: string[];
}

/** Edge connecting two nodes */
export interface Edge {
  /** Node(id) the edge is starting from */
  source: string;
  /** Node(id) the edge points to */
  target: string;
}

/** data of a single node */
export type Node = PopulatedComponent | PopulatedCustomComponent;

/** Workflow representation in the frontend */
export interface Workflow {
  name?: string;
  adjacencies: Map<string, Adjacency>;
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
}

/**
 * Workflow saved in the database or local storage
 */
export interface SavedWorkflow {
  name: string;
  id: string; // assigned by db or frontend
  adjacencies: { id: string; data: Adjacency }[];
  nodes: { id: string; componentId: string }[];
  customNodes: { id: string; data: CustomComponent }[];
  edges: { id: string; data: Edge }[];
}
