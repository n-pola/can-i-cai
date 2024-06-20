import Joi from 'joi';
import { SearchQuery } from '../types/requestTypes';

export const validateSearchQuery = Joi.object<SearchQuery>({
  query: Joi.string().min(3).required(),
  type: [
    Joi.array().items(Joi.string().valid('input', 'output', 'input-output')),
    Joi.string().valid('input', 'output', 'input-output'),
  ],
});
