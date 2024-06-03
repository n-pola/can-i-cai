import { readdir, readFile } from 'fs/promises';
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

export const getIndexMarkdown = (directory: string): Promise<string> =>
  readFile(pathHelper.join(directory, 'index.md'), 'utf-8');
