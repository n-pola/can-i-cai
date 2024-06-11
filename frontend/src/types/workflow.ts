import type { Category } from 'cic-shared';

export type ComponentType = 'component' | 'custom' | 'external-image';

/** Additional category not provided by backend, as it as custom logic in frontend */
export type AdditionalCategory = Omit<Category, 'id'> & { type: ComponentType };
