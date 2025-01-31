import path from 'path';
import mongoose from 'mongoose';
import { parseCategory } from '@/utils/parsers';
import { getSubDirectories } from '@/utils/fsHelper';
import { Category, Component, Manufacturer } from '@/utils/dbHelpers';

if (!process.env.DATA_PATH) {
  throw new Error('DATA_PATH is not set');
}

const dataPath = process.env.DATA_PATH;

/**
 * Traverse the categories dir in give data path and parse category,
 * manufacturer and component data from it into the database
 */
const main = async () => {
  const categoriesPath = path.join(dataPath, 'categories');
  const categories = await getSubDirectories(categoriesPath);

  let categoryChain = Promise.resolve();

  categories.forEach((category) => {
    categoryChain = categoryChain.then(() => {
      const categoryPath = path.join(categoriesPath, category);

      console.log(`---- Parsing category: ${categoryPath} ----`);
      return parseCategory(categoryPath).then(() => {
        console.log(`---- Finished parsing category: ${categoryPath} ----\n\n`);
      });
    });
  });

  categoryChain
    .then(() => {
      console.log('Finished parsing all categories');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error parsing files');
      console.error(error);
      process.exit(1);
    });
};

mongoose
  .connect(
    `mongodb://${process.env.DATABASE_USERNAME}:${encodeURIComponent(process.env.DATABASE_PASSWORD ?? '')}@${
      process.env.DATABASE_HOST
    }/${process.env.DATABASE_NAME}?authSource=admin`,
  )
  .then(() => {
    console.log('Connected to the database');

    // clear the collections
    const dropPromises: Promise<boolean>[] = [];

    dropPromises.push(Category.collection.drop());
    dropPromises.push(Manufacturer.collection.drop());
    dropPromises.push(Component.collection.drop());

    return Promise.all(dropPromises);
  })
  .then(() => {
    console.log('Database cleared');

    // parse the categories
    console.log('Parsing categories...\n\n');
    main();
  });
