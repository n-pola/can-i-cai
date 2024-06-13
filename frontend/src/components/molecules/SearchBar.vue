<script setup lang="ts">
import TextInput from '@/components/atoms/TextInput.vue';
import Button from '@/components/atoms/Button.vue';
import { computed } from 'vue';

// Component setup
const search = defineModel<string>();
const emit = defineEmits<{
  clearSearch: [];
}>();

// Computed values
const icon = computed(() => {
  return search.value ? 'close' : 'search';
});
</script>

<template>
  <div class="search-bar">
    <TextInput
      id="cic-search"
      label="Search components"
      v-model="search"
      placeholder="Search..."
      class="search-bar__input"
    />
    <Button
      size="xs"
      :icon="icon"
      icon-size="s"
      :rounded="false"
      class="search-bar__icon"
      @click="search && emit('clearSearch')"
    ></Button>
  </div>
</template>

<style lang="scss" scoped>
.search-bar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  overflow: hidden;
  border-radius: $border-radius;

  &__input {
    flex: 1;
    padding: $xxs $xs;
    background-color: $lighter;
    border: 1px solid transparent;
    border-top-left-radius: $border-radius;
    border-bottom-left-radius: $border-radius;

    &:focus {
      border: 1px solid $primary;
      outline: none;
    }
  }

  &__icon {
    height: 100%;
    aspect-ratio: 1;
  }
}
</style>
