<script setup lang="ts">
import { computed, ref } from 'vue';
import type { WorkflowStore } from '@/types/workflow';
import SummaryContent from '@/components/molecules/SummaryContent.vue';
import { useI18n } from 'vue-i18n';

// Component setup
const props = defineProps<{
  workflowCompatible: boolean;
  componentCount: number;
  incompatibleComponents: WorkflowStore['nodes'];
}>();

const emit = defineEmits<{
  nodeClick: [componentId: string];
  save: [];
  share: [];
}>();

// Hooks
const i18n = useI18n();

// Data
const contentRef = ref<HTMLDivElement | null>(null);
const isOpen = ref(false);

// Computed values
const icon = computed(() => {
  if (props.componentCount === 0) {
    return 'error';
  }

  if (isOpen.value) {
    return 'expand_more';
  }

  return 'expand_less';
});

const title = computed(() => {
  if (props.workflowCompatible) {
    return 'You can CAI!';
  }

  return "You can't CAI";
});

const height = computed(() => {
  if (contentRef.value) {
    return isOpen.value ? `${contentRef.value.scrollHeight}px` : '0';
  }

  return undefined;
});
</script>

<template>
  <div v-if="componentCount === 0" class="workflow-summary">
    <header class="workflow-summary__header workflow-summary__header--information">
      <h3 class="workflow-summary__title">{{ i18n.t('summary.addComponentsShort') }}</h3>
      <span class="material-symbols-outlined icon--m">{{ icon }}</span>
    </header>
  </div>
  <div v-else class="workflow-summary">
    <header
      class="workflow-summary__header"
      :class="{
        'workflow-summary__header--compatible': workflowCompatible,
        'workflow-summary__header--incompatible': !workflowCompatible,
      }"
      @click="isOpen = !isOpen"
      @keydown="isOpen = !isOpen"
    >
      <h3 class="workflow-summary__title">{{ title }}</h3>
      <span class="material-symbols-outlined icon--m">{{ icon }}</span>
    </header>
    <div class="workflow-summary__body" :style="{ height }">
      <div ref="contentRef">
        <SummaryContent
          :componentCount="componentCount"
          :incompatibleComponents="incompatibleComponents"
          @nodeClick="emit('nodeClick', $event)"
        />
        <footer class="workflow-summary__footer">
          <RouterLink to="/imprint" class="footer-legal">{{ i18n.t('imprint') }}</RouterLink>
          <span> | </span>
          <RouterLink to="/privacy" class="footer-legal">{{ i18n.t('privacyPolicy') }}</RouterLink>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.workflow-summary {
  display: flex;
  flex-flow: column;
  max-height: calc(100vh - $l - $s * 4);
  overflow: hidden;
  background-color: $lighter;
  border-top-left-radius: $border-radius;
  border-top-right-radius: $border-radius;
  box-shadow: $shadow-top;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $xs $s;

    &--information {
      color: $lightest;
      background-color: $secondary;
    }

    &--compatible {
      color: $lightest;
      background-color: $success;
    }

    &--incompatible {
      color: $lightest;
      background-color: $error;
    }
  }

  &__body {
    overflow: hidden;
    transition: height 0.3s ease-in-out;
  }

  &__footer {
    display: flex;
    gap: $xxs;
    justify-content: flex-end;
    padding: $s $xs;
    padding-top: 0;
  }
}
</style>
