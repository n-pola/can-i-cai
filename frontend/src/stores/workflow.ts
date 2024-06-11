import { defineStore } from 'pinia';
import type {
  Workflow,
  PopulatedComponent,
  PopulatedCustomComponent,
  Edge,
  Node,
} from 'cic-shared';
import { v4 as uuid } from 'uuid';
import { cssVariables } from '../utils/cssVariables';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

type FrontendNode = Node & {
  boundingBox: BoundingBox;
};

type FrontendEdge = Edge & {
  compatible: boolean;
};

interface WorkflowStore extends Omit<Workflow, 'nodes' | 'edges'> {
  id: string;
  nodes: Map<string, FrontendNode>;
  edges: Map<string, FrontendEdge>;
}

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowStore => ({
    id: '',
    name: '',
    adjacencies: new Map(),
    nodes: new Map(),
    edges: new Map(),
  }),
  getters: {
    firstNodes: (state): string[] => {
      const nodesWithoutIncomingEdges = new Set<string>();
      state.adjacencies.forEach((adjacency, id) => {
        if (adjacency.in.length === 0) {
          nodesWithoutIncomingEdges.add(id);
        }
      });

      return Array.from(nodesWithoutIncomingEdges);
    },
    isLastNode:
      (state) =>
      (id: string): boolean => {
        const adjacency = state.adjacencies.get(id);
        if (!adjacency) {
          return false;
        }

        return adjacency.out.length === 0;
      },
    compatible: (state): boolean => {
      if (state.nodes.size === 0) {
        return false;
      }

      const nodesArray = Array.from(state.nodes.values());

      return !nodesArray.some((node) => !node.compatible);
    },
    nodeCompatible:
      (state) =>
      (id: string): boolean | null => {
        const node = state.nodes.get(id);
        if (!node) {
          return null;
        }

        return node.compatible;
      },
  },
  actions: {
    addEdge(source: string, target: string): void {
      const sourceAdjacency = this.adjacencies.get(source);
      const targetAdjacency = this.adjacencies.get(target);
      const sourceCompatible = this.nodeCompatible(source);
      const targetCompatible = this.nodeCompatible(target);
      if (
        !sourceAdjacency ||
        !targetAdjacency ||
        sourceCompatible === null ||
        targetCompatible === null
      ) {
        return;
      }

      const edgeId = uuid();
      this.edges.set(edgeId, { source, target, compatible: sourceCompatible && targetCompatible });
      sourceAdjacency.out.push(edgeId);
      targetAdjacency.in.push(edgeId);
    },
    removeEdge(edgeId: string): void {
      const edge = this.edges.get(edgeId);
      if (!edge) {
        return;
      }

      const sourceAdjacency = this.adjacencies.get(edge.source);
      const targetAdjacency = this.adjacencies.get(edge.target);
      if (!sourceAdjacency || !targetAdjacency) {
        return;
      }

      sourceAdjacency.out = sourceAdjacency.out.filter((id) => id !== edgeId);
      targetAdjacency.in = targetAdjacency.in.filter((id) => id !== edgeId);
      this.edges.delete(edgeId);
    },
    addNode(
      node: PopulatedComponent | PopulatedCustomComponent,
      boundingBox?: BoundingBox,
    ): string {
      const id = uuid();
      this.nodes.set(id, {
        ...node,
        boundingBox: boundingBox ?? { x: 0, y: 0, width: 0, height: 0 },
      });
      this.adjacencies.set(id, { in: [], out: [] });
      return id;
    },
    addNodeAfter(node: PopulatedComponent | PopulatedCustomComponent, after: string): void {
      const id = this.addNode(node);
      this.addEdge(after, id);
    },
    addNodeBetween(node: PopulatedComponent | PopulatedCustomComponent, edgeId: string): void {
      const edge = this.edges.get(edgeId);

      if (!edge) {
        return;
      }

      const id = this.addNode(node);
      const { source, target } = edge;

      this.removeEdge(edgeId);
      this.addEdge(source, id);
      this.addEdge(id, target);
    },
    removeNode(id: string): void {
      const adjacency = this.adjacencies.get(id);
      if (!adjacency) {
        return;
      }

      adjacency.in.forEach((edgeId) => this.removeEdge(edgeId));
      adjacency.out.forEach((edgeId) => this.removeEdge(edgeId));
      this.adjacencies.delete(id);
      this.nodes.delete(id);
    },
    removeNodeAndCloseGaps(id: string): void {
      const adjacency = this.adjacencies.get(id);
      if (!adjacency) {
        return;
      }

      const inEdges = adjacency.in;
      const outEdges = adjacency.out;

      if (inEdges.length === 1 && outEdges.length === 1) {
        const inEdge = this.edges.get(inEdges[0]);
        const outEdge = this.edges.get(outEdges[0]);

        if (inEdge && outEdge) {
          this.addEdge(inEdge.source, outEdge.target);
          this.removeNode(id);
          this.recalculateNodePositionsFrom(outEdge.target);
        }
      } else {
        this.removeNode(id);
      }
    },
    updateNodePosition(id: string, boundingBox: BoundingBox): void {
      const node = this.nodes.get(id);
      if (!node) {
        return;
      }

      const updatedNode = { ...node, boundingBox };

      this.nodes.set(id, updatedNode);
    },
    recalculateNodePosition(id: string): void {
      const node = this.nodes.get(id);
      const adjacency = this.adjacencies.get(id);
      if (!adjacency || !node) {
        return;
      }

      console.log(`recalculating node position for ${node.name}`);

      const inEdges = adjacency.in
        .map((edgeId) => this.edges.get(edgeId))
        .filter((edge) => edge) as Edge[];

      const previousNodes = inEdges
        .map((edge) => this.nodes.get(edge.source))
        .filter((iterationNode) => iterationNode) as FrontendNode[];

      console.log(previousNodes);

      const maxPreviousNodeY = Math.max(
        ...previousNodes.map(
          (iterationNode) => iterationNode.boundingBox.y + iterationNode.boundingBox.height,
        ),
      );

      const newPosition: BoundingBox = {
        x: node.boundingBox.x,
        y: inEdges.length ? maxPreviousNodeY + cssVariables.size.xl : 0,
        width: node.boundingBox.width,
        height: node.boundingBox.height,
      };

      console.log(newPosition);

      this.updateNodePosition(id, newPosition);
    },
    recalculateNodePositionsFrom(id: string): void {
      this.recalculateNodePosition(id);

      const adjacency = this.adjacencies.get(id);
      if (!adjacency) {
        return;
      }

      adjacency.out.forEach((edgeId) => {
        const edge = this.edges.get(edgeId);
        if (!edge) {
          return;
        }

        console.log(edge.target);

        this.recalculateNodePositionsFrom(edge.target);
      });
    },
  },
});
