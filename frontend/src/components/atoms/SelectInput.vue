<script setup lang="ts">
import type { SelectOption } from '@/types/inputs';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Component setup
defineProps<{
  options: SelectOption[];
  id: string;
  label: string;
  required?: boolean;
}>();

const selectedValue = defineModel<string>();

// Hooks
const i18n = useI18n();

// Data
const selectElement = ref<HTMLSelectElement | null>(null);

// watch selected value and set select to default value if empty
// emit change event to keep track of change in vue data
watch(selectedValue, (value) => {
  if (!value) {
    window.requestAnimationFrame(() => {
      selectElement.value!.selectedIndex = 0;
      selectElement.value!.dispatchEvent(new Event('change'));
    });
  }
});
</script>

<template>
  <div class="select-input">
    <select
      :id="id"
      v-model="selectedValue"
      class="select-input__select"
      :aria-label="label"
      :required="required"
      ref="selectElement"
    >
      <option disabled hidden selected value>{{ i18n.t('selectOptionPlaceholder') }}</option>
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ option.name }}
      </option>
    </select>
    <span class="select-input__icon material-symbols-outlined icon--s">expand_more</span>
  </div>
</template>

<style lang="scss" scoped>
.select-input {
  display: flex;
  align-items: center;
  transform: translate3d(0, 0, 0);

  &__select {
    width: 100%;
    padding: $xxs;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-appearance: none;
    appearance: none;
    background-color: $lighter;
    border-radius: $border-radius;

    &:focus {
      outline: $primary;
    }
  }

  &__icon {
    position: absolute;
    right: $xxs;
    pointer-events: none;
    user-select: none;
  }
}
</style>
