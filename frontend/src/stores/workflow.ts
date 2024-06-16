import { defineStore } from 'pinia';
import type { PopulatedComponent, PopulatedCustomComponent, Edge, SavedWorkflow } from 'cic-shared';
import { v4 as uuid } from 'uuid';
import type {
  BoundingBox,
  EdgeCoordinates,
  FrontendNode,
  PositionedFrontendEdge,
  WorkflowStore,
} from '@/types/workflow';
import { cssVariables } from '@/utils/cssVariables';
import { useComponentsStore } from '@/stores/components';
import { WorkflowStorageHelper } from '@/helpers/workflowStorageHelper';
import { NodeHelper } from '@/helpers/nodeHelper';

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowStore => ({
    id: '',
    name: '',
    adjacencies: new Map(),
    nodes: new Map(),
    edges: new Map(),
  }),
  getters: {
    /** Array of nodes without an incoming edge */
    firstNodes: (state): string[] => {
      const nodesWithoutIncomingEdges = new Set<string>();
      state.adjacencies.forEach((adjacency, id) => {
        if (adjacency.in.length === 0) {
          nodesWithoutIncomingEdges.add(id);
        }
      });

      return Array.from(nodesWithoutIncomingEdges);
    },
    /** Determine if a node is at the end of a workflow */
    isLastNode:
      (state) =>
      (id: string): boolean => {
        const adjacency = state.adjacencies.get(id);
        if (!adjacency) {
          return false;
        }

        return adjacency.out.length === 0;
      },
    /** Determine if the whole workflow is compatible or not */
    compatible: (state): boolean => {
      if (state.nodes.size === 0) {
        return false;
      }

      const nodesArray = Array.from(state.nodes.values());

      return !nodesArray.some((node) => !NodeHelper.isCompatible(node));
    },
    /** Get the compatibility of a single node by its id */
    nodeCompatible:
      (state) =>
      (id: string): boolean => {
        const node = state.nodes.get(id);
        if (!node) {
          return false;
        }

        return NodeHelper.isCompatible(node);
      },
    /** Get all nodes that are not compatible */
    incompatibleNodes: (state): WorkflowStore['nodes'] => {
      const nodes = new Map(state.nodes);

      nodes.forEach((node, id) => {
        if (NodeHelper.isCompatible(node)) {
          nodes.delete(id);
        }
      });

      return nodes;
    },
    /**
     * Get the position of a single edge
     * @param edgeId - The id of the edge
     */
    edgePosition:
      (state) =>
      (edgeId: string): EdgeCoordinates | null => {
        const edge = state.edges.get(edgeId);

        if (!edge) {
          return null;
        }

        const sourcePosition = state.nodes.get(edge.source);
        const targetPosition = state.nodes.get(edge.target);

        if (!sourcePosition || !targetPosition) {
          return null;
        }

        const sourceBB = sourcePosition.boundingBox;
        const targetBB = targetPosition.boundingBox;

        return {
          start: {
            x: sourceBB.x + sourceBB.width / 2,
            y: sourceBB.y + sourceBB.height,
          },
          end: {
            x: targetBB.x + targetBB.width / 2,
            y: targetBB.y,
          },
        };
      },
    /** Get all edges with the respective coordinates in context of current node
     * positions */
    positionedEdges(state): PositionedFrontendEdge[] {
      const positionedEdges: PositionedFrontendEdge[] = [];

      state.edges.forEach((edge, id) => {
        const coordinates = this.edgePosition(id);
        if (coordinates) {
          positionedEdges.push({ ...edge, coordinates, id });
        }
      });

      return positionedEdges;
    },
  },
  actions: {
    clearWorkflow(): void {
      this.id = '';
      this.name = '';
      this.adjacencies.clear();
      this.nodes.clear();
      this.edges.clear();
    },
    addEdge(source: string, target: string, id?: string): void {
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

      const edgeId = id || uuid();
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
      loadedId?: string,
      satisfiesMinimalVersion?: boolean,
    ): string {
      const id = loadedId || uuid();
      this.nodes.set(id, {
        ...node,
        satisfiesMinimalVersion,
        boundingBox: boundingBox ?? { x: 0, y: 0, width: 0, height: 0 },
      });
      this.adjacencies.set(id, { in: [], out: [] });
      return id;
    },
    addNodeAfter(
      node: PopulatedComponent | PopulatedCustomComponent,
      after: string,
      satisfiesMinimalVersion?: boolean,
    ): void {
      const id = this.addNode(node, undefined, undefined, satisfiesMinimalVersion);
      this.addEdge(after, id);
    },
    addNodeBetween(
      node: PopulatedComponent | PopulatedCustomComponent,
      edgeId: string,
      satisfiesMinimalVersion?: boolean,
    ): void {
      const edge = this.edges.get(edgeId);

      if (!edge) {
        return;
      }

      const id = this.addNode(node, undefined, undefined, satisfiesMinimalVersion);
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

      const inEdges = adjacency.in
        .map((edgeId) => this.edges.get(edgeId))
        .filter((edge) => edge) as Edge[];

      const previousNodes = inEdges
        .map((edge) => this.nodes.get(edge.source))
        .filter((iterationNode) => iterationNode) as FrontendNode[];

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

        this.recalculateNodePositionsFrom(edge.target);
      });
    },
    generateSavedWorkflow(): SavedWorkflow {
      const workflowId = this.id || uuid();
      this.id = workflowId;
      const workflow: SavedWorkflow = {
        name: this.name!,
        id: workflowId,
        adjacencies: Array.from(this.adjacencies).map(([id, data]) => ({ id, data })),
        nodes: Array.from(this.nodes).map(([id, data]) => ({
          id,
          data: { componentId: data.id, satisfiesMinimalVersion: data.satisfiesMinimalVersion },
        })),
        customNodes: [],
        edges: Array.from(this.edges).map(([id, data]) => ({
          id,
          data: { source: data.source, target: data.target },
        })),
      };

      return workflow;
    },
    saveToLocalStorage(): void {
      const workflow = this.generateSavedWorkflow();
      WorkflowStorageHelper.saveWorkflow(workflow);
    },
    async loadFromLocalStorage(workflowId: string): Promise<void> {
      const workflow = WorkflowStorageHelper.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      await this.reconstructWorkflow(workflow);
    },
    async reconstructWorkflow(workflow: SavedWorkflow): Promise<void> {
      this.clearWorkflow();
      const componentsStore = useComponentsStore();

      this.id = workflow.id;
      this.name = workflow.name;

      const componentIds = workflow.nodes.map(({ data }) => data.componentId);
      await componentsStore.getComponents(componentIds);

      const loadedNodes = workflow.nodes.map(({ id, data }) =>
        componentsStore.getComponent(data.componentId).then((component) => {
          this.addNode(component, undefined, id, data.satisfiesMinimalVersion);
        }),
      );

      await Promise.all(loadedNodes);

      workflow.edges.forEach(({ id, data }) => {
        this.addEdge(data.source, data.target, id);
      });

      this.firstNodes.forEach((id) => this.recalculateNodePositionsFrom(id));
    },
  },
});
