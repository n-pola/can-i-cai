import { RequestHandler } from 'express';
import HttpError from '@/types/httpError';
import { CategoryModel, CategoryTypeView } from '@/helpers/mongoHelper';
import { CategoriesResponse } from 'cic-shared';
import mongoose from 'mongoose';
import { AllCategoriesQuery } from '@/types/requestTypes';

export const getAllCategories: RequestHandler<
  unknown,
  unknown,
  unknown,
  AllCategoriesQuery
> = async (req, res, next) => {
  try {
    const { type } = req.query;
    let matchedIds: mongoose.Types.ObjectId[] = [];

    if (type) {
      const categoriesWithType = await CategoryTypeView.find({
        types: { $regex: `.*${type}.*` },
      });

      matchedIds = categoriesWithType.map(
        (category) => new mongoose.Types.ObjectId(category.id),
      );
    }

    const categories = await CategoryModel.find({
      ...(matchedIds.length && {
        _id: {
          $in: matchedIds,
        },
      }),
    });

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
