import mongoose, { Schema } from 'mongoose';
import { type Component } from '@/types';

export const ComponentSchema = new Schema<Component>({
  name: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manufacturer',
    index: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
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
ComponentSchema.set('toObject', { virtuals: true });
ComponentSchema.set('toJSON', { virtuals: true });
