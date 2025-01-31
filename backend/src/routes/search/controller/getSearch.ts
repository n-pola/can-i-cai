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
    const { query, type } = req.query;

    if (!query) {
      throw new HttpError('"query" parameter is required', 400);
    }

    if (query.length < 3) {
      throw new HttpError(
        '"query" parameter must be at least 3 characters long',
        400,
      );
    }

    const searchWords = query.trim().split(' ');

    const searchQuery = { $or: [] } as FilterQuery<Component | Manufacturer>;

    // Create a query for each word in the search string
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

    const componentSearchQuery = { $and: [] } as FilterQuery<Component>;

    // Add query to search for components that match found manufacturers or the
    // search query
    componentSearchQuery.$and?.push({
      $or: [{ manufacturer: { $in: possibleManufacturersIds } }, searchQuery],
    });

    if (type) {
      if (Array.isArray(type)) {
        componentSearchQuery.$and?.push({ type: { $in: type } });
      } else {
        componentSearchQuery.$and?.push({ type });
      }
    }

    // Try to match search query against components
    const possibleComponents = await ComponentModel.find(componentSearchQuery)
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
