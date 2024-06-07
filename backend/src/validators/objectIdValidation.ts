import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

/** Custom Joi validation for mongo objectIds */
export const objectIdValidation = Joi.string().custom((value) => {
  if (!isValidObjectId(value)) {
    throw new Error('Invalid ObjectId');
  }

  return value;
});
