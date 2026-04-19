import js from '@eslint/js'
import checkFile from 'eslint-plugin-check-file'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const typescriptNamingConvention = [
  'warn',
  {
    selector: 'default',
    format: ['camelCase'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },
  {
    selector: 'import',
    format: ['camelCase', 'PascalCase'],
  },
  {
    selector: 'variable',
    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },
  {
    selector: 'function',
    format: ['camelCase', 'PascalCase'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },
  {
    selector: 'parameter',
    format: ['camelCase'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },
  {
    selector: 'typeLike',
    format: ['PascalCase'],
  },
  {
    selector: 'enumMember',
    format: ['UPPER_CASE', 'PascalCase'],
  },
  {
    selector: ['classProperty', 'objectLiteralProperty', 'typeProperty'],
    modifiers: ['requiresQuotes'],
    format: null,
  },
  {
    selector: ['classProperty', 'objectLiteralProperty', 'typeProperty'],
    format: ['camelCase', 'snake_case', 'PascalCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/naming-convention': typescriptNamingConvention,
    },
  },
  {
    files: [
      'src/**/*.{ts,tsx}',
      'scripts/**/*.{ts,js,mjs,cjs,mts,cts}',
    ],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'warn',
        {
          'scripts/**/*.{ts,js,mjs,cjs,mts,cts}': 'KEBAB_CASE',
          'src/domains/**/hooks/*.ts': 'KEBAB_CASE',
          'src/domains/**/formulas/**/*.ts': 'KEBAB_CASE',
          'src/**/detail/*.tsx': 'PASCAL_CASE',
          'src/**/details/*.tsx': 'PASCAL_CASE',
          'src/**/toolbar/*.tsx': 'PASCAL_CASE',
          'src/**/toolbars/*.tsx': 'PASCAL_CASE',
        },
      ],
      'check-file/filename-blocklist': [
        'warn',
        {
          '**/arcaneData.ts': '**/arcane-data.ts',
          '**/archwingWeaponData.ts': '**/archwing-weapon-data.ts',
          '**/companionData.ts': '**/companion-data.ts',
          '**/modData.ts': '**/mod-data.ts',
          '**/vehicleData.ts': '**/vehicle-data.ts',
          '**/warframeData.ts': '**/warframe-data.ts',
          '**/weaponData.ts': '**/weapon-data.ts',
          '**/useViewFilter.ts': '**/use-view-filter.ts',
        },
      ],
    },
  },
])
