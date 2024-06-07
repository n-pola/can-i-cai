import { Schema } from 'mongoose';
import { Manufacturer } from '../types/manufacturer';

const ManufacturerSchema = new Schema<Manufacturer>({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

ManufacturerSchema.set('toObject', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});
ManufacturerSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

export const manufacturerConfig = {
  name: 'Manufacturer',
  schema: ManufacturerSchema,
};
