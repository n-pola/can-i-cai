<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { searchComponents } from '@/api/search';
import HttpError from '@/types/httpError';
import type { CategoryResponse, SearchResponse } from 'cic-shared';
import type { ComponentType, AdditionalCategory } from '@/types/workflow';

import Modal from '@/components/atoms/Modal.vue';
import CategoryItem from '@/components/atoms/CategoryItem.vue';
import Button from '@/components/atoms/Button.vue';
import WorkflowComponent from '@/components/molecules/WorkflowComponent.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import InputBar from '@/components/molecules/InputBar.vue';

// Component setup
const isOpen = defineModel<boolean>();
const emit = defineEmits<{
  addComponent: [componentId: string, type: ComponentType];
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
const resetComponentState = () => {
  selectedCategoryId.value = null;
  selectedCategory.value = null;
  search.value = '';
  searchResult.value = null;
};

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
  resetComponentState();

  isOpen.value = false;
  emit('addComponent', componentId, 'component');
};

const handleAddSpecialComponent = (type: ComponentType) => {
  resetComponentState();

  isOpen.value = false;
  emit('addComponent', '', type);
};

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
    searchResult.value = await searchComponents(value);
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

const handleClearSearch = () => {
  search.value = '';
  searchResult.value = null;
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
      <div class="add-component-modal">
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
          </template>
          <template v-else-if="selectedCategory">
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
          @click="selectedCategoryId = null"
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
