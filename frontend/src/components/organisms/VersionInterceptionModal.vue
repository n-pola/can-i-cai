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
      <div class="version-interception-modal__content">
        <I18nT keypath="addComponentModal.versionInterception" tag="p" scope="global">
          <template #component>
            <strong>{{ component.name }}</strong>
          </template>
          <template #version>
            <strong>{{ component.minimalRequiredVersion }}</strong>
          </template>
        </I18nT>
      </div>
    </template>

    <template #footer>
      <div class="version-interception-modal__footer">
        <Button color="secondary" @click="emit('decision', false)">
          {{ i18n.t('no') }}
        </Button>
        <Button @click="emit('decision', true)">
          {{ i18n.t('yes') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.version-interception-modal {
  &__content,
  &__footer {
    padding: $s $xs;
  }

  &__footer {
    display: flex;
    gap: $xxs;
    justify-content: flex-end;
    padding-top: 0;
  }
}
</style>
