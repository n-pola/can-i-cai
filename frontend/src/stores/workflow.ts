import { defineStore } from 'pinia';
import type { PopulatedComponent, PopulatedCustomComponent, Edge, SavedWorkflow } from 'cic-shared';
import { v4 as uuid } from 'uuid';
import type {
  BoundingBox,
  FrontendEdge,
  FrontendNode,
  PositionedFrontendEdge,
  WorkflowStore,
} from '@/types/workflow';
import { cssVariables } from '@/utils/cssVariables';
import { useComponentsStore } from '@/stores/components';
import { useCategoryStore } from '@/stores/category';
import { WorkflowStorageHelper } from '@/helpers/workflowStorageHelper';
import { NodeHelper } from '@/helpers/nodeHelper';
import { externalImageCategory } from '@/constants/externalImageCategory';
import { hashString } from '@/utils/hashString';

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowStore => ({
    id: '',
    name: '',
    adjacencies: new Map(),
    nodes: new Map(),
    edges: new Map(),
    stateHash: {
      initial: null,
      current: null,
    },
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
    /** Determine if a node is at the start of a workflow */
    isFirstNode:
      (state) =>
      (id: string): boolean => {
        const adjacency = state.adjacencies.get(id);
        if (!adjacency) {
          return false;
        }

        return adjacency.in.length === 0;
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
     * Get the position of a single edge and reactive compatibility
     * @param edgeId - The id of the edge
     */
    positionedEdge:
      (state) =>
      (edgeId: string): PositionedFrontendEdge | null => {
        const edge = state.edges.get(edgeId);

        if (!edge) {
          return null;
        }

        const sourceNode = state.nodes.get(edge.source);
        const targetNode = state.nodes.get(edge.target);

        if (!sourceNode || !targetNode) {
          return null;
        }

        const sourceBB = sourceNode.boundingBox;
        const targetBB = targetNode.boundingBox;

        const coordinates = {
          start: {
            x: sourceBB.x + sourceBB.width / 2,
            y: sourceBB.y + sourceBB.height,
          },
          end: {
            x: targetBB.x + targetBB.width / 2,
            y: targetBB.y,
          },
        };

        return { ...edge, coordinates, id: edgeId };
      },
    /** Get all edges with the respective coordinates in context of current node
     * positions */
    positionedEdges(state): PositionedFrontendEdge[] {
      const positionedEdges: PositionedFrontendEdge[] = [];

      state.edges.forEach((_, id) => {
        const edge = this.positionedEdge(id);
        if (edge) {
          positionedEdges.push(edge);
        }
      });

      return positionedEdges;
    },
  },
  actions: {
    /** Reset all data of the workflow */
    clearWorkflow(): void {
      this.id = '';
      this.name = '';
      this.adjacencies.clear();
      this.nodes.clear();
      this.edges.clear();
      this.stateHash.initial = null;
      this.stateHash.current = null;
    },

    /** Determine the compatibility of an edge based on its source node and
     * previous edges compatibility */
    determineEdgeCompatibility(id: string): void {
      const edge = this.edges.get(id);
      if (!edge) {
        return;
      }

      const sourceAdjacency = this.adjacencies.get(edge.source);
      const sourceCompatible = this.nodeCompatible(edge.source);
      if (!sourceAdjacency || sourceCompatible === null) {
        return;
      }

      let edgeCompatible: FrontendEdge['compatible'] = sourceCompatible ? 'yes' : 'no';

      const previousEdges = sourceAdjacency.in.map((edgeId) => {
        const prevEdge = this.edges.get(edgeId);
        if (!prevEdge) {
          return null;
        }

        return prevEdge.compatible;
      });

      if (previousEdges.length) {
        const previousEdgesCompatibility = previousEdges.some(
          (compatibility) => !(compatibility !== 'yes'),
        );

        if (!previousEdgesCompatibility && edgeCompatible === 'yes') {
          edgeCompatible = 'partial';
        }
      }

      this.edges.set(id, { ...edge, compatible: edgeCompatible });
    },

    /** Recursively (re)determine compatibility from a given edge onwards */
    determineEdgeCompatibilityFromEdge(id: string): void {
      const edge = this.edges.get(id);
      if (!edge) {
        return;
      }

      this.determineEdgeCompatibility(id);
      this.determineEdgeCompatibilityFromNode(edge.target);
    },

    /** Redetermine compatibility of all outgoing edges of a
     * given node */
    determineEdgeCompatibilityFromNode(id: string): void {
      const adjacency = this.adjacencies.get(id);
      if (!adjacency) {
        return;
      }

      adjacency.out.forEach((edgeId) => this.determineEdgeCompatibilityFromEdge(edgeId));
    },

    /**
     * Add an edge to connect two nodes and include it in their adjacencies
     * @param source - The id of the source node
     * @param target - The id of the target node
     * @param id - Optional an already defined ID for the edge, used for reconstruction of a workflow
     */
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
      this.edges.set(edgeId, { source, target, compatible: 'no' });
      sourceAdjacency.out.push(edgeId);
      targetAdjacency.in.push(edgeId);
      this.determineEdgeCompatibility(edgeId);
    },

    /**
     * Remove an edge from the graph and its adjacencies
     * @param edgeId - The id of the edge to remove
     */
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

    /**
     * Get the next Nodes of give node
     * @param id - The id of the current node
     */
    nextNodes(id: string): string[] {
      const adjacency = this.adjacencies.get(id);
      if (!adjacency) {
        return [];
      }

      const outEdges = adjacency.out
        .map((edgeId) => this.edges.get(edgeId))
        .filter((edge) => edge) as Edge[];

      return outEdges.map((edge) => edge.target);
    },

    /**
     * Get the previous Nodes of give node
     * @param id - The id of the current node
     */
    previousNodes(id: string): string[] {
      const adjacency = this.adjacencies.get(id);
      if (!adjacency) {
        return [];
      }

      const inEdges = adjacency.in
        .map((edgeId) => this.edges.get(edgeId))
        .filter((edge) => edge) as Edge[];

      return inEdges.map((edge) => edge.source);
    },

    /**
     * Add a node to the graph and create an adjacency for it
     * @param node - The data/content of the node (component)
     * @param boundingBox - Optional the bounding box of the node
     * @param loadedId - Optional an already defined ID for the node, used for reconstruction of a workflow
     * @param satisfiesMinimalVersion - Optional if the node satisfies the minimal version to determine compatibility
     * @param type - Optional the type of the node for custom nodes
     */
    addNode(
      node: PopulatedComponent | PopulatedCustomComponent,
      boundingBox?: BoundingBox,
      loadedId?: string,
      satisfiesMinimalVersion?: boolean,
      type?: FrontendNode['dataType'],
    ): string {
      const id = loadedId || uuid();
      this.nodes.set(id, {
        ...node,
        satisfiesMinimalVersion,
        boundingBox: boundingBox ?? { x: 0, y: 0, width: 0, height: 0 },
        ...(type ? { dataType: type } : {}),
      });
      this.adjacencies.set(id, { in: [], out: [] });
      return id;
    },

    /**
     * Update the data of a node by its id
     * @param id - The id of the node to update
     * @param node - The new data/content of the node
     */
    updateNodeData(id: string, node: PopulatedComponent | PopulatedCustomComponent): void {
      const currentData = this.nodes.get(id);
      if (!currentData) {
        return;
      }

      const updatedNode = { ...currentData, ...node };

      this.nodes.set(id, updatedNode);
      this.determineEdgeCompatibilityFromNode(id);
    },

    /**
     * Add a new node before a given node
     * @param node - The data/content of the node (component)
     * @param before - ID of the node to prepend the new node
     * @param satisfiesMinimalVersion - Optional, if the new node satisfies the minimal version to determine compatibility
     * @param type - Optional the type of the node for custom nodes
     */
    addNodeBefore(
      node: PopulatedComponent | PopulatedCustomComponent,
      before: string,
      satisfiesMinimalVersion?: boolean,
      type?: FrontendNode['dataType'],
    ): void {
      const id = this.addNode(node, undefined, undefined, satisfiesMinimalVersion, type);
      this.addEdge(id, before);
    },

    /**
     * Add a new node before a given node
     * @param node - The data/content of the node (component)
     * @param before - ID of the node to append the new node
     * @param satisfiesMinimalVersion - Optional, if the new node satisfies the minimal version to determine compatibility
     * @param type - Optional the type of the node for custom nodes
     */
    addNodeAfter(
      node: PopulatedComponent | PopulatedCustomComponent,
      after: string,
      satisfiesMinimalVersion?: boolean,
      type?: FrontendNode['dataType'],
    ): void {
      const id = this.addNode(node, undefined, undefined, satisfiesMinimalVersion, type);
      this.addEdge(after, id);
    },

    /**
     * Add a new node on an edge and thus between two existing nodes
     * @param node - The data/content of the node (component)
     * @param edgeId - The edge to place the new node on
     * @param satisfiesMinimalVersion - Optional, if the new node satisfies the minimal version to determine compatibility
     * @param type - Optional the type of the node for custom nodes
     */
    addNodeBetween(
      node: PopulatedComponent | PopulatedCustomComponent,
      edgeId: string,
      satisfiesMinimalVersion?: boolean,
      type?: FrontendNode['dataType'],
    ): void {
      const edge = this.edges.get(edgeId);

      if (!edge) {
        return;
      }

      const id = this.addNode(node, undefined, undefined, satisfiesMinimalVersion, type);
      const { source, target } = edge;

      this.removeEdge(edgeId);
      this.addEdge(source, id);
      this.addEdge(id, target);
    },

    /**
     * Remove a node from the graph. \
     * Remove all edges connected to the node and the adjacency of the node
     * @param id - The id of the node to remove
     */
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

    /**
     * Remove a node from the graph and close gaps in the graph by connecting
     * the previous and next nodes of the removed node
     * @param id - The id of the node to remove
     */
    removeNodeAndCloseGaps(id: string): void {
      const adjacency = this.adjacencies.get(id);
      if (!adjacency) {
        return;
      }

      const inEdges = adjacency.in;
      const outEdges = adjacency.out;
      const outNodes = outEdges
        .map((edgeId) => this.edges.get(edgeId)?.target)
        .filter((node) => node) as string[];

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
        outNodes.forEach((nodeId) => {
          this.determineEdgeCompatibilityFromNode(nodeId);
        });
      }
    },

    /**
     * Update the position of a node
     * @param id - The id of the node to update
     * @param boundingBox - The new bounding box of the node
     */
    updateNodePosition(id: string, boundingBox: BoundingBox): void {
      const node = this.nodes.get(id);
      if (!node) {
        return;
      }

      const updatedNode = { ...node, boundingBox };

      this.nodes.set(id, updatedNode);
    },

    /**
     * Recalculate the position of a node based on its previous nodes
     * @param id - The id of the node to recalculate the position of
     */
    recalculateNodePosition(id: string): void {
      const node = this.nodes.get(id);
      const adjacency = this.adjacencies.get(id);
      if (!adjacency || !node) {
        return;
      }

      const previousNodeIds = this.previousNodes(id);

      const previousNodes = previousNodeIds
        .map((prevNode) => this.nodes.get(prevNode))
        .filter((iterationNode) => iterationNode) as FrontendNode[];

      const maxPreviousNodeY = Math.max(
        ...previousNodes.map(
          (iterationNode) => iterationNode.boundingBox.y + iterationNode.boundingBox.height,
        ),
      );

      const newPosition: BoundingBox = {
        x: node.boundingBox.x,
        y: previousNodes.length ? maxPreviousNodeY + cssVariables.size.xl : 0,
        width: node.boundingBox.width,
        height: node.boundingBox.height,
      };

      this.updateNodePosition(id, newPosition);
    },

    /**
     * Recalculate the positions from given node onwards by traversing the graph
     * @param id - node id to start the recalculation from
     */
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

        this.determineEdgeCompatibility(edgeId);
        this.recalculateNodePositionsFrom(edge.target);
      });
    },

    /**
     * Parse the active workflow into desired format for saving
     */
    generateSavedWorkflow(): SavedWorkflow {
      const workflowId = this.id || uuid();
      this.id = workflowId;
      const workflow: SavedWorkflow = {
        name: this.name!,
        id: workflowId,
        adjacencies: Array.from(this.adjacencies).map(([id, data]) => ({ id, data })),
        nodes: Array.from(this.nodes)
          .filter(([, data]) => data.dataType === undefined)
          .map(([id, data]) => ({
            id,
            data: { componentId: data.id, satisfiesMinimalVersion: data.satisfiesMinimalVersion },
          })),
        customNodes: Array.from(this.nodes)
          .filter(([, data]) => data.dataType)
          .map(([id, data]) => ({
            id,
            data: {
              id: data.id,
              name: data.name,
              compatible: data.compatible,
              type: data.type,
              category: data.category.id,
              manufacturer:
                typeof data.manufacturer === 'string' ? data.manufacturer : data.manufacturer.name,
              dataType: data.dataType,
            },
          })),
        edges: Array.from(this.edges).map(([id, data]) => ({
          id,
          data: { source: data.source, target: data.target },
        })),
      };

      return workflow;
    },

    /**
     * Save the current workflow to local storage
     */
    saveToLocalStorage(): void {
      const workflow = this.generateSavedWorkflow();
      WorkflowStorageHelper.saveWorkflow(workflow);
      WorkflowStorageHelper.setCurrentWorkflow(workflow.id);
      this.stateHash.initial = this.stateHash.current;
    },

    /**
     * Load a workflow from local storage
     * @param workflowId - The id of the workflow to load
     */
    async loadFromLocalStorage(workflowId: string): Promise<void> {
      const workflow = WorkflowStorageHelper.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      await this.reconstructWorkflow(workflow);
    },

    /**
     * Reconstruct a saved workflow to an active one (from saved or shared workflows)
     * @param workflow - Passive workflow object to reconstruct
     */
    async reconstructWorkflow(workflow: SavedWorkflow): Promise<void> {
      this.clearWorkflow();
      const componentsStore = useComponentsStore();
      const categoryStore = useCategoryStore();

      this.id = workflow.id;
      this.name = workflow.name;

      const componentIds = workflow.nodes.map(({ data }) => data.componentId);
      await componentsStore.getComponents(componentIds);

      const loadedNodes = workflow.nodes.map(({ id, data }) =>
        componentsStore.getComponent(data.componentId).then((component) => {
          this.addNode(component, undefined, id, data.satisfiesMinimalVersion);
        }),
      );

      await categoryStore.getAllCategories();

      await Promise.all(loadedNodes);

      workflow.customNodes.forEach(({ id, data }) => {
        const isExternalImage = data.dataType === 'external-image';

        const category = isExternalImage
          ? externalImageCategory
          : categoryStore.categories.get(data.category);
        if (!category) {
          return;
        }

        const populated: PopulatedCustomComponent = {
          ...data,
          category,
        };

        this.addNode(populated, undefined, id, undefined, data.dataType);
      });

      workflow.edges.forEach(({ id, data }) => {
        this.addEdge(data.source, data.target, id);
      });

      this.firstNodes.forEach((id) => this.recalculateNodePositionsFrom(id));

      this.stateHash.initial = await this.calcStateHash();
    },

    /**
     * Create a string to represent the current state of a custom node
     * @param node - Full custom node object
     * @returns String representation
     */
    calcCustomNodeString(node: FrontendNode | PopulatedCustomComponent): string {
      const nodeString =
        node.name +
        node.type.toString() +
        (node.category?.id ?? '') +
        node.manufacturer +
        (node.compatible ? '1' : '0');

      return nodeString;
    },

    /* eslint-disable no-param-reassign */
    /**
     * Calculate a string representing the current graph by its nodes and their order
     */
    calcGraphString(id?: string): string {
      const startNodes = id ? [id] : this.firstNodes;

      const nodes = startNodes
        .map((nodeId) => this.nodes.get(nodeId))
        .filter((node) => node) as FrontendNode[];

      const graphString = nodes.reduce((acc, node) => {
        if (node.dataType === 'custom') {
          acc += this.calcCustomNodeString(node);
          return acc;
        }

        acc += node.id;

        if (node.satisfiesMinimalVersion !== undefined) {
          acc += node.satisfiesMinimalVersion ? '1' : '0';
        }

        return acc;
      }, '');

      const subString = startNodes.reduce((acc, node) => {
        const nextNodes = this.nextNodes(node);
        nextNodes.forEach((nextNode) => {
          // eslint-disable-next-line no-param-reassign
          acc += this.calcGraphString(nextNode);
        });
        return acc;
      }, '');

      return graphString + subString;
    },
    /* eslint-enable no-param-reassign */

    /**
     * Calculate a hash of the current state of the workflow to allow navigation
     * interceptions
     * @returns String representing the hash of the current state
     */
    async calcStateHash(): Promise<string> {
      const stateString = this.calcGraphString();

      return hashString(stateString + this.name);
    },
  },
});
