import { ObjectId } from 'mongoose';
import { Manufacturer } from './manufacturer';
import { Category } from './category';

/** Component in the mongodb */
export interface Component {
  id: string; // assigned by db
  name: string;
  manufacturer: ObjectId;
  category: ObjectId;
  type: 'input' | 'output' | 'input-output';
  compatible: boolean;
  minimalRequiredVersion?: string;
  additionalInfo?: string;
}

/** Component after being populated with manufacturer and category from mongoose */
export interface PopulatedComponent extends Omit<Component, 'manufacturer' | 'category'> {
  manufacturer: Manufacturer;
  category: Category;
}

/** Custom component in the mongodb */
export interface CustomComponent extends Omit<Component, 'id' | 'manufacturer'> {
  manufacturer: string;
}

/** Custom component after being populated with category from mongoose */
export interface PopulatedCustomComponent extends Omit<CustomComponent, 'category'> {
  category: Category;
}
