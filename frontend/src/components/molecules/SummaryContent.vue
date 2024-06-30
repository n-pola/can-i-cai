<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WorkflowStore } from '@/types/workflow';
import SummaryComponent from '@/components/molecules/SummaryComponent.vue';

// Component setup
defineProps<{
  componentCount: number;
  incompatibleComponents: WorkflowStore['nodes'];
}>();

const emit = defineEmits<{
  nodeClick: [id: string];
}>();

// Hooks
const i18n = useI18n();
</script>

<template>
  <div class="summary-content">
    <section>
      <h4>{{ i18n.t('summary.summary') }}</h4>
      <p>
        {{
          i18n.t(
            'summary.componentCountHint',
            {
              compatibleCount: componentCount - incompatibleComponents.size,
              totalCount: componentCount,
            },
            componentCount,
          )
        }}
      </p>
    </section>
    <section v-if="incompatibleComponents.size">
      <h4>{{ i18n.t('summary.incompatibleComponents') }}</h4>
      <ul class="summary-content__component-list">
        <li
          class="summary-content__component-item"
          v-for="[id, component] in incompatibleComponents"
          :key="id"
        >
          <SummaryComponent :component="component" tabindex="0" @click="emit('nodeClick', id)" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.summary-content {
  display: flex;
  flex-flow: column;
  gap: $s;
  padding: $s $xs;

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
