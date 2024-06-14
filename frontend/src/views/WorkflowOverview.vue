<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import WorkflowList from '@/components/organisms/WorkflowList.vue';
import { WorkflowStorageHelper } from '@/helpers/workflowStorageHelper';
import { useRouter } from 'vue-router';

const i18n = useI18n();
const router = useRouter();

const workflows = ref(WorkflowStorageHelper.getWorkflowStorage());

if (!workflows.value) {
  router.replace('/');
}

const handleDeleteAll = () => {
  // TODO: intercept with confirmation dialog
  WorkflowStorageHelper.clearAllWorkflows();
  router.replace('/');
  workflows.value = WorkflowStorageHelper.getWorkflowStorage();
};

const handleDelete = (id: string) => {
  // TODO: intercept with confirmation dialog
  WorkflowStorageHelper.removeWorkflow(id);
  workflows.value = WorkflowStorageHelper.getWorkflowStorage();
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
