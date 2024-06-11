import { config } from '@/config';
import type { CategoriesResponse, CategoryResponse } from 'cic-shared';

export const getAllCategories = async (): Promise<CategoriesResponse> =>
  fetch(`${config.api.url}/categories`).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  });

export const getCategory = async (id: string): Promise<CategoryResponse> =>
  fetch(`${config.api.url}/categories/${id}`).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  });
