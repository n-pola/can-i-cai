<script setup lang="ts">
import Modal from '@/components/atoms/Modal.vue';
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import BooleanInputPill from '@/components/molecules/BooleanInputPill.vue';
import SelectPill from '@/components/molecules/SelectPill.vue';
import SelectInput from '@/components/atoms/SelectInput.vue';
import { useCategoryStore } from '@/stores/category';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SupportedLanguage } from '@/types/language';
import type { ComponentBase, PopulatedCustomComponent, ComponentType } from 'cic-shared';
import { v4 as uuid } from 'uuid';

const isOpen = defineModel<boolean>();

const emit = defineEmits<{
  addCustomComponent: [component: PopulatedCustomComponent, type: ComponentType];
}>();

const categoryStore = useCategoryStore();
const { locale } = useI18n();

const name = ref('');
const manufacturer = ref('');
const category = ref('');
const type = ref<ComponentBase['type']>('input-output');
const compatible = ref(false);

const resetForm = () => {
  name.value = '';
  manufacturer.value = '';
  category.value = '';
  type.value = 'input-output';
  compatible.value = false;
};

const handleSubmit = (e: SubmitEvent) => {
  e.preventDefault();
  const fullCategory = categoryStore.categories.get(category.value);

  if (!fullCategory) {
    return;
  }

  const component: PopulatedCustomComponent = {
    id: uuid(),
    name: name.value,
    manufacturer: manufacturer.value,
    category: fullCategory,
    type: type.value,
    compatible: compatible.value,
  };

  emit('addCustomComponent', component, 'custom');
  (e.target as HTMLFormElement).reset();
  isOpen.value = false;
};

watch(isOpen, (value) => {
  if (!value) {
    resetForm();
  }
});
</script>

<template>
  <Modal v-model="isOpen" is-form @submit="handleSubmit">
    <template #header>
      <h3>Add Custom Component</h3>
    </template>

    <template #default>
      <div class="custom-component-modal__body">
        <div class="custom-component-modal__group">
          <label for="name" class="is-h4">Name</label>
          <TextInput
            class="custom-component-modal__input"
            id="name"
            label="Name"
            placeholder="Component name"
            v-model="name"
            required
          />
        </div>

        <div class="custom-component-modal__group">
          <label for="manufacturer" class="is-h4">Manufacturer</label>
          <TextInput
            id="manufacturer"
            label="Manufacturer"
            placeholder="Manufacturer"
            v-model="manufacturer"
            class="custom-component-modal__input"
          />
        </div>

        <div class="custom-component-modal__group">
          <label for="category" class="is-h4">Category</label>
          <SelectInput
            id="category"
            label="Category"
            :options="categoryStore.getCategoriesOptions(locale as SupportedLanguage)"
            v-model="category"
            :required="true"
          />
        </div>

        <div class="custom-component-modal__group">
          <label for="type" class="is-h4">Type</label>
          <SelectPill
            :options="[
              { id: 'input', name: 'Input' },
              { id: 'input-output', name: 'Input/Output' },
              { id: 'output', name: 'Output' },
            ]"
            v-model="type"
          />
        </div>

        <div class="custom-component-modal__group">
          <label for="compatible" class="is-h4">Compatible</label>
          <BooleanInputPill id="compatible" label="Compatible" v-model="compatible" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="custom-component-modal__footer">
        <Button @click="isOpen = false && resetForm()" type="reset" color="secondary"
          >Cancel</Button
        >
        <Button type="submit">Add</Button>
      </div>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.custom-component-modal {
  &__body {
    display: flex;
    flex-direction: column;
    gap: $s;
    width: 100%;
    padding: $s $xs 0;
    overflow-y: auto;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: $xxs;
  }

  &__footer {
    display: flex;
    gap: $xxs;
    justify-content: flex-end;
    padding: $s $xs;
  }

  &__input {
    box-sizing: border-box;
    width: 100%;
    padding: $xxs $xxs calc($xxs / 2);
    border-bottom: 2px solid $secondary;
    border-top-left-radius: $border-radius;
    border-top-right-radius: $border-radius;

    &:focus,
    &:hover {
      background-color: $lighter;
      border-color: $primary-light;
      outline: 0;
      box-shadow: none;
    }
  }
}
</style>
