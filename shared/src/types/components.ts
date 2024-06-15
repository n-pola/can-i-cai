import { ObjectId } from 'mongoose';
import { Manufacturer } from './manufacturer';
import { Category } from './category';

export interface ComponentBase {
  id: string;
  name: string;
  type: 'input' | 'output' | 'input-output';
  compatible: boolean;
  minimalRequiredVersion?: string;
  additionalInfo?: string;
}

/** Component in the mongodb */
export interface Component extends ComponentBase {
  id: string; // assigned by db
  manufacturer: ObjectId;
  category: ObjectId;
}

/** Component after being populated with manufacturer and category from mongoose */
export interface PopulatedComponent extends Omit<Component, 'manufacturer' | 'category'> {
  manufacturer: Manufacturer;
  category: Category;
}

/** Custom component in the mongodb */
export interface CustomComponent extends ComponentBase {
  manufacturer: string;
  category: ObjectId;
}

/** Custom component after being populated with category from mongoose */
export interface PopulatedCustomComponent extends Omit<CustomComponent, 'category'> {
  category: Category;
}
