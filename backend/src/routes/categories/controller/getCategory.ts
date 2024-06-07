import { RequestHandler } from 'express';
import { CategoryParams } from '@/types/requestTypes';
import { CategoryModel, ComponentModel } from '@/helpers/mongoHelper';
import HttpError from '@/types/httpError';
import { CategoryResponse, PopulatedComponent } from 'cic-shared';

export const getCategory: RequestHandler<CategoryParams> = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;

    const categoryPromise = CategoryModel.findById(id);

    const componentsPromise = ComponentModel.find({ category: id })
      .populate<Pick<PopulatedComponent, 'manufacturer'>>('manufacturer')
      .populate<Pick<PopulatedComponent, 'category'>>('category');

    const [category, components] = await Promise.all([
      categoryPromise,
      componentsPromise,
    ]);

    if (!category) {
      throw new HttpError('Category not found', 404);
    }

    const response: CategoryResponse = {
      ...category.toJSON(),
      components,
    };

    res.send(response);
  } catch (error: HttpError | unknown) {
    if (error instanceof HttpError) return next(error);

    console.error(error);
    return next(new HttpError('Internal Server Error', 500));
  }
};
