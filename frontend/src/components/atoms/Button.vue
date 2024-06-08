<script setup lang="ts">
import { type ButtonHTMLAttributes } from 'vue';

const props = withDefaults(
  defineProps<{
    type?: ButtonHTMLAttributes['type'];
    icon?: string;
    size?: 's' | 'm' | 'l';
    color?: 'primary' | 'secondary';
    fullWidth?: boolean;
  }>(),
  {
    type: 'button',
    icon: undefined,
    size: 'm',
    color: 'primary',
    fullWidth: false,
  },
);

const addOptionalClass = (condition: boolean, className: string) => (condition ? className : '');
</script>

<template>
  <button
    :type="props.type"
    class="button"
    :class="`button--${size} button--${color} ${addOptionalClass(fullWidth, 'button--fullwidth')}`"
  >
    <span><slot /></span>
    <span v-if="props.icon" class="material-symbols-outlined">{{ props.icon }}</span>
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  gap: $xxs;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;

  &:hover {
    cursor: pointer;
  }

  & > * {
    font-size: inherit;
    color: inherit;
  }

  &--fullwidth {
    width: 100%;
  }

  &--s {
    padding: $xxs $xs;
    font-size: $f-xxs;
  }

  &--m {
    padding: $xxs $xs;
  }

  &--l {
    padding: $xs $m;
    font-size: $f-s;
  }

  &--primary {
    color: $lightest;
    background-color: $primary;

    &:hover {
      background-color: $primary-light;
    }
  }

  &--secondary {
    color: $lightest;
    background-color: $secondary;

    &:hover {
      background-color: $secondary-light;
    }
  }
}
</style>
