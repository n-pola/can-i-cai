<script setup lang="ts">
import { type WorkflowStorageItem } from '@/types/workflow';
import Button from '@/components/atoms/Button.vue';
import { useI18n } from 'vue-i18n';
import WorkflowListItem from '@/components/molecules/WorkflowListItem.vue';
import { useRouter } from 'vue-router';

// Component setup
defineProps<{
  workflows: WorkflowStorageItem[];
}>();

const emit = defineEmits<{
  deleteAll: [];
  delete: [id: string];
}>();

// Hooks
const i18n = useI18n();
const router = useRouter();

// Functions
const handleWorkflowClick = (id: string) => {
  router.push(`/check/${id}`);
};
</script>

<template>
  <div class="workflow-list">
    <div class="workflow-list__actions">
      <Button color="error" @click="emit('deleteAll')">{{ i18n.t('deleteAll') }}</Button>
      <RouterLink to="/check">
        <Button>{{ i18n.t('new') }}</Button>
      </RouterLink>
    </div>
    <ul class="workflow-list__list">
      <li v-for="workflow in workflows" :key="workflow.id" class="workflow-list__list-item">
        <WorkflowListItem
          :workflow="workflow"
          @delete="emit('delete', workflow.id)"
          @click="handleWorkflowClick(workflow.id)"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.workflow-list {
  display: flex;
  flex-flow: column;
  gap: $xs;

  &__actions {
    display: flex;
    gap: $xxs;
    justify-content: flex-end;
  }

  &__list {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__list-item:not(:last-child) {
    margin-bottom: $xxs;
  }
}
</style>
