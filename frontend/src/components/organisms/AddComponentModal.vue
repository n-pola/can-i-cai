<script setup lang="ts">
import Modal from '@/components/atoms/Modal.vue';
import { onMounted, ref } from 'vue';
import { useCategoryStore } from '@/stores/category';
import CategoryItem from '@/components/atoms/CategoryItem.vue';
import type { CategoryResponse } from 'cic-shared';
import { useToast } from 'vue-toastification';
import Button from '@/components/atoms/Button.vue';
import { useI18n } from 'vue-i18n';
import WorkflowComponent from '@/components/molecules/WorkflowComponent.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import type { ComponentType, AdditionalCategory } from '@/types/workflow';

// Component setup
const isOpen = defineModel<boolean>();
const emit = defineEmits<{
  addComponent: [componentId: string, type: ComponentType];
}>();

// Hooks
const categoryStore = useCategoryStore();
const toast = useToast();
const { locale } = useI18n();

// Data
const categoriesLoading = ref(false);
const categoryLoading = ref(false);
const selectedCategoryId = ref<string | null>(null);
const selectedCategory = ref<CategoryResponse | null>(null);

const additionalCategories: AdditionalCategory[] = [
  {
    name: {
      en: 'External Image',
      de: 'Externe Bilddatei',
    },
    icon: 'image',
    type: 'external-image',
  },
  {
    name: {
      en: 'Custom',
      de: 'Benutzerdefiniert',
    },
    icon: 'dashboard_customize',
    type: 'custom',
  },
];

// Functions
const handleCategoryClick = (categoryId: string) => {
  const timeout = setTimeout(() => {
    categoryLoading.value = true;
  }, 50);
  categoryStore
    .getCategory(categoryId)
    .then((category) => {
      selectedCategory.value = category;
      selectedCategoryId.value = categoryId;
    })
    .catch(() => {
      selectedCategoryId.value = null;
      selectedCategory.value = null;
      toast.error('Failed to load category');
      isOpen.value = false;
    })
    .finally(() => {
      clearTimeout(timeout);
      categoryLoading.value = false;
    });
};

const handleAddComponent = (componentId: string) => {
  selectedCategoryId.value = null;
  selectedCategory.value = null;
  isOpen.value = false;
  emit('addComponent', componentId, 'component');
};

const handleAddSpecialComponent = (type: ComponentType) => {
  selectedCategoryId.value = null;
  selectedCategory.value = null;
  isOpen.value = false;
  emit('addComponent', '', type);
};

// Lifecycle hooks
onMounted(async () => {
  categoriesLoading.value = true;
  categoryStore.getAllCategories().finally(() => {
    categoriesLoading.value = false;
  });
});
</script>

<template>
  <Modal v-model="isOpen">
    <template #header>
      <h3>Add Component</h3>
    </template>
    <template #default>
      <div class="add-component-modal">
        <div v-if="categoriesLoading || categoryLoading" class="add-component-modal__loading">
          <LoadingSpinner />
        </div>
        <div
          class="add-component-modal__categories"
          v-if="categoryStore.categories.size > 0 && selectedCategoryId === null"
        >
          <h4>Categories</h4>
          <CategoryItem
            v-for="[id, category] in categoryStore.categories"
            :key="id"
            :category="category"
            @click="handleCategoryClick(id)"
            @keypress.enter="handleCategoryClick(id)"
            tabindex="0"
          />
          <CategoryItem
            v-for="category in additionalCategories"
            :key="category.name[locale as 'de' | 'en']"
            :category="category"
            @click="handleAddSpecialComponent(category.type)"
            @keypress.enter="handleAddComponent(category.name[locale as 'de' | 'en'])"
            tabindex="0"
          />
        </div>
        <div v-else-if="selectedCategory" class="add-component-modal__components">
          <h4>{{ selectedCategory.name[locale as 'de' | 'en'] }}</h4>
          <WorkflowComponent
            v-for="component in selectedCategory.components"
            :key="component.id"
            @click="handleAddComponent(component.id)"
            :component="component"
            :show-compatibility="false"
            :show-delete="false"
            tabindex="0"
          />
        </div>
        <div v-else>
          <p>Something went wrong, please try again later.</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="add-component-modal__footer">
        <Button
          icon="chevron_backward"
          icon-position="start"
          :disabled="categoriesLoading || categoryLoading || selectedCategoryId === null"
          @click="selectedCategoryId = null"
          >Back</Button
        >
      </div>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.add-component-modal {
  &__categories {
    display: flex;
    flex-flow: column;
    gap: $xxs;
  }

  &__components {
    display: flex;
    flex-flow: column;
    gap: $xxs;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    padding: $s $xs;
    padding-top: 0;
  }

  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgba($darkest, 0.5);
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: $modal-content-max-height;
  }
}
</style>
