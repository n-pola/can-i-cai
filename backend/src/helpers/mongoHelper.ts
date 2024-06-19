import {
  manufacturerConfig,
  componentConfig,
  categoryConfig,
  workflowConfig,
  CategoryTypeViewSchema,
} from 'cic-shared';
import mongoose from 'mongoose';

export const ManufacturerModel = mongoose.model(
  manufacturerConfig.name,
  manufacturerConfig.schema,
);
export const ComponentModel = mongoose.model(
  componentConfig.name,
  componentConfig.schema,
);
export const CategoryModel = mongoose.model(
  categoryConfig.name,
  categoryConfig.schema,
);
export const WorkflowModel = mongoose.model(
  workflowConfig.name,
  workflowConfig.schema,
);

export const CategoryTypeView = mongoose.model(
  'CategoryTypeView',
  CategoryTypeViewSchema,
);

// Pipeline that aggregates all unique types of components for each category so
// that they are queryable by category id
CategoryTypeView.createCollection({
  viewOn: 'categories',
  pipeline: [
    {
      $lookup: {
        from: 'components',
        localField: '_id',
        foreignField: 'category',
        as: 'components',
      },
    },
    {
      $project: {
        types: {
          $map: {
            input: '$components',
            in: '$$this.type',
          },
        },
      },
    },
    {
      $unwind: {
        path: '$types',
      },
    },
    {
      $group: {
        _id: '$_id',
        types: {
          $addToSet: '$types',
        },
      },
    },
  ],
});
