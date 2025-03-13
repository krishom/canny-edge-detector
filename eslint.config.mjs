import pluginJs from '@eslint/js';
import cheminfo from 'eslint-config-cheminfo';
import pluginJest from 'eslint-plugin-jest';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'module' }
  },
  { languageOptions: { globals: globals.browser } },
  {
    plugins: { 'no-only-tests': noOnlyTests },
    rules: {
      'no-only-tests/no-only-tests': 'error'
    }
  },
  pluginJs.configs.recommended,
  pluginJest.configs['flat/recommended'],
  ...cheminfo
];
