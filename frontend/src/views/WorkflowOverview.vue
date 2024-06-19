<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import WorkflowList from '@/components/organisms/WorkflowList.vue';
import { WorkflowStorageHelper } from '@/helpers/workflowStorageHelper';
import { useRouter } from 'vue-router';
import { useModalInterception } from '@/hooks/useModalInterception';
import ConfirmModal from '@/components/organisms/ConfirmModal.vue';

// Hooks
const i18n = useI18n();
const router = useRouter();
const {
  interceptAction: interceptDeleteAll,
  confirmAction: confirmDeleteAll,
  abortAction: abortDeleteAll,
  isOpen: deleteAllModalIsOpen,
} = useModalInterception();
const {
  interceptAction: interceptDelete,
  confirmAction: confirmDelete,
  abortAction: abortDelete,
  isOpen: deleteModalIsOpen,
  tmpData: deleteTmpData,
} = useModalInterception();

// Data
const workflows = ref(WorkflowStorageHelper.getWorkflowStorage());

if (!workflows.value) {
  router.replace('/');
}

// Functions
const deleteAllWorkflows = () => {
  WorkflowStorageHelper.clearAllWorkflows();
  router.replace('/');
  workflows.value = WorkflowStorageHelper.getWorkflowStorage();
};

const handleDeleteAll = () => {
  interceptDeleteAll(deleteAllWorkflows, () => {});
};

const handleDelete = (id: string) => {
  const workflow = workflows.value?.find((w) => w.id === id);

  if (!workflow) {
    return;
  }

  interceptDelete(
    () => {
      WorkflowStorageHelper.removeWorkflow(id);
      workflows.value = WorkflowStorageHelper.getWorkflowStorage();
    },
    () => {},
    { name: workflow.name },
  );
};
</script>

<template>
  <div class="workflow-overview">
    <section class="workflow-overview__content">
      <h1>{{ i18n.t('yourWorkflows') }}</h1>
      <WorkflowList
        v-if="workflows"
        :workflows="workflows"
        @delete="handleDelete"
        @delete-all="handleDeleteAll"
      />
    </section>
  </div>
  <ConfirmModal
    v-model="deleteAllModalIsOpen"
    @confirm="confirmDeleteAll"
    @abort="abortDeleteAll"
    :title="i18n.t('deleteWorkflows')"
    :message="i18n.t('deleteAllWorkflowsConfirmation')"
    color="error"
    confirm-color="error"
    :confirm-text="i18n.t('delete')"
  />
  <ConfirmModal
    v-model="deleteModalIsOpen"
    @confirm="confirmDelete"
    @abort="abortDelete"
    :title="i18n.t('deleteWorkflow')"
    :message="i18n.t('deleteWorkflowConfirmation', { name: deleteTmpData.name })"
    color="error"
    confirm-color="error"
    :confirm-text="i18n.t('delete')"
  />
</template>

<style lang="scss" scoped>
.workflow-overview {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: $s;
  height: 100%;
  padding: $l;

  &__content {
    display: flex;
    flex-flow: column;
    grid-column: 4 / span 4;
    gap: $l;
  }
}
</style>
