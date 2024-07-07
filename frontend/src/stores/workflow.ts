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

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowStore => ({
    id: '',
    name: '',
    adjacencies: new Map(),
    nodes: new Map(),
    edges: new Map(),
    groups: new Map(),
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

        if (!sourceNode) {
          return null;
        }

        const sourceBB = sourceNode.boundingBox;
        let targetBB = sourceNode.boundingBox;

        if (targetNode) {
          targetBB = targetNode.boundingBox;
        }

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
    /** Determine if a Node has more than one ingoing/outgoing edges */
    nodeHasMultipleEdges:
      (state) =>
      (id: string): boolean => {
        const adjacency = state.adjacencies.get(id);
        if (!adjacency) {
          return false;
        }

        return adjacency.in.length > 1 || adjacency.out.length > 1;
      },

    findNodesWithSameSourceAndTarget:
      (state) =>
      (source: string, target: string): string[] => {
        const edgeArray = Array.from(state.edges.values());
        const sourceEdges = edgeArray.filter((edge) => edge.source === source);

        const possibleNodes = sourceEdges.map((edge) => edge.target);

        const targetEdges = edgeArray.filter(
          (edge) => edge.target === target && possibleNodes.includes(edge.source),
        );

        return targetEdges.map((edge) => edge.source);
      },

    /** Get parallel nodes to given node (ones with same nodes connected) */
    parallelNodes(state): (id: string) => string[] {
      return (id: string): string[] => {
        const adjacency = state.adjacencies.get(id);
        if (!adjacency) {
          return [];
        }

        const sourceNodes = adjacency.in
          .map((edgeId) => state.edges.get(edgeId)?.source)
          .filter((node) => node) as string[];

        const targetNodes = adjacency.out
          .map((edgeId) => state.edges.get(edgeId)?.target)
          .filter((node) => node) as string[];

        const parallelNodes = new Set<string>();

        sourceNodes.forEach((sourceNode) => {
          targetNodes.forEach((targetNode) => {
            const nodes = this.findNodesWithSameSourceAndTarget(sourceNode, targetNode);
            nodes.forEach((node) => parallelNodes.add(node));
          });
        });

        parallelNodes.delete(id);

        return Array.from(parallelNodes);
      };
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
        const previousEdgesNotCompatible = previousEdges.some(
          (compatibility) => compatibility !== 'yes',
        );

        if (previousEdgesNotCompatible && edgeCompatible === 'yes') {
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
      type?: FrontendNode['dataType'],
      group?: string,
    ): string {
      const id = loadedId || uuid();
      this.nodes.set(id, {
        ...node,
        satisfiesMinimalVersion,
        boundingBox: boundingBox ?? { x: 0, y: 0, width: 0, height: 0 },
        ...(type ? { dataType: type } : {}),
        ...(group ? { group } : {}),
      });
      this.adjacencies.set(id, { in: [], out: [] });
      return id;
    },
    updateNodeData(
      id: string,
      node: PopulatedComponent | PopulatedCustomComponent,
      group?: string,
    ): void {
      const currentData = this.nodes.get(id);
      if (!currentData) {
        return;
      }

      const updatedNode = { ...currentData, ...node, ...(group ? { group } : {}) };

      this.nodes.set(id, updatedNode);
      this.determineEdgeCompatibilityFromNode(id);
    },
    addNodeBefore(
      node: PopulatedComponent | PopulatedCustomComponent,
      before: string,
      satisfiesMinimalVersion?: boolean,
      type?: FrontendNode['dataType'],
    ): void {
      const id = this.addNode(node, undefined, undefined, satisfiesMinimalVersion, type);
      const previousNode = this.nodes.get(before);
      if (!previousNode) {
        return;
      }

      if (previousNode.group) {
        const group = this.groups.get(previousNode.group);
        if (!group) {
          return;
        }

        group.forEach((nodeId) => {
          this.addEdge(id, nodeId);
        });
      }
      this.addEdge(id, before);
    },
    addNodeAfter(
      node: PopulatedComponent | PopulatedCustomComponent,
      after: string,
      satisfiesMinimalVersion?: boolean,
      type?: FrontendNode['dataType'],
    ): void {
      const id = this.addNode(node, undefined, undefined, satisfiesMinimalVersion, type);
      const previousNode = this.nodes.get(after);
      if (!previousNode) {
        return;
      }

      if (previousNode.group) {
        const group = this.groups.get(previousNode.group);
        if (!group) {
          return;
        }

        group.forEach((nodeId) => {
          this.addEdge(nodeId, id);
        });
      }
      this.addEdge(after, id);
    },
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
    addNodeBeside(
      node: PopulatedComponent | PopulatedCustomComponent,
      nodeId: string,
      satisfiesMinimalVersion?: boolean,
      type?: FrontendNode['dataType'],
    ) {
      const adjacency = this.adjacencies.get(nodeId);
      const siblingNode = this.nodes.get(nodeId);
      if (!adjacency || !siblingNode) {
        return;
      }

      let groupId = siblingNode.group;

      if (!groupId) {
        groupId = uuid();
        this.groups.set(groupId, [nodeId]);
        this.updateNodeData(nodeId, siblingNode, groupId);
      }

      const group = this.groups.get(groupId);

      if (!group) {
        return;
      }

      const id = this.addNode(node, undefined, undefined, satisfiesMinimalVersion, type, groupId);
      const { in: inEdges, out: outEdges } = adjacency;

      const siblingIndex = group.indexOf(nodeId);
      group.splice(siblingIndex + 1, 0, id);

      inEdges.forEach((edgeId) => {
        this.addEdge(this.edges.get(edgeId)?.source || '', id);
      });

      outEdges.forEach((edgeId) => {
        this.addEdge(id, this.edges.get(edgeId)?.target || '');
      });

      // this.recalculateGroupNodePositions(groupId);
    },
    removeNode(id: string): void {
      const node = this.nodes.get(id);
      const adjacency = this.adjacencies.get(id);
      if (!adjacency || !node) {
        return;
      }

      adjacency.in.forEach((edgeId) => this.removeEdge(edgeId));
      adjacency.out.forEach((edgeId) => this.removeEdge(edgeId));
      this.adjacencies.delete(id);
      this.nodes.delete(id);

      const { group } = node;

      if (group) {
        const groupNodes = this.groups.get(group);
        if (groupNodes) {
          const nodeIndex = groupNodes.indexOf(id);
          groupNodes.splice(nodeIndex, 1);
        }
        this.recalculateGroupNodePositions(group);
        if (groupNodes?.length === 0) {
          this.groups.delete(group);
        }
      }
    },
    removeNodeAndCloseGaps(id: string): void {
      const adjacency = this.adjacencies.get(id);
      const node = this.nodes.get(id);
      if (!adjacency || !node) {
        return;
      }

      const inEdgeIds = adjacency.in;
      const outEdgeIds = adjacency.out;
      const groupId = node.group;
      const group = this.groups.get(groupId || '');

      const inEdges = inEdgeIds
        .map((edgeId) => this.edges.get(edgeId))
        .filter((edge) => edge) as Edge[];
      const outEdges = outEdgeIds
        .map((edgeId) => this.edges.get(edgeId))
        .filter((edge) => edge) as Edge[];

      if (!group || group.length === 1) {
        inEdges.forEach((edge) => {
          outEdges.forEach((outEdge) => {
            this.addEdge(edge.source, outEdge.target);
          });
        });
      }

      this.removeNode(id);
      outEdges.forEach((edge) => {
        this.recalculateNodePositionsFrom(edge.target);
      });

      // outNodes.forEach((nodeId) => {
      //   this.determineEdgeCompatibilityFromNode(nodeId);
      // });
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

      const parallelNodes = this.groups.get(node.group || '') || [];

      let { x } = node.boundingBox;
      let previousMinX = 0;

      if (previousNodes.length) {
        previousMinX = Math.min(
          ...previousNodes.map((iterationNode) => iterationNode.boundingBox.x),
        );
      }

      if (parallelNodes.length > 0) {
        const previousNodeInGroupId = parallelNodes[parallelNodes.indexOf(id) - 1];
        const previousNodeInGroup = this.nodes.get(previousNodeInGroupId);

        if (previousNodeInGroup) {
          x =
            previousNodeInGroup.boundingBox.x +
            previousNodeInGroup.boundingBox.width +
            cssVariables.size.xl;
        } else {
          x = previousMinX;
        }
      } else if (previousNodes.length) {
        const previousMaxX = Math.max(
          ...previousNodes.map(
            (iterationNode) => iterationNode.boundingBox.x + iterationNode.boundingBox.width,
          ),
        );

        const previousWidth = previousMaxX - previousMinX;
        x = previousMinX + (previousWidth / 2 - node.boundingBox.width / 2);
      }

      const maxPreviousNodeY = Math.max(
        ...previousNodes.map(
          (iterationNode) => iterationNode.boundingBox.y + iterationNode.boundingBox.height,
        ),
      );

      const newPosition: BoundingBox = {
        x,
        y: inEdges.length ? maxPreviousNodeY + cssVariables.size.xl : 0,
        width: node.boundingBox.width,
        height: node.boundingBox.height,
      };

      this.updateNodePosition(id, newPosition);
    },
    recalculateGroupNodePositions(group: string): void {
      const groupNodes = this.groups.get(group);
      if (!groupNodes) {
        return;
      }

      groupNodes.forEach((nodeId) => {
        this.recalculateNodePosition(nodeId);
      });

      // this.centerGroup(group);
    },
    centerGroup(group: string): void {
      const groupNodes = this.groups.get(group);
      if (!groupNodes) {
        return;
      }

      const firstNode = this.nodes.get(groupNodes[0]);
      const lastNode = this.nodes.get(groupNodes[groupNodes.length - 1]);

      if (!firstNode || !lastNode) {
        return;
      }

      const groupWidth =
        firstNode.boundingBox.x + lastNode.boundingBox.x + lastNode.boundingBox.width;

      const groupCenter = groupWidth / 2 - firstNode.boundingBox.width / 2;

      groupNodes.forEach((nodeId) => {
        const node = this.nodes.get(nodeId);
        if (!node) {
          return;
        }

        const updatedPosition = {
          x: node.boundingBox.x - groupCenter,
          y: node.boundingBox.y,
          width: node.boundingBox.width,
          height: node.boundingBox.height,
        };

        this.updateNodePosition(nodeId, updatedPosition);
      });
    },
    recalculateNodePositionsFrom(id: string): void {
      this.recalculateNodePosition(id);

      const adjacency = this.adjacencies.get(id);
      if (!adjacency) {
        return;
      }

      const node = this.nodes.get(id);
      if (node?.group) {
        this.recalculateGroupNodePositions(node.group);
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
    saveToLocalStorage(): void {
      const workflow = this.generateSavedWorkflow();
      WorkflowStorageHelper.saveWorkflow(workflow);
      WorkflowStorageHelper.setCurrentWorkflow(workflow.id);
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
    },
    determineCompatiblePathsFromNode(id: string): string[][] | null {
      const node = this.nodes.get(id);
      const adjacency = this.adjacencies.get(id);
      if (!node || !adjacency) {
        return null;
      }

      if (!node.compatible) {
        return null;
      }

      const outEdges = adjacency.out
        .map((edgeId) => this.edges.get(edgeId))
        .filter((edge) => edge) as Edge[];

      if (outEdges.length === 0) {
        return [[node.name]];
      }

      const allSubPaths: string[][] = [];

      outEdges.forEach((edge) => {
        const subPaths = this.determineCompatiblePathsFromNode(edge.target);
        if (!subPaths) return;
        allSubPaths.push(...subPaths.map((path) => [node.name, ...path]));
      });

      return allSubPaths;
    },
    //   determineCompatiblePathsFromNode(id: string, pathInput: string[][] = []): string[][] | null {
    //     const path = [...pathInput];
    //     const node = this.nodes.get(id);
    //     const adjacency = this.adjacencies.get(id);
    //     console.log(node.name);
    //     if (!node || !adjacency) {
    //       return null;
    //     }

    //     if (!node.compatible) {
    //       return null;
    //     }

    //     const outEdges = adjacency.out
    //       .map((edgeId) => this.edges.get(edgeId))
    //       .filter((edge) => edge) as Edge[];

    //     if (outEdges.length === 0) {
    //       path.forEach((p) => p.push(node.name));
    //       return path;
    //     }

    //     if (node.compatible) {
    //       path.forEach((p) => p.push(node.name));
    //     }

    //     if (path.length === 0) {
    //       path.push([node.name]);
    //     }

    //     const allSubPaths: string[][] = [];

    //     if (outEdges.length > 1) {
    //       console.log(outEdges);
    //     }

    //     outEdges.forEach((edge) => {
    //       const subPaths = this.determineCompatiblePathsFromNode(edge.target, path);
    //       // console.log(subPaths);
    //       if (!subPaths) return;
    //       allSubPaths.push(subPaths.flat());
    //     });

    //     return allSubPaths;

    //     return path;
    //   },
  },
});
