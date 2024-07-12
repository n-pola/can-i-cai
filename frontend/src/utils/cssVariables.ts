const style = getComputedStyle(document.body);

/** Get a css variable by its name and parse it to a number */
const getNumberFromCssVariable = (variable: string) => {
  const value = style.getPropertyValue(variable);
  return parseInt(value.replace('px', ''), 10);
};

/**
 * Css variables to be used in JS functions.\
 * ❗️ Caution, these are non reactive to viewport changes.\
 * */
export const cssVariables = {
  size: {
    xxs: getNumberFromCssVariable('--size-xxs'),
    xs: getNumberFromCssVariable('--size-xs'),
    s: getNumberFromCssVariable('--size-s'),
    m: getNumberFromCssVariable('--size-m'),
    l: getNumberFromCssVariable('--size-l'),
    xl: getNumberFromCssVariable('--size-xl'),
    xxl: getNumberFromCssVariable('--size-xxl'),
  },
  font: {
    xs: getNumberFromCssVariable('--font-xs'),
    s: getNumberFromCssVariable('--font-s'),
    m: getNumberFromCssVariable('--font-m'),
    l: getNumberFromCssVariable('--font-l'),
    xl: getNumberFromCssVariable('--font-xl'),
  },
  breakPoints: {
    tablet: getNumberFromCssVariable('--bp-tablet'),
    mobile: getNumberFromCssVariable('--bp-mobile'),
  },
  modals: {
    width: getNumberFromCssVariable('--modal-width'),
  },
};
