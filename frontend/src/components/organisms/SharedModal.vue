<script setup lang="ts">
import { computed, ref } from 'vue';
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
const showCopySuccess = ref(false);
const showCopyError = ref(false);

// Computed values
const shareLink = computed(() => `${protocol}//${host}/check/shared/${props.id}`);

// Functions
const copyToClipboard = async (e: Event) => {
  e?.preventDefault();
  e.stopImmediatePropagation();
  try {
    window.navigator.clipboard.writeText(shareLink.value);
    showCopySuccess.value = true;
  } catch (error) {
    showCopySuccess.value = false;
    showCopyError.value = true;
  }
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
        <div
          class="shared-modal__copy-status shared-modal__copy-status--success"
          v-if="showCopySuccess"
        >
          <p>{{ i18n.t('sharedModal.copySuccess') }}</p>
          <span class="material-symbols-outlined icon--s">check_circle</span>
        </div>
        <div
          class="shared-modal__copy-status shared-modal__copy-status--error"
          v-if="showCopyError"
        >
          <p>{{ i18n.t('sharedModal.copyError') }}</p>
          <span class="material-symbols-outlined icon--s">cancel</span>
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

  &__copy-status {
    display: flex;
    gap: $xxs / 2;
    align-items: center;

    &--success {
      color: $success;
    }

    &--error {
      color: $error;
    }
  }
}
</style>
