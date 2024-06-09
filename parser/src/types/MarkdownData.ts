export interface MarkdownCategory {
  en: string;
  de: string;
  icon: string;
  _id?: string;
}

export interface MarkdownComponent {
  name: string;
  type: 'input' | 'output' | 'input-output';
  compatible: boolean;
  minimalRequiredVersion?: string;
  _id?: string;
}
