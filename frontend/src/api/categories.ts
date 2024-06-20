import { config } from '@/config';
import type { CategoriesResponse, CategoryResponse } from 'cic-shared';
import HttpError from '@/types/httpError';

export const getAllCategories = async (): Promise<CategoriesResponse> =>
  fetch(`${config.api.url}/categories`).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });

export const getCategory = async (id: string): Promise<CategoryResponse> =>
  fetch(`${config.api.url}/categories/${id}`).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });

export const getCategoryWithCompatibility = async (
  id: string,
  compatible: boolean,
): Promise<CategoryResponse> =>
  fetch(`${config.api.url}/categories/${id}?compatible=${compatible}`).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });
