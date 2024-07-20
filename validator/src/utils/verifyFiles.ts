/* eslint-disable no-await-in-loop */
import { ErrorObject, ValidateFunction } from 'ajv';
import fm from 'front-matter';
import { readFile } from 'fs/promises';
import { isValidObjectId } from 'mongoose';
import path from 'path';
import { ValidationError } from '../types/ValidationError';

/**
 * Verify a array of files against a given schema
 * @param files - Array of file paths
 * @param validateFn - Ajv validate function
 * @returns Boolean indicating if any file failed validation or not
 */
export const verifyFiles = async (
  files: string[],
  validateFn: ValidateFunction,
  ids: Set<string>,
): Promise<boolean> => {
  const batchSize = 10;
  const batches = Math.ceil(files.length / batchSize);
  let validationFailed = false;

  for (let i = 0; i < batches; i += 1) {
    const batch = files.slice(i * batchSize, (i + 1) * batchSize);

    const promises = batch.map(async (file) => {
      let name = path.basename(file);

      // If the file is named index.md, use the parent directory name as the name
      if (name === 'index.md') {
        name = path.dirname(file).split(path.sep).pop() || name;
      }

      const errors: (ErrorObject | string)[] = [];

      try {
        const data = await readFile(file, 'utf8');

        const { attributes } = fm<{ [key: string]: unknown }>(data);
        const valid = validateFn(attributes);

        if (!valid && validateFn.errors?.length) {
          errors.push(...validateFn.errors);
        }

        // Check if the file has an _id field and if it is a valid ObjectId
        if ('_id' in attributes) {
          /* eslint-disable no-underscore-dangle */
          const validId = isValidObjectId(attributes._id);

          if (!validId) {
            errors.push('_id is not a valid ObjectId');
          } else {
            if (ids.has(attributes._id as string)) {
              errors.push(`Duplicate _id found: ${attributes._id}`);
            }

            ids.add(attributes._id as string);
          }

          /* eslint-enable no-underscore-dangle */
        }

        if (errors.length) {
          throw new ValidationError(errors);
        }

        console.log(`✅ ${name}`);
        return true;
      } catch (error) {
        console.log(`❌ ${name}`);
        if (error instanceof ValidationError) {
          console.log(error.data);
        }
        return false;
      }
    });

    const batchResult = await Promise.all(promises).then((results) =>
      results.some((result) => !result),
    );

    validationFailed = validationFailed || batchResult;

    console.log(`Batch ${i + 1} of ${batches} completed`);
  }

  return validationFailed;
};
