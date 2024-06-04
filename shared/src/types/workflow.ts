import { ObjectId } from 'mongoose';
import { PopulatedComponent, PopulatedCustomComponent } from './components';

/** Neighboring edges of a node */
interface Adjacency {
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

/** Workflow representation in the frontend */
export interface Workflow {
  name?: string;
  adjacencies: Map<string, Adjacency>;
  nodes: Map<string, PopulatedComponent | PopulatedCustomComponent>;
  edges: Map<string, Edge>;
}

/**
 * Workflow saved in the database or local storage
 * 2d array due to parsing of maps to arrays in JSON
 */
export interface SavedWorkflow {
  name: string;
  id: string; // assigned by db or frontend
  adjacencies: [id: string, data: Adjacency][];
  nodes: [id: string, data: ObjectId | PopulatedCustomComponent][];
  edges: [id: string, data: Edge][];
}
