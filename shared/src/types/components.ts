import { ObjectId } from 'mongoose';

export interface Component {
  _id: string; // assigned by db
  name: string;
  manufacturer: ObjectId;
  category: ObjectId;
  type: 'input' | 'output' | 'input-output';
  compatible: boolean;
  minimalRequiredVersion?: string;
  additionalInfo?: string;
}

export interface PopulatedComponent extends Omit<Component, 'manufacturer' | 'category'> {
  manufacturer: string;
  category: string;
}

export interface CustomComponent extends Omit<Component, 'id'> {}

interface Adjacency {
  in: string[];
  out: string[];
}

export interface Edge {
  source: string;
  target: string;
}

export interface Workflow {
  name?: string;
  adjacencies: Map<string, Adjacency>;
  nodes: Map<string, Component | CustomComponent>;
  edges: Map<string, string>;
}

export interface SavedWorkflow {
  nodes: [id: string, data: Component][];
}
