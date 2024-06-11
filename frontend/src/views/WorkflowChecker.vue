<script setup lang="ts">
import type { Node } from 'cic-shared';
import WorkflowPlane from '@/components/organisms/WorkflowPlane.vue';
import { ref } from 'vue';

import ComponentDetailModal from '@/components/organisms/ComponentDetailModal.vue';
import AddComponentModal from '@/components/organisms/AddComponentModal.vue';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';
import { useComponentsStore } from '@/stores/components';

const toast = useToast();
const workflowStore = useWorkflowStore();
const componentsStore = useComponentsStore();

const detailModalIsOpen = ref(false);
const addComponentModalIsOpen = ref(false);
const selectedNode = ref<Node | null>(null);
const tmpId = ref<string | null>(null);
const addType = ref<'after' | 'between'>('after');

const handleNodeClick = (nodeId: string) => {
  const node = workflowStore.nodes.get(nodeId);
  if (!node) throw new Error(`Node with id ${nodeId} not found`);
  selectedNode.value = node;
  detailModalIsOpen.value = true;
};

const handleAddComponent = async (id: string) => {
  const component = await componentsStore.getComponent(id);

  if (!component) {
    toast.error('Failed to load component');
    return;
  }

  if (tmpId.value) {
    switch (addType.value) {
      case 'after':
        workflowStore.addNodeAfter(component, tmpId.value);
        break;
      case 'between':
        workflowStore.addNodeBetween(component, tmpId.value);
        break;
      default:
        throw new Error('Invalid add type');
    }
    tmpId.value = null;
    return;
  }

  workflowStore.addNode(component);
};

const handleAddComponentOnEdge = async (id: string) => {
  addComponentModalIsOpen.value = true;
  tmpId.value = id || null;
  if (id) {
    addType.value = 'between';
  }
};

const handleAddComponentRequested = (id?: string) => {
  addComponentModalIsOpen.value = true;
  tmpId.value = id || null;
  if (id) {
    addType.value = 'after';
  }
};
</script>

<template>
  <WorkflowPlane
    class="workflow-plane"
    @nodeClicked="handleNodeClick"
    @add-component-requested="handleAddComponentRequested"
    @add-component-requested-edge="handleAddComponentOnEdge"
    @delete-node="workflowStore.removeNodeAndCloseGaps"
  />
  <ComponentDetailModal
    v-if="selectedNode"
    v-model="detailModalIsOpen"
    :component="selectedNode"
    id="123"
  />
  <AddComponentModal v-model="addComponentModalIsOpen" @add-component="handleAddComponent" />
  <button @click="addComponentModalIsOpen = true" type="button">Add component</button>
</template>

<style lang="scss">
.workflow-plane {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
