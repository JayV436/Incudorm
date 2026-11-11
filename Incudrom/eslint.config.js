import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// eslint-plugin-react-hooks v5 ships three config shapes:
//   configs.recommended        → legacy (plugins as string array) – NOT usable in flat config
//   configs['recommended-latest'] → flat config object (the one we want)
//
// Use the flat one so ESLint 9 (which only understands flat config) doesn't crash.
const reactHooksRecommended = reactHooks.configs['recommended-latest']

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooksRecommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
  },
])
