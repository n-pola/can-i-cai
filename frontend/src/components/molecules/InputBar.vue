<script setup lang="ts">
import TextInput from '@/components/atoms/TextInput.vue';
import Button from '@/components/atoms/Button.vue';

// Component setup
defineProps<{
  id: string;
  label: string;
  icon: string;
  placeholder?: string;
  inputReadonly?: boolean;
  buttonTitle?: string;
  overflowEllipsis?: boolean;
}>();

const input = defineModel<string>();

const emit = defineEmits<{
  buttonClick: [];
}>();
</script>

<template>
  <div class="input-bar">
    <TextInput
      :id="id"
      :label="label"
      v-model="input"
      :placeholder="placeholder"
      class="input-bar__input"
      :class="{ 'input-bar__input--ellipsis': overflowEllipsis }"
      :readonly="inputReadonly"
    />
    <Button
      size="xs"
      :icon="icon"
      icon-size="s"
      :rounded="false"
      :title="buttonTitle"
      class="input-bar__icon"
      @click="emit('buttonClick')"
    ></Button>
  </div>
</template>

<style lang="scss" scoped>
.input-bar {
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

    &--ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__icon {
    height: 100%;
    aspect-ratio: 1;
  }
}
</style>
