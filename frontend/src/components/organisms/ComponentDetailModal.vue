<script setup lang="ts">
import { computed, ref, watchEffect, toRef } from 'vue';
import Modal from '@/components/atoms/Modal.vue';
import Button from '@/components/atoms/Button.vue';
import BooleanInputPill from '@/components/molecules/BooleanInputPill.vue';
import type { FrontendNode } from '@/types/workflow';
import { useI18n } from 'vue-i18n';

// Component setup
const props = defineProps<{
  component: FrontendNode;
}>();

const isOpen = defineModel<boolean>();
const showMissingInfo = ref(false);
const satisfiesMinimalVersion = toRef(props.component, 'satisfiesMinimalVersion');

// Hooks
const i18n = useI18n();

// Watchers
watchEffect(() => {
  if (!isOpen.value) {
    showMissingInfo.value = false;
  }
});

// Computed values
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
      title: i18n.t('detailModal.manufacturer'),
    },
    {
      value: props.component.category.name[i18n.locale.value as 'en' | 'de'],
      title: i18n.t('detailModal.category'),
    },
    {
      value: props.component.type,
      title: i18n.t('detailModal.type'),
    },
    {
      value: props.component.compatible ? 'check_circle' : 'cancel',
      title: i18n.t('detailModal.compatible'),
      isIcon: true,
      customClass: props.component.compatible
        ? 'component-details__icon--success'
        : 'component-details__icon--error',
    },
    {
      value:
        props.component.minimalRequiredVersion && `>= ${props.component.minimalRequiredVersion}`,
      title: i18n.t('detailModal.supportedVersions'),
    },
  ];
});
</script>

<template>
  <Modal v-model="isOpen">
    <template #header>
      <h3>{{ i18n.t('detailModal.title') }}</h3>
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
      <div
        class="component-details__detail"
        v-if="component.minimalRequiredVersion && satisfiesMinimalVersion !== undefined"
      >
        <h4>{{ i18n.t('detailModal.myVersionCompatible') }}</h4>
        <BooleanInputPill v-model="satisfiesMinimalVersion" />
      </div>
      <div v-if="component.additionalInfo" class="component-details__additional-info">
        <h4>{{ i18n.t('detailModal.additionalInfo') }}</h4>
        <div v-html="component.additionalInfo"></div>
      </div>
    </div>

    <template #footer>
      <div class="component-details__footer">
        <button
          class="component-details__correction-head"
          @click="showMissingInfo = !showMissingInfo"
          type="button"
        >
          <p>{{ i18n.t('detailModal.incorrectInfo') }}</p>
          <span class="material-symbols-outlined icon--s">{{
            showMissingInfo ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
          }}</span>
        </button>
        <div class="component-details__correction-body" v-show="showMissingInfo">
          <a href="mailto:n.polarek@live.de">
            <Button full-width color="secondary">{{
              i18n.t('detailModal.contactMaintainer')
            }}</Button>
          </a>
          <a href="https://github.com/n-pola/can-i-cai" target="_blank" rel="noopener noreferrer">
            <Button full-width>{{ i18n.t('detailModal.viewGithub') }}</Button>
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
  width: 100%;
  padding: $xs $s;
  overflow-y: auto;

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

    & :deep(a) {
      color: $primary;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
