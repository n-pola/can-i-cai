<script setup lang="ts">
import { ref, watchEffect, defineProps, withDefaults, defineModel } from 'vue';
import Button from '@/components/atoms/Button.vue';

// Component props
withDefaults(
  defineProps<{
    color?: 'secondary' | 'primary' | 'error';
    isForm?: boolean;
    level?: number;
  }>(),
  {
    color: 'secondary',
    isForm: false,
    level: 0,
  },
);

const isOpen = defineModel<boolean>();

// Data
const dialog = ref<HTMLDialogElement | null>(null);

// Effects
watchEffect(() => {
  if (isOpen.value) {
    dialog.value?.showModal();
  } else {
    dialog.value?.close();
  }
});

// Methods
const handleClose = () => {
  isOpen.value = false;
};

const handleClick = (event: Event) => {
  if (event.target === dialog.value) {
    handleClose();
  }
};
</script>

<template>
  <dialog
    class="modal"
    ref="dialog"
    @close="handleClose"
    @click="handleClick"
    @keypress.esc="handleClick"
    :style="{
      width: `calc(var(--modal-width) * (1 - ${level / 10}))`,
    }"
  >
    <header class="modal__header" :class="`modal__header--${color}`">
      <slot name="header">
        <h3>Default Header</h3>
      </slot>

      <button class="modal__close-button" @click="handleClose" type="button">
        <span class="material-symbols-outlined icon--m">close</span>
      </button>
    </header>

    <form v-if="isForm" class="modal__form">
      <div class="modal__content">
        <slot>
          <p>Default Content</p>
        </slot>
      </div>

      <footer class="modal__footer">
        <slot name="footer">
          <Button type="submit" color="primary">Submit</Button>
        </slot>
      </footer>
    </form>
    <template v-else>
      <div class="modal__content">
        <slot>
          <p>Default Content</p>
        </slot>
      </div>

      <footer class="modal__footer" v-if="$slots.footer">
        <slot name="footer">
          <p>default footer</p>
        </slot>
      </footer>
    </template>
  </dialog>
</template>

<style lang="scss" scoped>
.modal {
  width: $modal-width;
  max-width: calc(100vw - $grid-margin * 2);
  max-height: calc(100vh - $s);
  padding: 0;
  margin: auto;
  overflow: hidden;
  background-color: transparent;
  border: 0;
  border-radius: $border-radius;

  &[open],
  &__form {
    display: flex;
    flex-flow: column;
    overflow: hidden;
  }

  &::backdrop {
    background-color: rgb(0 0 0 / 50%);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $xxs $xs;

    &--primary {
      color: $lightest;
      background-color: $primary;
    }

    &--secondary {
      color: $lightest;
      background-color: $secondary;
    }

    &--error {
      color: $lightest;
      background-color: $error;
    }
  }

  &__close-button {
    display: flex;
    padding: 0;
    cursor: pointer;
  }

  &__content {
    display: flex;
    max-height: $modal-content-max-height;
    overflow: hidden;
    background-color: $lightest;
  }

  &__footer {
    background-color: $lightest;
  }
}
</style>
