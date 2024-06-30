<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from '@/components/atoms/Button.vue';
import type { PlaneMode } from '@/types/checkerPlane';
import { useGlobalStore } from '@/stores/global';

// Component setup
defineProps<{
  mode: PlaneMode;
}>();

const emit = defineEmits<{
  'update:mode': [mode: PlaneMode];
  recenter: [];
  clearPlane: [];
  showLegend: [];
  share: [];
  save: [];
}>();

// Hooks
const i18n = useI18n();
const globalStore = useGlobalStore();
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
        v-if="!globalStore.isMobile"
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
        v-if="!globalStore.isMobile"
      />
      <Button
        class="checker-tool__button"
        :class="{
          'checker-tool__button--active': mode === 'delete',
        }"
        @click="mode === 'delete' ? emit('update:mode', 'select') : emit('update:mode', 'delete')"
        :title="i18n.t('workflowChecker.tools.delete')"
        icon="delete"
        :rounded="false"
        size="xs"
        icon-size="s"
        :icon-filled="true"
        v-if="globalStore.isMobile"
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
      <Button
        class="checker-tool__button"
        @click="emit('showLegend')"
        :title="i18n.t('workflowChecker.tools.showLegend')"
        icon="info"
        :rounded="false"
        size="xs"
        icon-size="s"
        v-if="globalStore.isMobile"
      />
    </div>
    <div class="checker-tool__group" v-if="globalStore.isMobile">
      <Button
        class="checker-tool__button"
        @click="emit('save')"
        :title="i18n.t('save')"
        icon="bookmark"
        :rounded="false"
        size="xs"
        icon-size="s"
      />
      <Button
        class="checker-tool__button"
        @click="emit('share')"
        :title="i18n.t('share')"
        icon="ios_share"
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

  @media screen and (width <= $bp-mobile) {
    flex-flow: row;
  }

  &__group {
    display: flex;
    flex-flow: column;
    overflow: hidden;
    border-radius: $border-radius;
    box-shadow: $shadow;

    @media screen and (width <= $bp-mobile) {
      flex-flow: row;
    }
  }

  &__button {
    color: $darkest;
    background-color: $lighter;

    &--active {
      color: $lightest;
      background-color: $secondary;
    }

    // when device can hover
    @media (hover: hover) {
      &:hover {
        color: $lightest;
        background-color: $secondary;
      }
    }
  }
}
</style>
