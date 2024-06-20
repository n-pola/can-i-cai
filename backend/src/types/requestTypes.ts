import { ComponentFunctionType } from 'cic-shared';

export interface SearchQuery {
  query?: string;
  type?: ComponentFunctionType[] | ComponentFunctionType;
}

export interface CategoryParams {
  id?: string;
}

export interface CategoryQuery {
  compatible?: boolean;
}

export interface ComponentParams {
  id: string;
}

export interface BatchComponentsQuery {
  ids: string;
}

export interface WorkflowParams {
  id: string;
}
