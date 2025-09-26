import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxAccessibility from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        React: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        AbortController: 'readonly',
        EventSource: 'readonly',
        WebSocket: 'readonly',
        Worker: 'readonly',
        performance: 'readonly',
        crypto: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxAccessibility,
      import: importPlugin,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'react/prop-types': 'off', // Using TypeScript for prop types
      'react/jsx-uses-react': 'off', // Not needed with React 17+
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/no-unknown-property': [
        'error',
        {
          ignore: ['cmdk-group-heading', 'cmdk-group', 'cmdk-input-wrapper', 'cmdk-input', 'cmdk-item'],
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules (disabled for now due to resolver issues)
      'import/order': 'off',
      'import/no-unresolved': 'off', // Handled by TypeScript
      'import/named': 'off', // Handled by TypeScript
      'import/namespace': 'off', // Handled by TypeScript
      'import/default': 'off', // Handled by TypeScript
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'object-shorthand': 'warn',
      'prefer-template': 'warn',
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  prettierConfig,
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.replit/',
      '.local/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      'playwright-report/',
      'test-results/',
      'server/**/*.test.ts',
      'tests/**/*',
      'client/public/sw.js',
      'scripts/tree-shaking-analysis.js',
    ],
  },
];