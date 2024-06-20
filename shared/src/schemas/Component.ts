import mongoose, { Schema, SchemaDefinition } from 'mongoose';
import { ComponentBase, DatabaseCustomComponent, type Component } from '@/types';
import { manufacturerConfig } from './Manufacturer';
import { categoryConfig } from './Category';

/** Shared props of custom and parsed components */
const componentSchemasBase: SchemaDefinition<ComponentBase> = {
  name: {
    type: String,
    required: true,
  },
  type: {
    type: [String],
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
};

/** Parsed from data component schema */
const ComponentSchema = new Schema<Component>({
  ...componentSchemasBase,
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
});

/** Custom component schema for saving user created components in shared
 * workflows */
export const CustomComponentSchema = new Schema<DatabaseCustomComponent>(
  {
    ...componentSchemasBase,
    manufacturer: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: categoryConfig.name,
      index: true,
    },
    dataType: {
      type: String,
      enum: ['custom', 'external-image'],
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  { _id: false, versionKey: false },
);

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
