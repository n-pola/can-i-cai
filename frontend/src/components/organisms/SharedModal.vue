<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import Modal from '@/components/atoms/Modal.vue';
import InputBar from '@/components/molecules/InputBar.vue';

// Component setup
const props = defineProps<{
  id: string;
}>();

const isOpen = defineModel<boolean>();

// Hooks
const i18n = useI18n();

// Data
const { host, protocol } = window.location;

// Computed values
const shareLink = computed(() => `${protocol}//${host}/check/shared/${props.id}`);

// Functions
const copyToClipboard = () => {
  window.navigator.clipboard.writeText(shareLink.value);
};
</script>

<template>
  <Modal v-model="isOpen">
    <template #header>
      <h3>{{ i18n.t('sharedModal.title') }}</h3>
    </template>

    <template #default>
      <div class="shared-modal">
        <p>{{ i18n.t('sharedModal.success') }}</p>

        <p>
          {{ i18n.t('sharedModal.hintReshare') }}
        </p>

        <div class="shared-modal__link">
          <InputBar
            id="share-link"
            label="Share Link"
            icon="content_copy"
            :overflow-ellipsis="true"
            :model-value="shareLink"
            :readonly="true"
            @buttonClick="copyToClipboard"
            :button-title="i18n.t('copy')"
            @click="
              (e: InputEvent) => {
                (e.target as HTMLInputElement).select();
              }
            "
          />
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.shared-modal {
  display: flex;
  flex-flow: column;
  gap: $xxs;
  padding: $s $xs;

  &__link {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    overflow: hidden;
    border-radius: $border-radius;
  }
}
</style>
