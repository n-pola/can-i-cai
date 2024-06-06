import mongoose, { Schema } from 'mongoose';
import { type Component } from '@/types';
import { manufacturerConfig } from './Manufacturer';
import { categoryConfig } from './Category';

const ComponentSchema = new Schema<Component>({
  name: {
    type: String,
    required: true,
    index: true,
  },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: manufacturerConfig.name,
    index: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: categoryConfig.name,
    index: true,
  },
  type: {
    type: String,
    enum: ['input', 'output', 'input-output'],
    required: true,
  },
  compatible: {
    type: Boolean,
    required: true,
  },
  minimalRequiredVersion: {
    type: String,
  },
  additionalInfo: {
    type: String,
  },
});

// enable virtuals
ComponentSchema.set('toObject', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});
ComponentSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

export const componentConfig = {
  name: 'Component',
  schema: ComponentSchema,
};
