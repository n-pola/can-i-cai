import type { Category, CategoryResponse } from 'cic-shared';
import { defineStore } from 'pinia';
import { getAllCategories, getCategory } from '@/api/categories';

interface CategoryStore {
  categories: Map<string, Category | CategoryResponse>;
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryStore => ({
    categories: new Map(),
  }),
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
      if (this.categories.has(id)) {
        const category = this.categories.get(id)!;

        if ('components' in category) {
          return category;
        }
      }

      const category = await getCategory(id);
      this.categories.set(id, category);

      return category;
    },
  },
});
