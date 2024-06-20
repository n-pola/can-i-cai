import { RequestHandler } from 'express';
import HttpError from '@/types/httpError';
import { CategoryModel } from '@/helpers/mongoHelper';
import { CategoriesResponse } from 'cic-shared';
import { AllCategoriesQuery } from '@/types/requestTypes';

export const getAllCategories: RequestHandler<
  unknown,
  unknown,
  unknown,
  AllCategoriesQuery
> = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find({});

    if (!categories.length) {
      throw new HttpError('No categories found', 404);
    }

    const response: CategoriesResponse[] = categories.map((category) =>
      category.toJSON(),
    );

    res.send(response);
  } catch (error: HttpError | unknown) {
    if (error instanceof HttpError) return next(error);

    console.error(error);
    return next(new HttpError('Internal Server Error', 500));
  }
};
