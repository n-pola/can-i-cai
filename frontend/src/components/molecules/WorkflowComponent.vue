<script setup lang="ts">
import { defineProps, computed, ref } from 'vue';
import { type PopulatedComponent, type PopulatedCustomComponent } from 'cic-shared';
import { useI18n } from 'vue-i18n';

// Component setup
const props = withDefaults(
  defineProps<{
    component: PopulatedComponent | PopulatedCustomComponent;
    showCompatibility?: boolean;
    showDelete?: boolean;
  }>(),
  {
    showCompatibility: true,
    showDelete: true,
  },
);

const emit = defineEmits<{
  delete: [];
}>();

// Hooks
const i18n = useI18n();

// Data
const componentRef = ref<HTMLElement | null>(null);

// Computed values
const manufacturer = computed(() =>
  typeof props.component.manufacturer === 'string'
    ? props.component.manufacturer
    : props.component.manufacturer.name,
);

// Functions
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
        'component__category--compatible': component.compatible && showCompatibility,
        'component__category--incompatible': !component.compatible && showCompatibility,
        'component__category--neutral': !showCompatibility,
      }"
    >
      <span class="material-symbols-outlined icon--m">{{ component.category.icon }}</span>
    </div>
    <div class="component__content">
      <h4 :title="component.name" class="component__title">{{ component.name }}</h4>
      <p class="component__manufacturer">{{ manufacturer }}</p>
    </div>
    <div class="component__action" v-if="showDelete">
      <button
        class="component__delete"
        @click="handleDeleteClick"
        type="button"
        :title="i18n.t('workflowChecker.actions.deleteComponent')"
      >
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

    #{$self}__category--neutral {
      color: $lightest;
      background-color: $dark;
    }
  }

  &__category {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    color: $lightest;

    &--neutral {
      color: $darkest;
      background-color: $light;
    }

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
