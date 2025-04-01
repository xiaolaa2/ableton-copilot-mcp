import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default defineConfig([
  { ignores: ['dist/**/*'] },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.browser } },
  { files: ['**/*.{js,mjs,cjs,ts}'], plugins: { js }, extends: ['js/recommended'] },
  tseslint.configs.recommended,
  {
    rules: {
      quotes: ['error', 'single'],
      'no-debugger': 'error',
      semi: ['error', 'never'],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'max-len': ['error', { code: 128, ignoreComments: true }],
      'function-paren-newline': ['error', 'multiline'],
      'function-call-argument-newline': ['error', 'consistent'],
      'array-element-newline': ['error', 'consistent'],
      'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    }
  }
],)