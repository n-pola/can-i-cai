<script setup lang="ts">
import { defineProps, computed, ref } from 'vue';
import { type PopulatedComponent, type PopulatedCustomComponent } from 'cic-shared';

const props = defineProps<{
  component: PopulatedComponent | PopulatedCustomComponent;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const componentRef = ref<HTMLElement | null>(null);

const manufacturer = computed(() =>
  typeof props.component.manufacturer === 'string'
    ? props.component.manufacturer
    : props.component.manufacturer.name,
);

const handleDeleteClick = (e: MouseEvent) => {
  e.stopImmediatePropagation();
  emit('delete');
};

defineExpose({
  componentRef,
});
</script>

<template>
  <div class="component" ref="componentRef">
    <div
      class="component__category"
      :class="{
        'component__category--compatible': component.compatible,
        'component__category--incompatible': !component.compatible,
      }"
    >
      <span class="material-symbols-outlined icon--m">{{ component.category.icon }}</span>
    </div>
    <div class="component__content">
      <h3 class="component__title">{{ component.name }}</h3>
      <p class="component__manufacturer">{{ manufacturer }}</p>
    </div>
    <div class="component__action">
      <button class="component__delete" @click="handleDeleteClick" type="button">
        <span class="material-symbols-outlined icon--xxs">close</span>
      </button>
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
  background-color: $lighter;
  border-radius: $border-radius;

  &:hover {
    cursor: pointer;
    background-color: $light;

    #{$self}__delete {
      display: block;
    }
  }

  &__category {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    color: $lightest;

    &--compatible {
      background-color: $success;
    }

    &--incompatible {
      background-color: $error;
    }
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

  &__delete {
    display: none;
    color: $lightest;
    background-color: $error;
    border-bottom-left-radius: $border-radius;

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
