<script setup lang="ts">
import type { Category } from 'cic-shared';
import { useI18n } from 'vue-i18n';
import type { AdditionalCategory } from '@/types/workflow';

// Component setup
const props = defineProps<{
  category: Category | AdditionalCategory;
  disabled?: boolean;
  disabledTitle: string;
}>();

// Hooks
const { locale } = useI18n();
</script>

<template>
  <div
    class="category"
    :class="{ 'category--disabled': props.disabled }"
    :title="disabled ? disabledTitle : category.name[locale as 'en' | 'de']"
  >
    <div class="category__icon">
      <span class="material-symbols-outlined icon--s">{{ category.icon }}</span>
    </div>
    <div class="category__content">
      <h4 class="category__heading">{{ category.name[locale as 'en' | 'de'] }}</h4>
      <span v-if="'id' in category" class="material-symbols-outlined icon--m">chevron_forward</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.category {
  $self: &;

  display: flex;
  height: $m + $xxs * 2;
  overflow: hidden;
  cursor: pointer;
  background-color: $lighter;
  border-radius: $border-radius;

  @media (hover: hover) {
    &:hover {
      background-color: $light;

      #{$self}__icon {
        color: $lightest;
        background-color: $dark;
      }
    }
  }

  &--disabled {
    color: $light;
    cursor: not-allowed;

    @media (hover: hover) {
      &:hover {
        background-color: $lighter;
        #{$self}__icon {
          color: $lighter;
          background-color: $light;
        }
      }
    }

    #{$self}__icon {
      color: $lighter;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    background-color: $light;
  }

  &__content {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding: $xxs;
  }

  &__heading {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
