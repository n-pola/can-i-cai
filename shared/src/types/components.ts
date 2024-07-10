import { ObjectId } from 'mongoose';
import { Manufacturer } from './manufacturer';
import { Category } from './category';
import { ComponentFunctionType } from './componentFunctionType';

export type ComponentType = 'custom' | 'external-image';

export interface ComponentBase {
  id: string;
  name: string;
  type: ComponentFunctionType[];
  compatible: boolean;
  minimalRequiredVersion?: string;
  additionalInfo?: string;
  dataType?: ComponentType;
}

/** Component in the mongodb */
export interface Component extends ComponentBase {
  id: string; // assigned by db
  manufacturer: ObjectId;
  category: ObjectId;
  source?: string;
}

/** Component after being populated with manufacturer and category from mongoose */
export interface PopulatedComponent extends Omit<Component, 'manufacturer' | 'category'> {
  manufacturer: Manufacturer;
  category: Category;
}

/** Custom component in saved workflows (responses and json) */
export interface CustomComponent extends ComponentBase {
  manufacturer: string;
  category: string;
}

/** Custom component in saved workflow in db */
export interface DatabaseCustomComponent extends Omit<CustomComponent, 'category'> {
  category: ObjectId;
}

/** Custom component after being populated with category from mongoose */
export interface PopulatedCustomComponent extends Omit<CustomComponent, 'category'> {
  category: Category;
}
