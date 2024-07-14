module.exports = {
  root: true,
  env: {
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/indent': 'off',
    'prefer-arrow-callback': 'warn',
    'consistent-return': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'warn',
    'import/prefer-default-export': 'off',
  },
};
