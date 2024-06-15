<script setup lang="ts">
import type { Node } from 'cic-shared';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';
import { useComponentsStore } from '@/stores/components';
import { useI18n } from 'vue-i18n';
import { shareWorkflow } from '@/api/workflow';

import WorkflowPlane from '@/components/organisms/WorkflowPlane.vue';
import ComponentDetailModal from '@/components/organisms/ComponentDetailModal.vue';
import AddComponentModal from '@/components/organisms/AddComponentModal.vue';
import WorkflowSummary from '@/components/organisms/WorkflowSummary.vue';
import CheckerTools from '@/components/organisms/CheckerTools.vue';
import SharedModal from '@/components/organisms/SharedModal.vue';

// Hooks
const toast = useToast();
const workflowStore = useWorkflowStore();
const componentsStore = useComponentsStore();
const i18n = useI18n();

// Data
const workflowPlane = ref<InstanceType<typeof WorkflowPlane> | null>(null);
const mode = ref<'select' | 'move'>('select');

const detailModalIsOpen = ref(false);
const selectedNode = ref<Node | null>(null);

const addComponentModalIsOpen = ref(false);
const tmpId = ref<string | null>(null);
const addType = ref<'after' | 'between'>('after');

const sharedModalIsOpen = ref(false);
const sharedWorkflowId = ref<string | null>(null);

// Functions
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

const handleSaveRequested = () => {
  if (!workflowStore.name) {
    toast.error(
      i18n.t('workflowChecker.toasts.missingTitle', {
        action: i18n.t('workflowChecker.actions.saved'),
      }),
    );
    return;
  }

  try {
    workflowStore.saveToLocalStorage();
    toast.success(
      i18n.t('workflowChecker.toasts.success', {
        name: workflowStore.name,
        action: i18n.t('workflowChecker.actions.saved'),
      }),
    );
  } catch (e) {
    toast.error(
      i18n.t('workflowChecker.toasts.error', { action: i18n.t('workflowChecker.actions.saved') }),
    );
  }
};

const handleShare = async () => {
  if (!workflowStore.name) {
    toast.error(
      i18n.t('workflowChecker.toasts.missingTitle', {
        action: i18n.t('workflowChecker.actions.shared'),
      }),
    );
    return;
  }

  try {
    const workflow = workflowStore.generateSavedWorkflow();
    const sharedWorkflow = await shareWorkflow(workflow);

    sharedWorkflowId.value = sharedWorkflow.id;
    sharedModalIsOpen.value = true;
  } catch (e) {
    toast.error(
      i18n.t('workflowChecker.toasts.error', { action: i18n.t('workflowChecker.actions.shared') }),
    );
  }
};
</script>

<template>
  <div class="workflow-checker">
    <WorkflowPlane
      class="workflow-plane"
      @nodeClicked="handleNodeClick"
      @add-component-requested="handleAddComponentRequested"
      @add-component-requested-edge="handleAddComponentOnEdge"
      @delete-node="workflowStore.removeNodeAndCloseGaps"
      ref="workflowPlane"
    />
    <aside class="workflow-tools">
      <CheckerTools
        :mode="mode"
        @recenter="workflowPlane?.centerPlane"
        @clear-plane="workflowStore.clearWorkflow"
      />
    </aside>
    <aside class="workflow-summary">
      <WorkflowSummary
        :componentCount="workflowStore.nodes.size"
        :workflowCompatible="workflowStore.compatible"
        :incompatibleComponents="workflowStore.incompatibleNodes"
        @node-click="handleNodeClick"
        @save="handleSaveRequested"
        @share="handleShare"
      />
    </aside>
    <ComponentDetailModal
      v-if="selectedNode"
      v-model="detailModalIsOpen"
      :component="selectedNode"
      id="123"
    />
    <AddComponentModal v-model="addComponentModalIsOpen" @add-component="handleAddComponent" />
    <SharedModal v-if="sharedWorkflowId" v-model="sharedModalIsOpen" :id="sharedWorkflowId" />
  </div>
</template>

<style lang="scss">
.workflow-checker {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: $s;
  align-items: center;
  height: 100%;
  padding: 0 $l;
}

.workflow-summary {
  z-index: 1;
  grid-column: 9 / span 2;
}

.workflow-tools {
  z-index: 1;
  grid-column: 1;
}

.workflow-plane {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
