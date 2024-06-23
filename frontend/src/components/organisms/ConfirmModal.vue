<script setup lang="ts">
import Modal from '@/components/atoms/Modal.vue';
import Button from '@/components/atoms/Button.vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();

withDefaults(
  defineProps<{
    color?: 'secondary' | 'primary' | 'error';
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: 'secondary' | 'primary' | 'error';
    abortText?: string;
  }>(),
  {
    color: 'secondary',
    confirmColor: 'primary',
    confirmText: '',
    abortText: '',
  },
);

const isOpen = defineModel<boolean>();

const emit = defineEmits<{
  confirm: [];
  abort: [];
}>();
</script>

<template>
  <Modal :color="color" v-model="isOpen">
    <template #header>
      <h3>{{ title }}</h3>
    </template>

    <template #default>
      <div class="confirm-modal__content">
        <p>{{ message }}</p>
      </div>
    </template>

    <template #footer>
      <div class="confirm-modal__footer">
        <Button @click="emit('abort')" color="secondary">{{ abortText || i18n.t('abort') }}</Button>
        <Button @click="emit('confirm')" :color="confirmColor">{{
          confirmText || i18n.t('confirm')
        }}</Button>
      </div>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.confirm-modal {
  &__content {
    padding: $s $xs 0;
  }

  &__footer {
    display: flex;
    gap: $xxs;
    justify-content: flex-end;
    padding: $s $xs;
  }
}
</style>
