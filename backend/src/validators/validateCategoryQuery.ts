import Joi from 'joi';

export const validateCategoryQuery = Joi.object({
  compatible: Joi.boolean(),
});
