<script setup lang="ts">
import Modal from '@/components/atoms/Modal.vue';
import Button from '@/components/atoms/Button.vue';
import TextInput from '@/components/atoms/TextInput.vue';
import BooleanInputPill from '@/components/molecules/BooleanInputPill.vue';
import SelectPill from '@/components/molecules/SelectPill.vue';
import SelectInput from '@/components/atoms/SelectInput.vue';
import { useCategoryStore } from '@/stores/category';
import { ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SupportedLanguage } from '@/types/language';
import type { PopulatedCustomComponent, ComponentType, ComponentFunctionType } from 'cic-shared';
import { v4 as uuid } from 'uuid';
import ToolTip from '@/components/molecules/ToolTip.vue';
import { i18n } from '@/utils/i18n';
import TypeExplanationModal from '@/components/molecules/TypeExplanationModal.vue';
import { useWorkflowStore } from '@/stores/workflow';
import { hashString } from '@/utils/hashString';
import { useModalInterception } from '@/hooks/useModalInterception';
import ConfirmModal from '@/components/organisms/ConfirmModal.vue';

// Component definition
const props = defineProps<{
  initialData: PopulatedCustomComponent | null;
}>();

const isOpen = defineModel<boolean>();

const emit = defineEmits<{
  addCustomComponent: [component: PopulatedCustomComponent, type: ComponentType];
  updateCustomComponent: [component: PopulatedCustomComponent, type: ComponentType];
}>();

// Hooks
const categoryStore = useCategoryStore();
const { locale, t: translate } = useI18n();
const workflowStore = useWorkflowStore();
const {
  interceptAction: interceptModalClose,
  confirmAction: confirmModalClose,
  abortAction: abortModalClose,
  isOpen: modalCloseModalIsOpen,
} = useModalInterception();

// Data
const name = ref('');
const manufacturer = ref('');
const category = ref('');
const type = ref<ComponentFunctionType>('input-output');
const compatible = ref(false);
const modalContentElement = ref<HTMLDivElement | null>(null);
const showTypeExplanationModal = ref(false);
const initialHash = ref<string | null>(null);

// Functions

/** Create a custom component object from current form data */
const createActiveComponent = (): PopulatedCustomComponent => {
  return {
    id: uuid(),
    name: name.value,
    manufacturer: manufacturer.value,
    category: categoryStore.categories.get(category.value)!,
    type: [type.value],
    compatible: compatible.value,
  };
};

/** Reset the form to its original state */
const resetForm = async () => {
  name.value = '';
  manufacturer.value = '';
  category.value = '';
  type.value = 'input-output';
  compatible.value = false;

  const nodeString = workflowStore.calcCustomNodeString(createActiveComponent());
  initialHash.value = await hashString(nodeString);

  modalContentElement.value?.scrollTo(0, 0);
};

/**
 * Check if there are unsaved changes in the modal and intercept modal closing
 * accordingly
 */
const handleModalClose = async (value: boolean) => {
  if (initialHash.value && value === false) {
    const currentComponentString = workflowStore.calcCustomNodeString(createActiveComponent());
    const currentHash = await hashString(currentComponentString);

    // Show modal interception if user changed values and wants to close the
    // modal without saving
    if (initialHash.value !== currentHash) {
      return interceptModalClose(
        () => {
          isOpen.value = value;
        },
        () => {
          isOpen.value = true;
        },
      );
    }
  }

  isOpen.value = value;
  return undefined;
};

/** Bring values in correct form, emit event and reset form for next usage */
const handleSubmit = (e: SubmitEvent) => {
  e.preventDefault();

  const component = createActiveComponent();

  if (props.initialData) {
    emit('updateCustomComponent', component, 'custom');
  } else {
    emit('addCustomComponent', component, 'custom');
  }

  (e.target as HTMLFormElement).reset();
  isOpen.value = false;
};

// Watchers

// Reset form when modal is closed
watchEffect(() => {
  if (!isOpen.value) {
    resetForm();
  }
});

// Set value to initial data when it changes
watch(
  () => props.initialData,
  async (value) => {
    if (value) {
      name.value = value.name;
      manufacturer.value = value.manufacturer;
      category.value = value.category.id;
      [type.value] = value.type;
      compatible.value = value.compatible;

      const nodeString = workflowStore.calcCustomNodeString(createActiveComponent());
      initialHash.value = await hashString(nodeString);
    }
  },
);
</script>

<template>
  <Modal
    :model-value="isOpen"
    @update:model-value="handleModalClose"
    is-form
    @submit="handleSubmit"
  >
    <template #header>
      <h3>
        {{
          initialData
            ? translate('customComponentModal.titleEdit')
            : translate('customComponentModal.titleAdd')
        }}
      </h3>
    </template>

    <template #default>
      <div class="custom-component-modal__body" ref="modalContentElement">
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
          <label for="manufacturer" class="is-h4">{{
            translate('detailModal.manufacturer')
          }}</label>
          <TextInput
            id="manufacturer"
            label="Manufacturer"
            placeholder="Manufacturer"
            v-model="manufacturer"
            class="custom-component-modal__input"
          />
        </div>

        <div class="custom-component-modal__group">
          <label for="category" class="is-h4">{{ translate('detailModal.category') }}</label>
          <SelectInput
            id="category"
            label="Category"
            :options="categoryStore.getCategoriesOptions(locale as SupportedLanguage)"
            v-model="category"
            :required="true"
          />
        </div>

        <div class="custom-component-modal__group">
          <label for="type" class="is-h4 custom-component-modal__label">
            {{ translate('detailModal.type') }}
            <ToolTip :content="i18n.t('helpTooltip')" :tool-tip-id="`tooltip-type-help`">
              <span
                class="material-symbols-outlined icon--s"
                @click="showTypeExplanationModal = !showTypeExplanationModal"
                @keypress.enter="showTypeExplanationModal = !showTypeExplanationModal"
                :aria-describedby="`tooltip-type-help`"
                >help</span
              >
            </ToolTip>
          </label>
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
          <label for="compatible" class="is-h4">{{ translate('detailModal.compatible') }}</label>
          <BooleanInputPill id="compatible" label="Compatible" v-model="compatible" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="custom-component-modal__footer">
        <Button @click="isOpen = false && resetForm()" type="reset" color="secondary">{{
          translate('cancel')
        }}</Button>
        <Button type="submit">{{ initialData ? translate('update') : translate('add') }}</Button>
      </div>
    </template>
  </Modal>

  <TypeExplanationModal v-model="showTypeExplanationModal" />

  <ConfirmModal
    v-model="modalCloseModalIsOpen"
    :level="1"
    :title="i18n.t('customComponentModal.closeInterception.title')"
    :message="i18n.t('customComponentModal.closeInterception.message')"
    @confirm="confirmModalClose"
    @abort="abortModalClose"
    color="error"
    confirm-color="error"
    :confirm-text="i18n.t('yes')"
    :abort-text="i18n.t('no')"
  />
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

  &__label {
    display: flex;
    gap: $xxs;
    align-items: center;
  }
}
</style>
