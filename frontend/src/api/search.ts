import type { SearchResponse } from 'cic-shared';
import { config } from '@/config';
import HttpError from '@/types/httpError';

export const searchComponents = async (query: string): Promise<SearchResponse> => {
  const encodedQuery = encodeURIComponent(query);
  return fetch(`${config.api.url}/search?query=${encodedQuery}`).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });
};
