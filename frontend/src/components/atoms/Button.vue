<script setup lang="ts">
import { type ButtonHTMLAttributes } from 'vue';

const props = withDefaults(
  defineProps<{
    type?: ButtonHTMLAttributes['type'];
    icon?: string;
    size?: 's' | 'm' | 'l';
    color?: 'primary' | 'secondary';
    fullWidth?: boolean;
    iconPosition: 'start' | 'end';
  }>(),
  {
    type: 'button',
    icon: undefined,
    size: 'm',
    color: 'primary',
    fullWidth: false,
    iconPosition: 'end',
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
    <span v-if="props.icon && iconPosition === 'start'" class="material-symbols-outlined">{{
      props.icon
    }}</span>
    <span><slot /></span>
    <span v-if="props.icon && iconPosition === 'end'" class="material-symbols-outlined">{{
      props.icon
    }}</span>
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  gap: $xxs;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;

  &:disabled {
    pointer-events: none;
    user-select: none;
    background-color: $light;
  }

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
