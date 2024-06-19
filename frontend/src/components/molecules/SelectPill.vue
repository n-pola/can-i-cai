<script setup lang="ts">
import Button from '@/components/atoms/Button.vue';

defineProps<{
  options: { id: string; name: string }[];
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
      :title="option.name"
      :rounded="false"
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
}
</style>
