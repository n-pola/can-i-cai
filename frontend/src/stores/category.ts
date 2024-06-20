import type { Category, CategoryResponse, ComponentFunctionType } from 'cic-shared';
import { defineStore } from 'pinia';
import { getAllCategories, getCategory } from '@/api/categories';
import { useComponentsStore } from '@/stores/components';
import type { SelectOption } from '@/types/inputs';
import type { SupportedLanguage } from '@/types/language';

interface CategoryStore {
  categories: Map<string, Category | CategoryResponse>;
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryStore => ({
    categories: new Map(),
  }),
  getters: {
    getCategoriesOptions:
      (state) =>
      (language: SupportedLanguage): SelectOption[] => {
        return Array.from(state.categories.values()).map((category) => ({
          id: category.id,
          name: category.name[language],
        }));
      },
    getCategoriesByTypes:
      (state) =>
      (types: ComponentFunctionType[]): Category[] => {
        return Array.from(state.categories.values()).filter((category) =>
          category.types.some((categoryType) => types.includes(categoryType)),
        );
      },
  },
  actions: {
    async getAllCategories() {
      if (this.categories.size > 0) {
        return this.categories;
      }

      const categories = await getAllCategories();
      categories.forEach((category) => {
        this.categories.set(category.id, category);
      });

      return this.categories;
    },
    async getCategory(id: string) {
      const componentsStore = useComponentsStore();
      if (this.categories.has(id)) {
        const category = this.categories.get(id)!;

        if ('components' in category) {
          return category;
        }
      }

      const category = await getCategory(id);
      this.categories.set(id, category);

      category.components.forEach((component) => componentsStore.addComponent(component));

      return category;
    },
  },
});
