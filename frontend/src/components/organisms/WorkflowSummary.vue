<script setup lang="ts">
import { computed } from 'vue';
import type { WorkflowStore } from '@/types/workflow';
import SummaryComponent from '@/components/molecules/SummaryComponent.vue';
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
      <div class="workflow-summary__content">
        <section>
          <h4>{{ i18n.t('summary.summary') }}</h4>
          <p>
            {{
              i18n.t('summary.componentCountHint', {
                compatibleCount: componentCount - incompatibleComponents.size,
                totalCount: componentCount,
              })
            }}
          </p>
        </section>
        <section v-if="incompatibleComponents.size">
          <h4>{{ i18n.t('summary.incompatibleComponents') }}</h4>
          <ul class="workflow-summary__component-list">
            <li
              class="workflow-summary__component-item"
              v-for="[id, component] in incompatibleComponents"
              :key="id"
            >
              <SummaryComponent
                :component="component"
                tabindex="0"
                @click="emit('nodeClick', id)"
              />
            </li>
          </ul>
        </section>
      </div>
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
  max-height: calc(100vh - $l - $s * 4);
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
    padding: $s $xs;
    overflow: hidden;
  }

  &__content {
    display: flex;
    flex-flow: column;
    gap: $s;
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    gap: $xxs;
    justify-content: flex-end;
  }

  &__component-list {
    padding: 0;
    margin-top: $xxs;
    list-style: none;
  }

  &__component-item:not(:last-child) {
    margin: $xxs 0;
  }
}
</style>
