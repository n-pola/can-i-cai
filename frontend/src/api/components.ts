import type { ComponentResponse, BatchComponentsResponse } from 'cic-shared';
import { config } from '@/config';
import HttpError from '@/types/httpError';

export const getComponent = async (id: string): Promise<ComponentResponse> =>
  fetch(`${config.api.url}/components/${id}`).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });

export const getBatchComponents = async (ids: string[]): Promise<BatchComponentsResponse> => {
  const idString = ids.join(',');

  return fetch(`${config.api.url}/components?ids=${idString}`).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });
};
