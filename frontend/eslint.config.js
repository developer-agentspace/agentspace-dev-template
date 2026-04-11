import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // The structured logger in src/lib/logger.ts is the only place where
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
])
