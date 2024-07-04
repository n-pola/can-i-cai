<script setup lang="ts">
import type {
  PopulatedComponent,
  PopulatedCustomComponent,
  ComponentType,
  ComponentFunctionType,
} from 'cic-shared';
import { onUnmounted, ref, watch, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';
import { useComponentsStore } from '@/stores/components';
import { useGlobalStore } from '@/stores/global';
import { useI18n } from 'vue-i18n';
import { shareWorkflow } from '@/api/workflow';
import type { FrontendNode } from '@/types/workflow';
import { useModalInterception } from '@/hooks/useModalInterception';
import { externalImageCategory } from '@/constants/externalImageCategory';
import type { PlaneMode } from '@/types/checkerPlane';

import WorkflowPlane from '@/components/organisms/WorkflowPlane.vue';
import ComponentDetailModal from '@/components/organisms/ComponentDetailModal.vue';
import AddComponentModal from '@/components/organisms/AddComponentModal.vue';
import WorkflowSummary from '@/components/organisms/WorkflowSummary.vue';
import MobileSummary from '@/components/organisms/MobileSummary.vue';
import CheckerTools from '@/components/organisms/CheckerTools.vue';
import SharedModal from '@/components/organisms/SharedModal.vue';
import VersionInterceptionModal from '@/components/organisms/VersionInterceptionModal.vue';
import AddCustomComponentModal from '@/components/organisms/AddCustomComponentModal.vue';
import ConfirmModal from '@/components/organisms/ConfirmModal.vue';
import CompatibilityLegend from '@/components/molecules/CompatibilityLegend.vue';
import { WorkflowStorageHelper } from '@/helpers/workflowStorageHelper';
import LegendModal from '@/components/organisms/LegendModal.vue';

// Hooks
const toast = useToast();
const workflowStore = useWorkflowStore();
const componentsStore = useComponentsStore();
const globalStore = useGlobalStore();
const i18n = useI18n();
const {
  interceptAction: interceptAddComponent,
  confirmAction: confirmVersionInterceptionModal,
  abortAction: abortVersionInterceptionModal,
  isOpen: versionInterceptionModalIsOpen,
  tmpData: versionInterceptionData,
} = useModalInterception();
const {
  interceptAction: interceptAddExternalImage,
  confirmAction: confirmAddExternalImage,
  abortAction: abortAddExternalImage,
  isOpen: addExternalImageModalIsOpen,
} = useModalInterception();
const {
  interceptAction: interceptClearWorkflow,
  confirmAction: confirmClearWorkflow,
  abortAction: abortClearWorkflow,
  isOpen: ClearWorkflowModalIsOpen,
} = useModalInterception();
const {
  interceptAction: interceptSaveWorkflow,
  confirmAction: confirmSaveWorkflow,
  abortAction: abortSaveWorkflow,
  isOpen: saveWorkflowModalIsOpen,
} = useModalInterception();
const {
  interceptAction: interceptAddAlternative,
  confirmAction: confirmAddAlternative,
  abortAction: abortAddAlternative,
  isOpen: addAlternativeModalIsOpen,
  tmpData: addAlternativeData,
} = useModalInterception();

// Data
const workflowPlane = ref<InstanceType<typeof WorkflowPlane> | null>(null);
const mode = ref<PlaneMode>('select');

const detailModalIsOpen = ref(false);
const selectedNode = ref<FrontendNode | null>(null);
const selectedNodeId = ref<string | null>(null);

const addComponentModalIsOpen = ref(false);
const addCustomComponentModalIsOpen = ref(false);
const addComponentType = ref<ComponentFunctionType[] | null>(null);
const tmpId = ref<string | null>(null);
const addType = ref<'after' | 'between' | 'before' | 'beside'>('after');
const editCustomComponent = ref<PopulatedCustomComponent | null>(null);

const sharedModalIsOpen = ref(false);
const sharedWorkflowId = ref<string | null>(null);

const legendModalIsOpen = ref(false);

// Functions

/** Handle node click event and open detail modal */
const handleNodeClick = (nodeId: string) => {
  const node = workflowStore.nodes.get(nodeId);
  if (!node) throw new Error(`Node with id ${nodeId} not found`);

  if (mode.value === 'delete') {
    workflowStore.removeNodeAndCloseGaps(nodeId);
    return;
  }

  selectedNodeId.value = nodeId;

  if (node.dataType === 'custom') {
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
      case 'before':
        workflowStore.addNodeBefore(component, tmpId.value, satisfiesMinimalVersion, type);
        break;
      case 'after':
        workflowStore.addNodeAfter(component, tmpId.value, satisfiesMinimalVersion, type);
        break;
      case 'between':
        workflowStore.addNodeBetween(component, tmpId.value, satisfiesMinimalVersion, type);
        break;
      case 'beside':
        workflowStore.addNodeBeside(component, tmpId.value, satisfiesMinimalVersion, type);
        break;
      default:
        throw new Error('Invalid add type');
    }
    tmpId.value = null;
    return;
  }

  workflowStore.addNode(component, undefined, undefined, satisfiesMinimalVersion, type);
};

const addExternalImage = (compatible: boolean) => {
  addComponent(
    {
      type: ['output'],
      name: 'externalImage.name',
      dataType: 'external-image',
      category: externalImageCategory,
      manufacturer: '',
      compatible,
      id: 'external-image',
    },
    undefined,
    'external-image',
  );
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
const handleAddComponentRequested = (id?: string, place?: 'before' | 'after' | 'beside') => {
  addComponentModalIsOpen.value = true;
  tmpId.value = id || null;
  addComponentType.value = ['output'];

  if (id) {
    addType.value = place ?? 'after';
    addComponentType.value =
      addType.value === 'after' ? ['input', 'input-output'] : ['output', 'input-output'];
  }
};

const handleAddSpecialComponentRequested = (type: ComponentType) => {
  if (type === 'custom') {
    addCustomComponentModalIsOpen.value = true;
  }

  if (type === 'external-image') {
    interceptAddExternalImage(
      () => addExternalImage(true),
      () => addExternalImage(false),
    );
  }
};

/** Save current workflow to local storage and communicate with toasts */
const saveWorkflow = () => {
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

  // If we have a workflow id we are handling an already saved workflow, so we
  // need to ask the user if they want to overwrite it or save it as a new one
  if (workflowStore.id) {
    interceptSaveWorkflow(
      // Overwrite current workflow
      () => {
        saveWorkflow();
      },
      // Save as new workflow
      () => {
        workflowStore.id = '';
        saveWorkflow();
      },
    );
    return;
  }

  saveWorkflow();
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

/** Ask user if he wants to replace the current component with the clicked one */
const handleAlternativeClicked = async (nodeId: string, componentId: string) => {
  const newComponent = await componentsStore.getComponent(componentId);
  const oldComponent = workflowStore.nodes.get(nodeId);
  if (!newComponent || !oldComponent) {
    detailModalIsOpen.value = false;
    toast.error(i18n.t('workflowChecker.toasts.loadComponentsError'));
    return;
  }

  interceptAddAlternative(
    () => {
      workflowStore.updateNodeData(nodeId, newComponent);
      detailModalIsOpen.value = false;
      toast.success(i18n.t('workflowChecker.toasts.replaceSuccess'));
    },
    () => {},
    {
      oldName: oldComponent.name,
      newName: newComponent.name,
    },
  );
};

/**
 * set the mode to move
 * Own function so the keyboard event listener can be removed
 */
const enableMoveMode = (e: KeyboardEvent) => {
  if (e.code !== 'Space') return;
  mode.value = 'move';
};

/**
 * set the mode to select
 * Own function so the keyboard event listener can be removed
 */
const disableMoveMode = (e: KeyboardEvent) => {
  if (e.code !== 'Space') return;
  mode.value = 'select';
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
    selectedNodeId.value = null;
  }
});

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', enableMoveMode);
  window.addEventListener('keyup', disableMoveMode);
});

onUnmounted(() => {
  window.removeEventListener('keydown', enableMoveMode);
  window.removeEventListener('keyup', disableMoveMode);
});
</script>

<template>
  <div class="workflow-checker">
    <WorkflowPlane
      class="workflow-checker__plane"
      @nodeClicked="handleNodeClick"
      @add-component-requested="handleAddComponentRequested"
      @add-component-requested-edge="handleAddComponentOnEdgeRequest"
      @delete-node="workflowStore.removeNodeAndCloseGaps"
      :mode="mode"
      ref="workflowPlane"
    />
    <aside class="workflow-checker__tools">
      <CheckerTools
        :mode="mode"
        @recenter="workflowPlane?.centerPlane"
        @clear-plane="
          interceptClearWorkflow(
            () => {
              workflowStore.clearWorkflow();
              WorkflowStorageHelper.clearCurrentWorkflow();
            },
            () => {},
          )
        "
        @update:mode="mode = $event"
        @save="handleSaveRequested"
        @share="handleShare"
        @show-legend="legendModalIsOpen = true"
      />
    </aside>
    <aside class="workflow-checker__summary">
      <WorkflowSummary
        v-if="!globalStore.isMobile"
        :componentCount="workflowStore.nodes.size"
        :workflowCompatible="workflowStore.compatible"
        :incompatibleComponents="workflowStore.incompatibleNodes"
        @node-click="handleNodeClick"
        @save="handleSaveRequested"
        @share="handleShare"
      />
      <MobileSummary
        v-else
        :componentCount="workflowStore.nodes.size"
        :workflowCompatible="workflowStore.compatible"
        :incompatibleComponents="workflowStore.incompatibleNodes"
        @node-click="handleNodeClick"
        @save="handleSaveRequested"
        @share="handleShare"
      />
    </aside>
    <aside class="workflow-checker__legend" v-if="!globalStore.isMobile">
      <CompatibilityLegend />
    </aside>
    <ComponentDetailModal
      v-if="selectedNode && selectedNodeId"
      v-model="detailModalIsOpen"
      :component="selectedNode"
      :node-id="selectedNodeId"
      @alternative-clicked="handleAlternativeClicked"
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
    <ConfirmModal
      v-model="addExternalImageModalIsOpen"
      :title="i18n.t('externalImage.modalTitle')"
      :message="i18n.t('externalImage.modalPrompt')"
      @confirm="confirmAddExternalImage"
      @abort="abortAddExternalImage"
      :confirm-text="i18n.t('yes')"
      :abort-text="i18n.t('no')"
    />
    <ConfirmModal
      v-model="ClearWorkflowModalIsOpen"
      color="error"
      :title="i18n.t('workflowChecker.clearWorkflowPrompt.title')"
      :message="i18n.t('workflowChecker.clearWorkflowPrompt.message')"
      @confirm="confirmClearWorkflow"
      @abort="abortClearWorkflow"
      confirm-color="error"
      :confirm-text="i18n.t('clear')"
    />
    <ConfirmModal
      v-model="saveWorkflowModalIsOpen"
      :title="i18n.t('workflowChecker.saveInterception.title')"
      :message="i18n.t('workflowChecker.saveInterception.message')"
      @confirm="confirmSaveWorkflow"
      @abort="abortSaveWorkflow"
      confirm-color="primary"
      :confirm-text="i18n.t('workflowChecker.saveInterception.overwrite')"
      :abort-text="i18n.t('workflowChecker.saveInterception.saveAsNew')"
    />
    <ConfirmModal
      v-model="addAlternativeModalIsOpen"
      :title="i18n.t('workflowChecker.addAlternative.title')"
      :message="
        i18n.t('workflowChecker.addAlternative.message', {
          oldComponent: addAlternativeData.oldName,
          newComponent: addAlternativeData.newName,
        })
      "
      @confirm="confirmAddAlternative"
      @abort="abortAddAlternative"
      confirm-color="primary"
      :confirm-text="i18n.t('yes')"
      :abort-text="i18n.t('no')"
    />
    <LegendModal v-model="legendModalIsOpen" />
  </div>
</template>

<style lang="scss" scoped>
.workflow-checker {
  display: grid;
  grid-template-columns: repeat($grid-columns, 1fr);
  gap: $grid-gap;
  align-items: center;
  height: 100%;
  margin: 0 $grid-margin;

  &__summary {
    z-index: 1;
    grid-column: 9 / span 2;

    @media screen and (width <= $bp-mobile) {
      position: absolute;
      bottom: 0;
      left: 0;
      grid-column: unset;
      width: 100%;
    }
  }

  &__tools {
    z-index: 1;
    grid-column: 1;

    @media screen and (width <= $bp-mobile) {
      position: absolute;
      top: $s;
    }
  }

  &__plane {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &__legend {
    position: absolute;
    bottom: $s;
    z-index: 1;
  }
}
</style>
