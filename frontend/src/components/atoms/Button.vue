<script setup lang="ts">
import { type ButtonHTMLAttributes } from 'vue';

// Component setup
const props = withDefaults(
  defineProps<{
    type?: ButtonHTMLAttributes['type'];
    icon?: string;
    size?: 'xs' | 's' | 'm' | 'l';
    color?: 'primary' | 'secondary' | 'error' | 'lighter';
    fullWidth?: boolean;
    iconPosition?: 'start' | 'end';
    iconSize?: 'xxs' | 's' | 'm' | undefined;
    iconFilled?: boolean;
    rounded?: boolean;
  }>(),
  {
    type: 'button',
    icon: undefined,
    size: 'm',
    color: 'primary',
    fullWidth: false,
    iconPosition: 'end',
    iconSize: undefined,
    rounded: true,
    iconFilled: false,
  },
);

// Functions

/**
 * Add a class to the button if a condition is met
 * @param condition - The condition to check
 * @param className - The class to add
 * @returns The class to add or an empty string
 */
const addOptionalClass = (condition: boolean, className: string) => (condition ? className : '');
</script>

<template>
  <button
    :type="props.type"
    class="button"
    :class="`button--${size} button--${color} ${addOptionalClass(fullWidth, 'button--fullwidth')} ${addOptionalClass(rounded, 'button--rounded')}`"
  >
    <span
      v-if="props.icon && iconPosition === 'start'"
      class="material-symbols-outlined"
      :class="`${addOptionalClass(!!iconSize, `icon--${iconSize}`)} ${addOptionalClass(iconFilled, 'icon--fill')}`"
      >{{ props.icon }}</span
    >
    <span v-if="$slots.default"><slot /></span>
    <span
      v-if="props.icon && iconPosition === 'end'"
      class="material-symbols-outlined"
      :class="`${addOptionalClass(!!iconSize, `icon--${iconSize}`)} ${addOptionalClass(iconFilled, 'icon--fill')}`"
      >{{ props.icon }}</span
    >
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  gap: $xxs;
  align-items: center;
  justify-content: center;

  &--rounded {
    border-radius: 9999px;
  }

  &:disabled {
    pointer-events: none;
    user-select: none;
    background-color: $light;
  }

  &:hover {
    cursor: pointer;
  }

  & > *:not([class*='icon--']) {
    font-size: inherit;
    color: inherit;
  }

  &--fullwidth {
    width: 100%;
  }

  &--xs {
    padding: $xxs $xxs;
    font-size: $f-xxs;
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

    @media (hover: hover) {
      &:hover {
        background-color: $primary-light;
      }
    }
  }

  &--secondary {
    color: $lightest;
    background-color: $secondary;

    @media (hover: hover) {
      &:hover {
        background-color: $secondary-light;
      }
    }
  }

  &--error {
    color: $lightest;
    background-color: $error;

    @media (hover: hover) {
      &:hover {
        background-color: $error-light;
      }
    }
  }

  &--lighter {
    background-color: $lighter;

    @media (hover: hover) {
      &:hover {
        background-color: $light;
      }
    }
  }
}
</style>
