import { RequestHandler } from 'express';
import Joi from 'joi';
import HttpError from '../types/httpError';

/**
 * Validate the body of a requests against a given joi schema, throws a 400
 * error if the body is invalid. Set body to the validated value if valid (might
 * contain defaults)
 * @param schema - Schema to validate the body against
 * @param abortEarly - Wether to abort early or not while validating
 */
export const validateBody =
  (schema: Joi.Schema, abortEarly = true): RequestHandler =>
  (req, res, next) => {
    console.log(req.body);
    const { error, value } = schema.validate(req.body, { abortEarly });

    if (error) {
      throw new HttpError(`Invalid request body: ${error.message}`, 400);
    }

    req.body = value;

    return next();
  };
