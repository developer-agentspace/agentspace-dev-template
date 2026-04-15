import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'storybook-static']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow leading-underscore parameters as an "intentionally unused" marker.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // The structured logger at src/lib/logger.ts is the only place where
      // direct console.* calls are allowed. Everywhere else, use `logger`.
      'no-console': 'error',
    },
  },
  {
    // Allow console.* inside the logger implementation and its tests.
    files: ['src/lib/logger.ts', 'src/lib/logger.test.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Exclude story files from strict checks (storybook deps may not be installed)
    files: ['**/*.stories.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
])
