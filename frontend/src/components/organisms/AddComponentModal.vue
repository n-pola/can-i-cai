<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { searchComponents } from '@/api/search';
import HttpError from '@/types/httpError';
import type {
  ComponentType,
  CategoryResponse,
  SearchResponse,
  ComponentFunctionType,
} from 'cic-shared';
import type { AdditionalCategory } from '@/types/workflow';

import Modal from '@/components/atoms/Modal.vue';
import CategoryItem from '@/components/atoms/CategoryItem.vue';
import Button from '@/components/atoms/Button.vue';
import WorkflowComponent from '@/components/molecules/WorkflowComponent.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import InputBar from '@/components/molecules/InputBar.vue';

// Component setup
const props = defineProps<{
  type: ComponentFunctionType[] | null;
}>();
const isOpen = defineModel<boolean>();
const emit = defineEmits<{
  addComponent: [componentId: string];
  addSpecialComponent: [type: ComponentType];
}>();

// Hooks
const categoryStore = useCategoryStore();
const toast = useToast();
const { locale, t: translate } = useI18n();

// Data
const categoriesLoading = ref(false);
const categoryLoading = ref(false);
const selectedCategoryId = ref<string | null>(null);
const selectedCategory = ref<CategoryResponse | null>(null);
const search = ref('');
const searchTimeout = ref<NodeJS.Timeout | null>(null);
const searchResult = ref<SearchResponse | null>(null);
const searchLoading = ref(false);
const searchError = ref<string | null>(null);
const modalContentElement = ref<HTMLDivElement | null>(null);

const additionalCategories: AdditionalCategory[] = [
  {
    name: {
      en: 'External Image',
      de: 'Externe Bilddatei',
    },
    icon: 'image',
    type: 'external-image',
    types: ['output'],
  },
  {
    name: {
      en: 'Custom',
      de: 'Benutzerdefiniert',
    },
    icon: 'dashboard_customize',
    type: 'custom',
    types: ['input', 'output', 'input-output'],
  },
];

// Functions

/** Scroll the content part of the modal to top */
const scrollToTop = () => {
  modalContentElement.value?.scrollTo({ top: 0, behavior: 'instant' });
};

/** Completely reset the modals state for next interaction/opening */
const resetComponentState = () => {
  selectedCategoryId.value = null;
  selectedCategory.value = null;
  search.value = '';
  searchResult.value = null;
  scrollToTop();
};

/** Load component for a category and populate ref with it */
const handleCategoryClick = (categoryId: string) => {
  if (!categoryStore.categorySatisfiesTypes(categoryId, props.type ?? [])) {
    return;
  }

  const timeout = setTimeout(() => {
    categoryLoading.value = true;
  }, 50);
  categoryStore
    .getCategory(categoryId)
    .then((category) => {
      selectedCategory.value = category;
      selectedCategoryId.value = categoryId;
      scrollToTop();
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

/** Emit the desire to add a predefined component to the workflow */
const handleAddComponent = (componentId: string) => {
  resetComponentState();

  isOpen.value = false;
  emit('addComponent', componentId);
};

/** Emit the request to add a special component */
const handleAddSpecialComponent = (type: ComponentType) => {
  resetComponentState();

  isOpen.value = false;
  emit('addSpecialComponent', type);
};

/** Handle api calls, errors and clearing in context of search */
const handleSearch = async (value: string) => {
  if (!value.length) {
    searchResult.value = null;
    return;
  }

  if (value.length < 3) {
    searchError.value = translate('addComponentModal.errors.minCharacters', { minCharacters: 3 });
    return;
  }

  try {
    searchError.value = null;
    searchLoading.value = true;
    searchResult.value = await searchComponents(value, props.type ?? []);
  } catch (error: HttpError | unknown) {
    if (error instanceof HttpError && error.statusCode === 404) {
      searchResult.value = [];
      return;
    }
    toast.error(translate('addComponentModal.errors.searchFailed'));
    searchResult.value = null;
  } finally {
    searchLoading.value = false;
  }
};

/** Clear search related data */
const handleClearSearch = () => {
  search.value = '';
  searchResult.value = null;
};

/** Go back to categories overview */
const handleBack = () => {
  selectedCategoryId.value = null;
  scrollToTop();
};

// Watchers
watch(search, (value) => {
  // Debounce the search input
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    handleSearch(value);
  }, 300);
});

// Reset state when modal is closed
watch(isOpen, (value) => {
  if (!value) {
    resetComponentState();
  }
});

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
      <h3>{{ translate('addComponentModal.title') }}</h3>
    </template>
    <template #default>
      <div class="add-component-modal" ref="modalContentElement">
        <div class="add-component-modal__search">
          <InputBar
            id="cic-search"
            :label="translate('addComponentModal.searchComponents')"
            v-model="search"
            :placeholder="`${translate('search')}...`"
            @button-click="handleClearSearch"
            :icon="search ? 'close' : 'search'"
            :button-title="
              search ? translate('addComponentModal.clearSearch') : translate('search')
            "
          />
          <p v-if="searchError" class="add-component-modal__search-error">{{ searchError }}</p>
        </div>
        <div class="add-component-modal__content">
          <div
            v-if="categoriesLoading || categoryLoading || searchLoading"
            class="add-component-modal__loading"
          >
            <LoadingSpinner />
          </div>
          <template v-if="searchResult">
            <h4>Search Result</h4>
            <template v-if="searchResult.length">
              <WorkflowComponent
                v-for="component in searchResult"
                :key="component.id"
                @click="handleAddComponent(component.id)"
                :component="component"
                :show-compatibility="false"
                :show-delete="false"
                tabindex="0"
              />
            </template>
            <p v-else>No components found</p>
          </template>
          <template v-else-if="categoryStore.categories.size > 0 && selectedCategoryId === null">
            <h4>{{ translate('category', 2) }}</h4>
            <CategoryItem
              v-for="[, category] in categoryStore.categories"
              :key="category.id"
              :category="category"
              @click="handleCategoryClick(category.id)"
              @keypress.enter="handleCategoryClick(category.id)"
              tabindex="0"
              :disabled="!categoryStore.categorySatisfiesTypes(category.id, type ?? [])"
              :disabled-title="translate('addComponentModal.errors.categoryNotCorrectType')"
            />
            <CategoryItem
              v-for="category in additionalCategories"
              :key="category.name[locale as 'de' | 'en']"
              :category="category"
              @click="handleAddSpecialComponent(category.type)"
              @keypress.enter="handleAddSpecialComponent(category.type)"
              tabindex="0"
              :disabled="!category.types.some((t) => type?.includes(t))"
              :disabled-title="translate('addComponentModal.errors.categoryNotCorrectType')"
            />
          </template>
          <template v-else-if="selectedCategory">
            <h4>{{ selectedCategory.name[locale as 'de' | 'en'] }}</h4>
            <WorkflowComponent
              v-for="component in selectedCategory.components.filter((c) =>
                c.type.some((t) => type?.includes(t)),
              )"
              :key="component.id"
              @click="handleAddComponent(component.id)"
              :component="component"
              :show-compatibility="false"
              :show-delete="false"
              tabindex="0"
            />
          </template>
          <div v-else>
            <p>Something went wrong, please try again later.</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="add-component-modal__footer">
        <Button
          icon="chevron_backward"
          icon-position="start"
          :disabled="
            categoriesLoading || categoryLoading || selectedCategoryId === null || searchResult
          "
          @click="handleBack"
          >{{ translate('back') }}</Button
        >
      </div>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.add-component-modal {
  width: 100%;
  overflow-y: auto;

  &__search {
    position: sticky;
    top: 0;
    padding: $s $xs;
    background-color: $lightest;
  }

  &__search-error {
    margin-top: $xxs;
    color: $error;
  }

  &__content {
    display: flex;
    flex-flow: column;
    gap: $xxs;
    padding: 0 $xs;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    padding: $s $xs;
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
    background-color: $darkest-50;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: $modal-content-max-height;
  }
}
</style>
