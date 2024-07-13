/**
 * Clamp a given number between given min and max values.
 * @param value The number to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 */
export const clampNumber = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};
