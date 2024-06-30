<script setup lang="ts">
import { type WorkflowStorageItem } from '@/types/workflow';
import { useI18n } from 'vue-i18n';

// Component setup
defineProps<{
  workflow: WorkflowStorageItem;
}>();

const emit = defineEmits<{
  delete: [];
}>();

// Hooks
const i18n = useI18n();

// Functions
const handleDeleteClick = (e: MouseEvent) => {
  e.stopImmediatePropagation();
  emit('delete');
};
</script>

<template>
  <div class="workflow-list-item">
    <div class="workflow-list-item__icon">
      <span class="material-symbols-outlined icon--m">account_tree</span>
    </div>
    <div class="workflow-list-item__body">
      <div class="workflow-list-item__content">
        <h3 :title="workflow.name" class="workflow-list-item__title">{{ workflow.name }}</h3>
        <p>
          {{ workflow.componentCount }} {{ i18n.t('component', workflow.componentCount) }},
          {{ new Date(workflow.updateAt).toLocaleDateString() }}
        </p>
      </div>
      <div class="workflow-list-item__action">
        <button
          class="workflow-list-item__delete"
          @click="handleDeleteClick"
          type="button"
          :title="i18n.t('deleteWorkflow')"
        >
          <span class="material-symbols-outlined icon--xxs">close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.workflow-list-item {
  $self: &;

  display: flex;
  height: $f-m * $lh-base + $f-xs * $lh-base + $xxs * 2;
  overflow: hidden;
  background-color: $lighter;
  border-radius: $border-radius;

  @media (hover: hover) {
    &:hover {
      cursor: pointer;
      background-color: $light;

      & #{$self}__icon {
        color: $lightest;
        background-color: $dark;
      }

      & #{$self}__delete {
        opacity: 1;
      }
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    color: $darkest;
    background-color: $light;
  }

  &__body {
    display: flex;
    width: 100%;
  }

  &__content {
    flex: 1;
    padding: $xxs;
    overflow: hidden;
  }

  &__delete {
    display: flex;
    padding: $xxs / 2;
    color: $lightest;
    background-color: $error;
    border-bottom-left-radius: $border-radius;

    &:hover {
      cursor: pointer;
    }

    @media (hover: hover) {
      opacity: 0;
    }
  }
}
</style>
