import { readdir, readFile, writeFile } from 'fs/promises';
import pathHelper from 'path';

/**
 * Get all subdirectories in a directory
 * @param path The path to the directory
 * @returns A promise that resolves to an array of subdirectory names
 */
export const getSubDirectories = (path: string): Promise<string[]> =>
  readdir(path, { withFileTypes: true }).then((results) =>
    results
      .filter((result) => result.isDirectory())
      .map((result) => result.name),
  );

/**
 * Get all files in a directory with a specific file extension
 * @param path The path to the directory
 * @param fileExtension The file extension to filter for
 * @returns A promise that resolves to an array of file names
 */
export const getFilesByExtension = (
  path: string,
  fileExtension: string,
): Promise<string[]> =>
  readdir(path, { withFileTypes: true }).then((results) =>
    results
      .filter((result) => result.isFile())
      .filter((result) => result.name.endsWith(fileExtension))
      .map((result) => result.name),
  );

/**
 * Read the index.md file of a given directory
 * @param directory - The directory to read the index.md file from
 * @returns Promise that resolves to the content of the index.md file
 */
export const getIndexMarkdown = (directory: string): Promise<string> =>
  readFile(pathHelper.join(directory, 'index.md'), 'utf-8');

/**
 * Append a key value pair to the front matter of a markdown file
 * @param file - File to append the key value pair to
 * @param key - Key to append
 * @param value - Value of the key
 * @returns Promise that resolves when the key value pair is appended
 */
export const appendPropToFrontMatter = async (
  file: string,
  key: string,
  value: string,
) => {
  const content = await readFile(file, 'utf-8');
  const lines = content.split('\n');
  const frontMatterEnd = lines.findIndex(
    (line, index) => index > 0 && line === '---',
  );

  if (frontMatterEnd === -1) {
    throw new Error('Front matter end not found');
  }

  lines.splice(frontMatterEnd, 0, `${key}: ${value}`);

  const newContent = lines.join('\n');

  await writeFile(file, newContent);
};
