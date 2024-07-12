import { RequestHandler } from 'express';
import { CategoryParams, CategoryQuery } from '@/types/requestTypes';
import { CategoryModel, ComponentModel } from '@/helpers/mongoHelper';
import HttpError from '@/types/httpError';
import { CategoryResponse, PopulatedComponent } from 'cic-shared';

/** Get a single category with it's components */
export const getCategory: RequestHandler<
  CategoryParams,
  unknown,
  unknown,
  CategoryQuery
> = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { compatible } = req.query;

    if (!id) {
      throw new HttpError('Category ID is required', 400);
    }

    const categoryPromise = CategoryModel.findById(id);

    // Query all components that belong to the category
    const componentsPromise = ComponentModel.find({
      category: id,
      ...(compatible !== undefined && { compatible }),
    })
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
