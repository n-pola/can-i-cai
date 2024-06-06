import { RequestHandler } from 'express';
import HttpError from '@/types/httpError';
import { Manufacturer, Component } from 'cic-shared';
import { FilterQuery } from 'mongoose';
import { ComponentModel, ManufacturerModel } from '@/helpers/mongoHelper';
import { SearchQuery } from '@/types/requestTypes';

export const getSearch: RequestHandler<
  unknown,
  unknown,
  unknown,
  SearchQuery
> = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      throw new HttpError('"query" parameter is required', 400);
    }

    if (query.length < 3) {
      throw new HttpError(
        '"query" parameter must be at least 3 characters long',
        400,
      );
    }

    const searchWords = query.split(' ');

    const searchQuery = { $or: [] } as FilterQuery<Component | Manufacturer>;

    searchWords.forEach((word) => {
      // clear the give string from characters that could break regex
      const cleanWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      searchQuery.$or?.push({
        name: { $regex: `.*${cleanWord}.*`, $options: 'i' },
      });
    });

    // Try to match search query against manufacturers
    const possibleManufacturers = await ManufacturerModel.find(searchQuery);

    const possibleManufacturersIds = possibleManufacturers.map(
      (manufacturer) => manufacturer.id,
    );

    // Try to match search query against components
    const possibleComponents = await ComponentModel.find({
      $or: [{ manufacturer: { $in: possibleManufacturersIds } }, searchQuery],
    })
      .populate('manufacturer')
      .populate('category');

    if (!possibleComponents.length) {
      throw new HttpError('No components found', 404);
    }

    res.send(possibleComponents);
  } catch (error: HttpError | unknown) {
    if (error instanceof HttpError) return next(error);

    console.error(error);
    return next(new HttpError('Internal Server Error', 500));
  }
};
