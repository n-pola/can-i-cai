/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');
const path = require('node:path');
const createAliasSetting = require('@vue/eslint-config-airbnb/createAliasSetting');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-airbnb-with-typescript',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    tsconfigRootDir: __dirname,
  },
  settings: {
    ...createAliasSetting({
      '@': `${path.resolve(__dirname, './src')}`,
    }),
  },
  rules: {
    'prettier/prettier': 'error',
    'no-underscore-dangle': 'off',
    curly: ['error', 'multi-line'],
    'import/prefer-default-export': 'off',
    'vue/multi-word-component-names': 'warn',
  },
};
