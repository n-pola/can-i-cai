import { RequestHandler } from 'express';
import Joi from 'joi';
import HttpError from '@/types/httpError';

/**
 * Validate the query of a requests against a given joi schema, throws a 400
 * error if the query is invalid. Set query to the validated value if valid (might
 * contain defaults)
 * @param schema - Schema to validate the query against
 * @param abortEarly - Wether to abort early or not while validating
 */
export const validateQuery =
  (schema: Joi.Schema, abortEarly = true): RequestHandler =>
  (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly });

    if (error) {
      throw new HttpError(`Invalid request query: ${error.message}`, 400);
    }

    req.query = value;

    return next();
  };
