<script setup lang="ts">
import type { Category } from 'cic-shared';
import { useI18n } from 'vue-i18n';

defineProps<{
  category: Category | Omit<Category, 'id'>;
}>();

const { locale } = useI18n();
</script>

<template>
  <div class="category">
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

  display: grid;
  grid-template-columns: auto 1fr;
  overflow: hidden;
  cursor: pointer;
  background-color: $lighter;
  border-radius: $border-radius;

  &:hover {
    background-color: $light;

    #{$self}__icon {
      color: $lightest;
      background-color: $dark;
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
