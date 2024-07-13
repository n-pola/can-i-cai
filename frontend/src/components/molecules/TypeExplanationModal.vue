<script setup lang="ts">
import Modal from '@/components/atoms/Modal.vue';
import { i18n } from '@/utils/i18n';

// Component setup
const isOpen = defineModel<boolean>();

// Data
const explanations = [
  {
    title: i18n.t('types.input'),
    content: i18n.t('typeExplanation.input'),
  },
  {
    title: i18n.t('types.input-output'),
    content: i18n.t('typeExplanation.input-output'),
  },
  {
    title: i18n.t('types.output'),
    content: i18n.t('typeExplanation.output'),
  },
];
</script>

<template>
  <Modal v-model="isOpen" :level="1">
    <template #header>
      <h3>{{ i18n.t('typeExplanation.title') }}</h3>
    </template>

    <div class="type-explanation">
      <section
        v-for="explanation in explanations"
        :key="explanation.title"
        class="type-explanation__entry"
      >
        <h4>{{ explanation.title }}</h4>
        <p>{{ explanation.content }}</p>
      </section>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.type-explanation {
  display: flex;
  flex-flow: column;
  gap: $s;
  padding: $s;
  overflow-y: auto;

  &__entry {
    & > *:not(:last-child) {
      margin-bottom: $xxs;
    }
  }
}
</style>
