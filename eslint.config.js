import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
    {
        ignores: ['node_modules', 'dist', 'build', 'dev-dist', '*.config.js'],
    },
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node,
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            // React 17+ doesn't require React in scope
            'react/react-in-jsx-scope': 'off',

            // Disable prop-types (we're not using TypeScript or prop-types)
            'react/prop-types': 'off',

            // Warn on unused vars but allow unused function arguments with _prefix
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

            // Enforce React hooks rules
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // Allow setState in effects (sometimes necessary for cleanup)
            'react-hooks/set-state-in-effect': 'warn',

            // Allow unescaped entities (common in text)
            'react/no-unescaped-entities': 'off',

            // Relax a11y rules for simple apps
            'jsx-a11y/label-has-associated-control': 'warn',
            'jsx-a11y/no-static-element-interactions': 'warn',
            'jsx-a11y/click-events-have-key-events': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
