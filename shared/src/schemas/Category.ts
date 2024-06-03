import { Schema } from 'mongoose';

export const CategorySchema = new Schema({
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
