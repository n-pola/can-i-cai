<script setup lang="ts">
import type { PopulatedComponent } from 'cic-shared';
import { I18nT, useI18n } from 'vue-i18n';
import Modal from '@/components/atoms/Modal.vue';
import Button from '@/components/atoms/Button.vue';

defineProps<{
  component: PopulatedComponent;
}>();

const isOpen = defineModel<boolean>();

const emit = defineEmits<{
  decision: [aboveMinimalVersion: boolean];
}>();

const i18n = useI18n();
</script>

<template>
  <Modal v-model="isOpen">
    <template #header>
      <h3>{{ i18n.t('addComponentModal.title') }}</h3>
    </template>

    <template #default>
      <I18nT keypath="addComponentModal.versionInterception" tag="p" scope="global">
        <template #component>
          <strong>{{ component.name }}</strong>
        </template>
        <template #version>
          <strong>{{ component.minimalRequiredVersion }}</strong>
        </template>
      </I18nT>
    </template>

    <template #footer>
      <Button color="secondary" @click="emit('decision', false)">
        {{ i18n.t('no') }}
      </Button>
      <Button @click="emit('decision', true)">
        {{ i18n.t('yes') }}
      </Button>
    </template>
  </Modal>
</template>
