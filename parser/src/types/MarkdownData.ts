import { ComponentFunctionType } from 'cic-shared';

export interface MarkdownCategory {
  en: string;
  de: string;
  icon: string;
  _id?: string;
}

export interface MarkdownComponent {
  name: string;
  type: ComponentFunctionType[];
  compatible: boolean;
  minimalRequiredVersion?: string;
  _id?: string;
  source?: string;
  tested?: boolean;
}
