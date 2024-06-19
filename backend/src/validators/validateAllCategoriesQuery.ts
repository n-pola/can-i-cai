import Joi from 'joi';

export const validateAllCategoriesQuery = Joi.object({
  type: Joi.string().valid('input', 'output', 'input-output'),
});
