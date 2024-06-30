<script setup lang="ts">
import { defineProps, computed, ref } from 'vue';
import { type PopulatedComponent, type PopulatedCustomComponent } from 'cic-shared';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores/global';

// Component setup
const props = withDefaults(
  defineProps<{
    component: PopulatedComponent | PopulatedCustomComponent;
    showCompatibility?: boolean;
    showDelete?: boolean;
    compatible?: boolean;
  }>(),
  {
    showCompatibility: true,
    showDelete: true,
    compatible: false,
  },
);

const emit = defineEmits<{
  delete: [];
}>();

// Hooks
const i18n = useI18n();
const globalStore = useGlobalStore();

// Data
const componentRef = ref<HTMLElement | null>(null);

// Computed values
const manufacturer = computed(() =>
  typeof props.component.manufacturer === 'string'
    ? props.component.manufacturer
    : props.component.manufacturer.name,
);

const componentName = computed(() =>
  props.component.dataType === 'external-image'
    ? i18n.t(props.component.name)
    : props.component.name,
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
        'component__category--compatible': compatible && showCompatibility,
        'component__category--incompatible': !compatible && showCompatibility,
        'component__category--neutral': !showCompatibility,
      }"
    >
      <span class="material-symbols-outlined icon--m">{{ component.category.icon }}</span>
    </div>
    <div class="component__content">
      <h4 :title="componentName" class="component__title">{{ componentName }}</h4>
      <p class="component__manufacturer">{{ manufacturer || '&nbsp;' }}</p>
    </div>
    <div class="component__actions" v-if="showDelete">
      <button
        class="component__delete component__action"
        @click="handleDeleteClick"
        type="button"
        :title="i18n.t('workflowChecker.actions.deleteComponent')"
        v-if="!globalStore.isMobile"
      >
        <span class="material-symbols-outlined icon--xxs">close</span>
      </button>
      <span v-else />

      <button
        type="button"
        disabled
        class="component__info component__action"
        v-if="component.additionalInfo"
      >
        <span class="material-symbols-outlined icon--xxs">info_i</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.component {
  $self: &;

  display: flex;
  height: $f-s * $lh-base + $f-xs * $lh-base + $xxs * 2;
  overflow: hidden;
  user-select: none;
  background-color: $lighter;
  border-radius: $border-radius;

  &:hover,
  &:focus {
    cursor: pointer;
    background-color: $light;

    #{$self}__delete {
      opacity: 1;
    }

    #{$self}__info {
      color: $lightest;
      background-color: $dark;
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
    flex: 1;
    padding: $xxs;
    overflow: hidden;

    & > * {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__actions {
    display: flex;
    flex-flow: column;
    justify-content: space-between;
  }

  &__action {
    display: flex;
    padding: $xxs / 2;
  }

  &__delete {
    color: $lightest;
    background-color: $error;
    border-bottom-left-radius: $border-radius;
    opacity: 0;

    &:hover {
      cursor: pointer;
    }
  }

  &__info {
    color: $darkest;
    background-color: $light;
    border-top-left-radius: $border-radius;
  }
}
</style>
