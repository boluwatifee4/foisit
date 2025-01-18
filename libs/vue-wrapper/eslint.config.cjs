const vue = require('eslint-plugin-vue');
const baseConfig = require('../../.eslintrc.json');

module.exports = {
  ...baseConfig,
  overrides: [
    ...baseConfig.overrides,
    vue.configs.recommended.overrides,
    {
      files: ['**/*.vue'],
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020, // Support modern ES features
        sourceType: 'module',
        ecmaFeatures: {
          jsx: false, // Set to true if using JSX in Vue 3
        },
      },
    },
  ],
};
