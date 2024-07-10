<script setup lang="ts">
defineProps<{
  content: string;
  toolTipId: string;
}>();
</script>

<template>
  <div class="tooltip__wrap" tabindex="0">
    <slot></slot>
    <div class="tooltip">
      <div class="tooltip__content">
        <div :id="toolTipId">{{ content }}</div>
      </div>
      <div class="tooltip__arrow"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tooltip {
  $self: &;

  position: absolute;
  inset-block-end: 150%;
  display: flex;
  justify-content: center;
  width: 4 * $xxl;
  margin-inline-start: (-2 * $xxl) + $xxs;
  color: $lighter;
  visibility: hidden;
  opacity: 0;

  &__content {
    display: inline-flex;
    max-width: 100%;
    padding: $xxs;
    background-color: $darker;
    border-radius: $border-radius;
    transition: opacity $animation;
  }

  &__wrap {
    position: relative;
    display: flex;

    &:hover,
    &:focus-within {
      & #{$self} {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  &__arrow {
    position: absolute;
    right: 0;
    bottom: -$xxs / 2;
    left: 0;
    width: $xxs;
    height: $xxs;
    margin: 0 auto;
    background-color: $darker;
    transform: rotate(45deg);
  }
}

:slotted(*) {
  cursor: pointer;
}
</style>
