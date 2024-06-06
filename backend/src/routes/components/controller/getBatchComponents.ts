import { RequestHandler } from 'express';
import { BatchComponentsQuery } from '@/types/requestTypes';
import { ComponentModel } from '@/helpers/mongoHelper';
import HttpError from '@/types/httpError';
import { isValidObjectId } from 'mongoose';
import { BatchComponentsResponse } from 'cic-shared';

export const getBatchComponents: RequestHandler<
  unknown,
  unknown,
  unknown,
  BatchComponentsQuery
> = async (req, res, next) => {
  try {
    // Extract ids from query parameter
    const { ids: plainIds } = req.query;

    if (!plainIds) {
      throw new HttpError('No ids query parameter provided', 400);
    }

    // Split comma sperated ids to array
    const ids = plainIds.split(',');

    if (ids.length === 0) {
      throw new HttpError('No ids provided', 400);
    }

    // Check if all ids are valid ObjectIds
    const invalidIds = ids.filter((id) => !isValidObjectId(id));

    if (invalidIds.length > 0) {
      throw new HttpError(
        `Invalid ids provided: ${invalidIds.toString()}`,
        400,
      );
    }

    // Find components by ids
    const components = await ComponentModel.find({
      _id: { $in: ids },
    })
      .populate('category')
      .populate('manufacturer');

    if (components.length === 0) {
      throw new HttpError('No components found', 404);
    }

    // Find missing components to signal them to the client
    const missing = ids.filter(
      (id) => !components.some((component) => component.id === id),
    );

    const response: BatchComponentsResponse = {
      components: components.map((component) => component.toJSON()),
      missing,
    };

    res.send(response);
  } catch (error: HttpError | unknown) {
    if (error instanceof HttpError) return next(error);

    console.error(error);
    return next(new HttpError('Internal Server Error', 500));
  }
};
