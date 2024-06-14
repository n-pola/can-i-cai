<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from '@/components/atoms/Button.vue';

// Component setup
defineProps<{
  mode: 'select' | 'move';
}>();

const emit = defineEmits<{
  'update:mode': [mode: 'select' | 'move'];
  recenter: [];
  clearPlane: [];
}>();

// Hooks
const i18n = useI18n();
</script>

<template>
  <div class="checker-tool">
    <div class="checker-tool__group">
      <Button
        class="checker-tool__button"
        :class="{
          'checker-tool__button--active': mode === 'move',
        }"
        @click="emit('update:mode', 'move')"
        :title="i18n.t('workflowChecker.tools.move')"
        icon="drag_pan"
        :rounded="false"
        size="xs"
        icon-size="s"
      />
      <Button
        class="checker-tool__button"
        :class="{
          'checker-tool__button--active': mode === 'select',
        }"
        @click="emit('update:mode', 'select')"
        :title="i18n.t('workflowChecker.tools.select')"
        icon="arrow_selector_tool"
        :rounded="false"
        size="xs"
        icon-size="s"
        :icon-filled="true"
      />
    </div>
    <div class="checker-tool__group">
      <Button
        class="checker-tool__button"
        @click="emit('recenter')"
        :title="i18n.t('workflowChecker.tools.recenter')"
        icon="recenter"
        :rounded="false"
        size="xs"
        icon-size="s"
      />
      <Button
        class="checker-tool__button"
        @click="emit('clearPlane')"
        :title="i18n.t('workflowChecker.tools.clearWorkflow')"
        icon="scan_delete"
        :rounded="false"
        size="xs"
        icon-size="s"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.checker-tool {
  display: inline-flex;
  flex-flow: column;
  gap: $xxs;

  &__group {
    display: flex;
    flex-flow: column;
    overflow: hidden;
    border-radius: $border-radius;
    box-shadow: $shadow;
  }

  &__button {
    color: $darkest;
    background-color: $lighter;

    &--active,
    &:hover {
      color: $lightest;
      background-color: $secondary;
    }
  }
}
</style>
