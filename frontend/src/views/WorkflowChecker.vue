<script setup lang="ts">
import type {
  PopulatedComponent,
  PopulatedCustomComponent,
  ComponentType,
  ComponentFunctionType,
} from 'cic-shared';
import { ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';
import { useComponentsStore } from '@/stores/components';
import { useI18n } from 'vue-i18n';
import { shareWorkflow } from '@/api/workflow';
import type { FrontendNode } from '@/types/workflow';
import { useModalInterception } from '@/hooks/useModalInterception';

import WorkflowPlane from '@/components/organisms/WorkflowPlane.vue';
import ComponentDetailModal from '@/components/organisms/ComponentDetailModal.vue';
import AddComponentModal from '@/components/organisms/AddComponentModal.vue';
import WorkflowSummary from '@/components/organisms/WorkflowSummary.vue';
import CheckerTools from '@/components/organisms/CheckerTools.vue';
import SharedModal from '@/components/organisms/SharedModal.vue';
import VersionInterceptionModal from '@/components/organisms/VersionInterceptionModal.vue';
import AddCustomComponentModal from '@/components/organisms/AddCustomComponentModal.vue';

// Hooks
const toast = useToast();
const workflowStore = useWorkflowStore();
const componentsStore = useComponentsStore();
const i18n = useI18n();
const {
  interceptAction: interceptAddComponent,
  confirmAction: confirmVersionInterceptionModal,
  abortAction: abortVersionInterceptionModal,
  isOpen: versionInterceptionModalIsOpen,
  tmpData: versionInterceptionData,
} = useModalInterception();

// Data
const workflowPlane = ref<InstanceType<typeof WorkflowPlane> | null>(null);
const mode = ref<'select' | 'move'>('select');

const detailModalIsOpen = ref(false);
const selectedNode = ref<FrontendNode | null>(null);
const selectedNodeId = ref<string | null>(null);

const addComponentModalIsOpen = ref(false);
const addCustomComponentModalIsOpen = ref(false);
const addComponentType = ref<ComponentFunctionType[] | null>(null);
const tmpId = ref<string | null>(null);
const addType = ref<'after' | 'between'>('after');
const editCustomComponent = ref<PopulatedCustomComponent | null>(null);

const sharedModalIsOpen = ref(false);
const sharedWorkflowId = ref<string | null>(null);

// Functions

/** Handle node click event and open detail modal */
const handleNodeClick = (nodeId: string) => {
  const node = workflowStore.nodes.get(nodeId);
  if (!node) throw new Error(`Node with id ${nodeId} not found`);

  if (node.dataType === 'custom') {
    selectedNodeId.value = nodeId;
    editCustomComponent.value = node as PopulatedCustomComponent;
    addCustomComponentModalIsOpen.value = true;
    return;
  }

  selectedNode.value = node;
  detailModalIsOpen.value = true;
};

/** Add a component to the workflow based on current addType */
const addComponent = async (
  component: PopulatedComponent | PopulatedCustomComponent,
  satisfiesMinimalVersion?: boolean,
  type?: ComponentType,
) => {
  if (tmpId.value) {
    switch (addType.value) {
      case 'after':
        workflowStore.addNodeAfter(component, tmpId.value, satisfiesMinimalVersion, type);
        break;
      case 'between':
        workflowStore.addNodeBetween(component, tmpId.value, satisfiesMinimalVersion, type);
        break;
      default:
        throw new Error('Invalid add type');
    }
    tmpId.value = null;
    return;
  }

  workflowStore.addNode(component, undefined, undefined, satisfiesMinimalVersion, type);
};

/**
 * Intercept component adding to check if the component has a minimal required version.
 * If it has, open a modal to ask the user if their version satisfies the minimal version.
 * @param id - The id of the component to add
 */
const handleAddComponent = async (id: string) => {
  const component = await componentsStore.getComponent(id);

  if (!component) {
    toast.error('Failed to load component');
    return;
  }

  if (!component.minimalRequiredVersion) {
    addComponent(component);
    return;
  }

  interceptAddComponent(
    () => addComponent(component, true),
    () => addComponent(component, false),
    {
      component,
    },
  );
};

/**
 * Update the data of a custom component and save it to the workflow.
 */
const handleUpdateComponent = async (component: PopulatedComponent | PopulatedCustomComponent) => {
  if (!selectedNodeId.value) return;

  workflowStore.updateNodeData(selectedNodeId.value, component);
};

/** Prepare state to add new component on edge / between two previous ones and open modal */
const handleAddComponentOnEdgeRequest = async (id: string) => {
  addComponentModalIsOpen.value = true;
  tmpId.value = id || null;
  addComponentType.value = ['input-output'];

  if (id) {
    addType.value = 'between';
  }
};

/** Prepare state to add new component after a previous one and open modal */
const handleAddComponentRequested = (id?: string) => {
  addComponentModalIsOpen.value = true;
  tmpId.value = id || null;
  addComponentType.value = ['output'];

  if (id) {
    addType.value = 'after';
    addComponentType.value = ['input', 'input-output'];
  }
};

const handleAddSpecialComponentRequested = (type: ComponentType) => {
  if (type === 'custom') {
    addCustomComponentModalIsOpen.value = true;
  }
};

/** Try to save current workflow to local storage and communicate errors */
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

/** Try to share current workflow and communicate errors */
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

// Watchers

// Clear custom component to edit when modal is closed
watch(addCustomComponentModalIsOpen, (isOpen) => {
  if (!isOpen) {
    editCustomComponent.value = null;
  }
});

// Clear selected node when detail modal is closed
watch(detailModalIsOpen, (isOpen) => {
  if (!isOpen) {
    selectedNode.value = null;
  }
});
</script>

<template>
  <div class="workflow-checker">
    <WorkflowPlane
      class="workflow-plane"
      @nodeClicked="handleNodeClick"
      @add-component-requested="handleAddComponentRequested"
      @add-component-requested-edge="handleAddComponentOnEdgeRequest"
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
    />
    <AddComponentModal
      v-model="addComponentModalIsOpen"
      @add-component="handleAddComponent"
      @add-special-component="handleAddSpecialComponentRequested"
      :type="addComponentType"
    />
    <SharedModal v-if="sharedWorkflowId" v-model="sharedModalIsOpen" :id="sharedWorkflowId" />
    <VersionInterceptionModal
      v-if="versionInterceptionData.component"
      v-model="versionInterceptionModalIsOpen"
      :component="versionInterceptionData.component"
      @confirm="confirmVersionInterceptionModal"
      @abort="abortVersionInterceptionModal"
    />
    <AddCustomComponentModal
      v-model="addCustomComponentModalIsOpen"
      @add-custom-component="(component, type) => addComponent(component, undefined, type)"
      @update-custom-component="handleUpdateComponent"
      :initial-data="editCustomComponent"
    />
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
