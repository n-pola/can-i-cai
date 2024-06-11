<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import type { Node } from 'cic-shared';
import Modal from '@/components/atoms/Modal.vue';
import Button from '@/components/atoms/Button.vue';

const props = defineProps<{
  component: Node;
  id: string;
}>();

const isOpen = defineModel<boolean>();
const showMissingInfo = ref(false);

watchEffect(() => {
  if (!isOpen.value) {
    showMissingInfo.value = false;
  }
});

const content = computed(() => {
  return [
    {
      value: props.component.name,
      title: 'Name',
    },
    {
      value:
        typeof props.component.manufacturer === 'string'
          ? props.component.manufacturer
          : props.component.manufacturer.name,
      title: 'Manufacturer',
    },
    {
      value: props.component.category.name.en,
      title: 'Category',
    },
    {
      value: props.component.type,
      title: 'Type',
    },
    {
      value: props.component.compatible ? 'check_circle' : 'cancel',
      title: 'Compatible',
      isIcon: true,
      customClass: props.component.compatible
        ? 'component-details__icon--success'
        : 'component-details__icon--error',
    },
    {
      value:
        props.component.minimalRequiredVersion && `>= ${props.component.minimalRequiredVersion}`,
      title: 'Supported versions',
    },
  ];
});
</script>

<template>
  <Modal v-model="isOpen">
    <template #header>
      <h3>Component Details</h3>
    </template>

    <div class="component-details">
      <div
        v-for="(item, index) in content.filter((item) => item.value)"
        :key="index"
        class="component-details__detail"
      >
        <h4>{{ item.title }}</h4>
        <span
          v-if="item.isIcon"
          class="material-symbols-outlined icon--m icon--fill"
          :class="item.customClass"
          >{{ item.value }}</span
        >
        <h5 v-else>{{ item.value }}</h5>
      </div>
      <div v-if="component.additionalInfo" class="component-details__additional-info">
        <h4>Additional Informations</h4>
        <p>{{ component.additionalInfo }}</p>
      </div>
    </div>

    <template #footer>
      <div class="component-details__footer">
        <button
          class="component-details__correction-head"
          @click="showMissingInfo = !showMissingInfo"
          type="button"
        >
          <p>Incorrect Informations?</p>
          <span class="material-symbols-outlined icon--s">{{
            showMissingInfo ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
          }}</span>
        </button>
        <div class="component-details__correction-body" v-show="showMissingInfo">
          <a href="mailto:n.polarek@live.de">
            <Button full-width color="secondary">Contact Maintainer</Button>
          </a>
          <a href="https://github.com/n-pola/can-i-cai" target="_blank" rel="noopener noreferrer">
            <Button full-width>View on GitHub</Button>
          </a>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.component-details {
  display: flex;
  flex-direction: column;
  gap: $xs;

  &__detail {
    display: flex;
    justify-content: space-between;
  }

  &__icon {
    &--success {
      color: $success;
    }

    &--error {
      color: $error;
    }
  }

  &__footer {
    background-color: $lighter;
  }

  &__correction-head {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: $xxs $xs;
    cursor: pointer;
  }

  &__correction-body {
    display: flex;
    gap: $xxs;
    padding: $xxs $xs $s $xs;

    & > * {
      flex: 1;
    }
  }

  &__additional-info {
    display: flex;
    flex-direction: column;
    gap: $xxs;
  }
}
</style>
