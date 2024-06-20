import type { ComponentFunctionType, SearchResponse } from 'cic-shared';
import { config } from '@/config';
import HttpError from '@/types/httpError';

export const searchComponents = async (
  query: string,
  type: ComponentFunctionType[],
): Promise<SearchResponse> => {
  const encodedQuery = encodeURIComponent(query);
  let url = `${config.api.url}/search?query=${encodedQuery}`;

  type.forEach((t) => {
    url += `&type=${t}`;
  });

  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText, response.status);
    }

    return response.json();
  });
};
