<script setup lang="ts">
import CompatibilityLegend from '@/components/molecules/CompatibilityLegend.vue';
import Modal from '@/components/atoms/Modal.vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();

const isOpen = defineModel<boolean>();
</script>

<template>
  <Modal v-model="isOpen" title="Legend">
    <template #header>
      <h3>{{ i18n.t('legend') }}</h3>
    </template>

    <div>
      <CompatibilityLegend :use-tooltip="false" />
    </div>
  </Modal>
</template>
