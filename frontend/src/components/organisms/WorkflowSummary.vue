<script setup lang="ts">
import { computed } from 'vue';
import type { WorkflowStore } from '@/types/workflow';
import SummaryContent from '@/components/molecules/SummaryContent.vue';
import Button from '@/components/atoms/Button.vue';
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

// Computed values
const icon = computed(() => {
  if (props.componentCount === 0) {
    return 'error';
  }

  if (props.workflowCompatible) {
    return 'check_circle';
  }

  return 'cancel';
});

const title = computed(() => {
  if (props.workflowCompatible) {
    return 'You can CAI!';
  }

  return "You can't CAI";
});
</script>

<template>
  <div v-if="componentCount === 0" class="workflow-summary">
    <header class="workflow-summary__header workflow-summary__header--information">
      <h3 class="workflow-summary__title">Can I CAI?</h3>
      <span class="material-symbols-outlined icon--m">{{ icon }}</span>
    </header>
    <div class="workflow-summary__body">
      <div class="workflow-summary__content">
        <section>
          <h4>{{ i18n.t('summary.information') }}</h4>
          <p>{{ i18n.t('summary.addComponentsHint') }}</p>
        </section>
      </div>
    </div>
  </div>
  <div v-else class="workflow-summary">
    <header
      class="workflow-summary__header"
      :class="{
        'workflow-summary__header--compatible': workflowCompatible,
        'workflow-summary__header--incompatible': !workflowCompatible,
      }"
    >
      <h3 class="workflow-summary__title">{{ title }}</h3>
      <span class="material-symbols-outlined icon--m">{{ icon }}</span>
    </header>
    <div class="workflow-summary__body">
      <SummaryContent
        :componentCount="componentCount"
        :incompatibleComponents="incompatibleComponents"
        @nodeClick="emit('nodeClick', $event)"
      />
      <footer class="workflow-summary__footer">
        <Button full-width color="secondary" @click="emit('save')">{{ i18n.t('save') }}</Button>
        <Button full-width @click="emit('share')">{{ i18n.t('share') }}</Button>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.workflow-summary {
  display: flex;
  flex-flow: column;
  max-height: calc(
    100dvh - $l - $s * 4 - ($s * 2 + $f-xs * $lh-base)
  ); // Height - header - legal area - spacing

  margin-top: $s;
  margin-bottom: calc($s * 2 + $f-xs * $lh-base);
  overflow: hidden;
  background-color: $lighter;
  border-radius: $border-radius;
  box-shadow: $shadow;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $xxs $xs;

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
    display: flex;
    flex-flow: column;
    gap: $s;
    overflow-y: hidden;
  }

  &__footer {
    display: flex;
    gap: $xxs;
    justify-content: flex-end;
    padding: $s $xs;
    padding-top: 0;
  }

  &__content {
    padding: $s $xs;
  }
}
</style>
