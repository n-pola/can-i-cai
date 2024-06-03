import {
  CategorySchema,
  ManufacturerSchema,
  ComponentSchema,
} from 'cic-shared';
import mongoose from 'mongoose';
import { MarkdownCategory, MarkdownComponent } from '@/types/MarkdownData';

const Category = mongoose.model('Category', CategorySchema);
const Manufacturer = mongoose.model('Manufacturer', ManufacturerSchema);
const Component = mongoose.model('Component', ComponentSchema);

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
    name: component.name,
    manufacturer: manufacturerId,
    category: categoryId,
    type: component.type,
    compatible: component.compatible,
    minimalRequiredVersion: component.minimalRequiredVersion,
    additionalInfo,
  });

export const createManufacturer = async (manufacturer: string) => {
  // Create a new manufacturer in the database
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
  });
