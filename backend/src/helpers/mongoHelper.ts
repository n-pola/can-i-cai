import {
  CategorySchema,
  ComponentSchema,
  ManufacturerSchema,
} from 'cic-shared';
import mongoose from 'mongoose';

export const ManufacturerModel = mongoose.model(
  'Manufacturer',
  ManufacturerSchema,
);
export const ComponentModel = mongoose.model('Component', ComponentSchema);
export const CategoryModel = mongoose.model('Category', CategorySchema);
