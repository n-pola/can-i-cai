import type { ComponentResponse, BatchComponentsResponse } from 'cic-shared';
import { config } from '@/config';
import HttpError from '@/types/httpError';

/** Get a single component by its id */
export const getComponent = async (id: string): Promise<ComponentResponse> =>
  fetch(`${config.api.url}/components/${id}`).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });

/** Request multiple components in a batch */
export const getBatchComponents = async (ids: string[]): Promise<BatchComponentsResponse> => {
  const idString = ids.join(',');

  return fetch(`${config.api.url}/components?ids=${idString}`).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });
};
