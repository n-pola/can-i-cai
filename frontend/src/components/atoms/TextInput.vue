<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'text' | 'email' | 'url';
    label: string;
    id: string;
    placeholder?: string;
    readonly?: boolean;
  }>(),
  {
    type: 'text',
    placeholder: '',
    readonly: false,
  },
);

const value = defineModel<string>();
</script>

<template>
  <input
    :id="id"
    type="text"
    class="text-input"
    v-model="value"
    :aria-label="label"
    :placeholder="placeholder"
    :readonly="readonly"
  />
</template>
