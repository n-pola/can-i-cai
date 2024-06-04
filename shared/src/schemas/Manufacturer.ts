import { Schema } from 'mongoose';
import { Manufacturer } from '../types/manufacturer';

export const ManufacturerSchema = new Schema<Manufacturer>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

ManufacturerSchema.set('toObject', { virtuals: true });
ManufacturerSchema.set('toJSON', { virtuals: true });
