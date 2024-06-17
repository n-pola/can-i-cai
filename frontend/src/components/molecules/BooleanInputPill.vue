<script setup lang="ts">
import Button from '@/components/atoms/Button.vue';

const value = defineModel<boolean>();
</script>

<template>
  <div class="bool-pill">
    <Button
      icon="close"
      size="xs"
      icon-size="s"
      @click="$emit('update:modelValue', false)"
      :rounded="false"
      class="bool-pill__button bool-pill__button--false"
      :class="{ 'bool-pill__button--active': !value }"
    />
    <Button
      icon="check"
      size="xs"
      icon-size="s"
      @click="$emit('update:modelValue', true)"
      :rounded="false"
      class="bool-pill__button bool-pill__button--true"
      :class="{ 'bool-pill__button--active': value }"
    />
  </div>
</template>

<style scoped lang="scss">
.bool-pill {
  display: flex;
  max-width: fit-content;
  overflow: hidden;
  border-radius: 9999px;

  &__button {
    $self: &;

    color: $darkest;
    background-color: $lighter;

    &--active,
    &:hover {
      color: $lightest;
      &#{$self}--true {
        background-color: $success;
      }

      &#{$self}--false {
        background-color: $error;
      }
    }
  }
}
</style>
