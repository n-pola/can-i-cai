<script setup lang="ts">
import { computed, defineProps } from 'vue';
import { type PopulatedComponent, type PopulatedCustomComponent } from 'cic-shared';
import { useI18n } from 'vue-i18n';

// Component setup
const props = defineProps<{
  component: PopulatedComponent | PopulatedCustomComponent;
}>();

// Hooks
const i18n = useI18n();

// Computed
const componentName = computed(() =>
  props.component.dataType === 'external-image'
    ? i18n.t(props.component.name)
    : props.component.name,
);
</script>

<template>
  <div class="component">
    <div class="component__category">
      <span class="material-symbols-outlined icon--s">{{ component.category.icon }}</span>
    </div>
    <div class="component__content">
      <p :title="componentName" class="component__title">{{ componentName }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.component {
  $self: &;

  display: grid;
  grid-template-columns: auto 1fr auto;
  overflow: hidden;
  user-select: none;
  background-color: $lightest;
  border-radius: $border-radius;

  &:hover {
    cursor: pointer;
    background-color: $light;
  }

  &__category {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    color: $lightest;
    background-color: $error;
  }

  &__content {
    padding: $xxs;
    overflow: hidden;

    & > * {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
