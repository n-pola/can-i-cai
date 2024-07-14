/** Wether or not the current device has a coarse (most of the time touch) pointer */
export const isCoarsePointerDevice = () => {
  return window.matchMedia('(pointer: coarse)').matches;
};
