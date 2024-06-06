import {
  manufacturerConfig,
  componentConfig,
  categoryConfig,
} from 'cic-shared';
import mongoose from 'mongoose';

export const ManufacturerModel = mongoose.model(
  manufacturerConfig.name,
  manufacturerConfig.schema,
);
export const ComponentModel = mongoose.model(
  componentConfig.name,
  componentConfig.schema,
);
export const CategoryModel = mongoose.model(
  categoryConfig.name,
  categoryConfig.schema,
);
