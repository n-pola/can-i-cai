import { type CustomComponent } from 'cic-shared';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import fm from 'front-matter';
import { marked } from 'marked';
import { MarkdownCategory, MarkdownComponent } from '@/types/MarkdownData';

const data = path.join(__dirname, '../../data');

const parseComponent = async (
  file: string,
  manufacturer: string,
  category: string,
) => {
  const componentMarkdown = await readFile(file, 'utf-8');

  const {
    attributes: { name, type, compatible, minimalRequiredVersion },
    body,
  } = fm<MarkdownComponent>(componentMarkdown);

  const additionalInfo = marked(body, { gfm: true });

  if (additionalInfo) {
    console.log(additionalInfo);
  }

  console.log({
    name,
    type,
    compatible,
    minimalRequiredVersion,
    additionalInfo,
    category,
    manufacturer,
  });

  // Create a new component in the database
};

// TODO: use ids from db instead of names
const parseManufacturer = async (
  directory: string,
  manufacturer: string,
  category: string,
) => {
  const components = await readdir(directory, { withFileTypes: true }).then(
    (results) =>
      results
        .filter((result) => result.isFile())
        .filter((result) => result.name.endsWith('.md'))
        .map((result) => result.name),
  );

  const componentPromises = components.map((component) =>
    parseComponent(path.join(directory, component), manufacturer, category),
  );
};

const createCategory = async (categoryName: string, icon: string) => {
  // Create a new category in the database
};

const parseCategory = async (directory: string) => {
  const categoryIndex = await readFile(
    path.join(directory, 'index.md'),
    'utf-8',
  );

  const {
    attributes: { de, icon },
  } = fm<MarkdownCategory>(categoryIndex);

  await createCategory(de, icon);

  const manufacturers = await readdir(directory, { withFileTypes: true }).then(
    (results) =>
      results
        .filter((result) => result.isDirectory())
        .map((result) => result.name),
  );

  const manufacturerPromises = manufacturers.map((manufacturer) =>
    parseManufacturer(path.join(directory, manufacturer), manufacturer, de),
  );
};

const parseCategories = async (directory: string) => {
  const categories = await readdir(directory, { withFileTypes: true }).then(
    (results) =>
      results
        .filter((result) => result.isDirectory())
        .map((result) => result.name),
  );

  const categoryPromises = categories.map((category) =>
    parseCategory(path.join(directory, category)),
  );
};

parseCategories(path.join(data, 'categories'));
