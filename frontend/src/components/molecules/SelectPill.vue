<script setup lang="ts">
import Button from '@/components/atoms/Button.vue';

defineProps<{
  options: { id: string; name: string; disabled?: boolean; title?: string }[];
}>();

const selectedValue = defineModel<string>();
</script>

<template>
  <div class="select-pill">
    <Button
      v-for="option in options"
      :key="option.id"
      @click="selectedValue = option.id"
      :color="selectedValue === option.id ? 'primary' : 'lighter'"
      :title="option.title ?? option.name"
      :rounded="false"
      :disabled="option.disabled"
      class="select-pill__button"
    >
      {{ option.name }}
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.select-pill {
  display: inline-flex;
  max-width: fit-content;
  overflow: hidden;
  border-radius: 9999px;

  &__button {
    &:disabled {
      color: $light;
      pointer-events: all;
      cursor: not-allowed;
      background-color: $lighter;
    }
  }
}
</style>
