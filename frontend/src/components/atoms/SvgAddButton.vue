<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  x: number;
  y: number;
  size: number;
}>();

const iconStyle = computed(() => {
  return {
    fontSize: `${props.size}px`,
    width: `${props.size}px`,
    height: `${props.size}px`,
  };
});
</script>

<template>
  <foreignObject
    :x="x - size / 2"
    :y="y - size / 2"
    :width="size"
    :height="size"
    class="add-button"
  >
    <span class="material-symbols-outlined add-button__background" :style="iconStyle"
      >add_circle</span
    >
    <span class="material-symbols-outlined icon--fill add-button__foreground" :style="iconStyle"
      >add_circle</span
    >
  </foreignObject>
</template>

<style lang="scss" scoped>
.add-button {
  $self: &;

  cursor: pointer;

  &:hover {
    #{$self}__foreground {
      color: $dark;
    }
  }

  &__background {
    color: $lightest;
  }

  &__foreground {
    position: absolute;
    top: 0;
    left: 0;
    color: $light;
  }
}
</style>
