import {
  categoryConfig,
  componentConfig,
  manufacturerConfig,
} from 'cic-shared';
import mongoose from 'mongoose';
import { MarkdownCategory, MarkdownComponent } from '@/types/MarkdownData';

export const Manufacturer = mongoose.model(
  manufacturerConfig.name,
  manufacturerConfig.schema,
);
export const Component = mongoose.model(
  componentConfig.name,
  componentConfig.schema,
);
export const Category = mongoose.model(
  categoryConfig.name,
  categoryConfig.schema,
);

/**
 * Creates a new component in the database
 * @param component Component data/attributes
 * @param manufacturerId Manufacturer database ID
 * @param categoryId Category database ID
 * @param additionalInfo Optional information about the component
 * @returns Promise of the created component model
 */
export const createComponent = async (
  component: MarkdownComponent,
  manufacturerId: string,
  categoryId: string,
  additionalInfo?: string,
) =>
  Component.create({
    _id: component._id,
    name: component.name,
    manufacturer: manufacturerId,
    category: categoryId,
    type: component.type,
    compatible: component.compatible,
    minimalRequiredVersion: component.minimalRequiredVersion,
    additionalInfo,
    source: component.source,
    tested: component.tested,
  });

/**
 * Creates a new manufacturer in the database
 * @param manufacturer Manufacturer name
 * @returns Promise of the created manufacturer database ID
 */
export const createManufacturer = async (manufacturer: string) => {
  const newManufacturer = await Manufacturer.create({
    name: manufacturer,
  }).catch((error) => {
    if (error.code === 11000) {
      return Manufacturer.findOne({ name: manufacturer });
    }

    throw error;
  });

  if (!newManufacturer) {
    throw new Error(`Could not create or find manufacturer${manufacturer}`);
  }

  return newManufacturer.id;
};

/**
 * Creates a new category in the database
 * @param category Category data/attributes
 * @returns Promise of the created category model
 */
export const createCategory = async (category: MarkdownCategory) =>
  Category.create({
    name: {
      de: category.de,
      en: category.en,
    },
    icon: category.icon,
    _id: category._id,
    types: [],
  });
