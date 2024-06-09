/* eslint-disable no-await-in-loop */
import { ValidateFunction } from 'ajv';
import fm from 'front-matter';
import { readFile } from 'fs/promises';
import { isValidObjectId } from 'mongoose';
import path from 'path';

/**
 * Verify a array of files against a given schema
 * @param files - Array of file paths
 * @param validateFn - Ajv validate function
 * @returns Boolean indicating if any file failed validation or not
 */
export const verifyFiles = async (
  files: string[],
  validateFn: ValidateFunction,
): Promise<boolean> => {
  const batchSize = 10;
  const batches = Math.ceil(files.length / batchSize);
  let validationFailed = false;

  for (let i = 0; i < batches; i += 1) {
    const batch = files.slice(i * batchSize, (i + 1) * batchSize);

    const promises = batch.map((file) =>
      readFile(file, 'utf8').then((data) => {
        const { attributes } = fm<{ [key: string]: unknown }>(data);
        const valid = validateFn(attributes);
        let validId = true;
        let name = path.basename(file);

        // If the file is named index.md, use the parent directory name as the name
        if (name === 'index.md') {
          name = path.dirname(file).split(path.sep).pop() || name;
        }

        // Check if the file has an _id field and if it is a valid ObjectId
        if ('_id' in attributes) {
          // eslint-disable-next-line no-underscore-dangle
          validId = isValidObjectId(attributes._id);
        }

        if (valid && validId) {
          console.log(`✅ ${name}`);
        } else {
          console.log(`❌ ${name}`);
          if (!validId) {
            console.log('_id is not a valid ObjectId');
          }
          console.log(validateFn.errors);
        }

        return valid;
      }),
    );

    const batchResult = await Promise.all(promises).then((results) =>
      results.some((result) => !result),
    );

    validationFailed = validationFailed || batchResult;

    console.log(`Batch ${i + 1} of ${batches} completed`);
  }

  return validationFailed;
};
