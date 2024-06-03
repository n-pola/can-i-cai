import { Schema } from 'mongoose';

export const ManufacturerSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});
