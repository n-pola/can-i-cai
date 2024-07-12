import { ErrorRequestHandler } from 'express';
import type HttpError from '@/types/httpError';

/**
 * Middleware to handle custom http errors
 */
const errorHandler: ErrorRequestHandler = (
  error: Error | HttpError,
  req,
  res,
  next,
) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }

  if (!('statusCode' in error)) {
    res.status(500);
    return res.json({
      message: 'An unknown Error occurred!',
    });
  }

  res.status(error.statusCode);
  return res.json({
    message: error.message || 'An unknown Error occurred!',
  });
};

export default errorHandler;
