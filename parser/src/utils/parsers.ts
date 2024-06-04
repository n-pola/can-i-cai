import {
  createCategory,
  createComponent,
  createManufacturer,
} from '@/utils/dbHelpers';
import fm from 'front-matter';
import { readFile } from 'fs/promises';
import { marked } from 'marked';
import path from 'path';
import { MarkdownCategory, MarkdownComponent } from '@/types/MarkdownData';
import {
  getIndexMarkdown,
  getSubDirectories,
  getFilesByExtension,
} from '@/utils/fsHelper';

/**
 * Parse a single component markdown file and save it to the database
 * @param file - Path to the component markdown file
 * @param manufacturerId - ID of the manufacturer in the database
 * @param category - Category of the component
 * @returns Promise that resolves when the component is saved to the database
 */
export const parseComponent = async (
  file: string,
  manufacturerId: string,
  category: string,
) => {
  const componentMarkdown = await readFile(file, 'utf-8');

  const { attributes, body } = fm<MarkdownComponent>(componentMarkdown);

  const additionalInfo = await marked(body, { gfm: true, async: true });

  // Create a new component in the database
  await createComponent(
    attributes,
    manufacturerId,
    category,
    additionalInfo || undefined,
  )
    .then(() => {
      console.log(`Parsed component: ${attributes.name}`);
    })
    .catch((error) => {
      console.error(`Error creating component: ${attributes.name}`);
      console.error(error);
    });
};

/**
 * Parse a manufacturer directory and save the manufacturer itself and all
 * components to the database
 * @param directory - Path to the manufacturer directory
 * @param manufacturerName - Name of the manufacturer
 * @param categoryId - ID of the category in the database
 * @returns Promise that resolves when the manufacturer and all components are saved to the database
 */
export const parseManufacturer = async (
  directory: string,
  manufacturerName: string,
  categoryId: string,
) => {
  const manufacturerId = await createManufacturer(manufacturerName);
  const components = await getFilesByExtension(directory, '.md');

  const componentPromises = components.map((component) =>
    parseComponent(path.join(directory, component), manufacturerId, categoryId),
  );

  await Promise.all(componentPromises);
};

/**
 * Parse a category directory and save the category itself and all manufacturers
 * and components to the database
 * @param directory - Path to the category directory
 * @returns Promise that resolves when the category and all components are saved to the database
 */
export const parseCategory = async (directory: string): Promise<void> => {
  const categoryIndex = await getIndexMarkdown(directory);
  const categoryData = fm<MarkdownCategory>(categoryIndex);
  const newCategory = await createCategory(categoryData.attributes);

  const manufacturers = await getSubDirectories(directory);

  const manufacturerPromises = manufacturers.map((manufacturer) => {
    console.log(`Parsing manufacturer: ${manufacturer}`);
    return parseManufacturer(
      path.join(directory, manufacturer),
      manufacturer,
      newCategory.id,
    ).then(() => {
      console.log(`Finished parsing manufacturer: ${manufacturer}`);
    });
  });

  await Promise.all(manufacturerPromises);
};
