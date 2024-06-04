/* eslint-disable no-await-in-loop */
import { ValidateFunction } from 'ajv';
import fm from 'front-matter';
import { readFile } from 'fs/promises';
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
        const { attributes } = fm(data);
        const valid = validateFn(attributes);
        const name = path.basename(file);

        if (valid) {
          console.log(`✅ ${name}`);
        } else {
          console.log(`❌ ${name}`);
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
