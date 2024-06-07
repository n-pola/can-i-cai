import { ComponentResponse } from 'cic-shared';
import { RequestHandler } from 'express';
import { ComponentModel } from '@/helpers/mongoHelper';
import HttpError from '@/types/httpError';
import { ComponentParams } from '@/types/requestTypes';

export const getComponent: RequestHandler<ComponentParams> = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;

    const component = await ComponentModel.findById(id);

    if (!component) {
      throw new HttpError('No component found', 404);
    }

    const response: ComponentResponse = component.toJSON();

    res.send(response);
  } catch (error: HttpError | unknown) {
    if (error instanceof HttpError) return next(error);

    console.error(error);
    return next(new HttpError('Internal Server Error', 500));
  }
};
