import { Schema } from 'mongoose';
import { Category } from '@/types/category';

export const CategorySchema = new Schema<Category>({
  name: {
    de: {
      type: String,
      required: true,
    },
    en: {
      type: String,
      required: true,
    },
  },
  icon: {
    type: String,
    required: true,
  },
});

// enable virtuals
CategorySchema.set('toObject', { virtuals: true });
CategorySchema.set('toJSON', { virtuals: true });
