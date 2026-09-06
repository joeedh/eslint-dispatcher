import js from '@eslint/js';
import globals from 'globals';

// quickbundle tselint, this is safe since we're only loading
// config
import * as quickbundle from './src/quickbundle.ts';
const tseslint = await quickbundle.quickBundleModule('typescript-eslint', { format: 'cjs' }, true);
//import tseslint from "typescript-eslint";

// doesn't work with quickbundle
import json from '@eslint/json';

// doesn't work with quickbundle
import css from '@eslint/css';

const eslintConfig = await quickbundle.quickBundleModule('eslint/config', { format: 'cjs' }, true);
const { defineConfig , globalIgnores} = eslintConfig;
//import { defineConfig } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/.quickbuild/**",
  ]),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
  {
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  { files: ['**/*.css'], plugins: { css }, language: 'css/css', extends: ['css/recommended'] },
]);
