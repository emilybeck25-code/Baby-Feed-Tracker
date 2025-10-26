module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier', // Must be last to disable conflicting rules
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['react', 'react-hooks', 'jsx-a11y'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        // Allow console.log for development
        'no-console': 'off',

        // React 17+ doesn't require React in scope
        'react/react-in-jsx-scope': 'off',

        // Allow prop spreading (common in React)
        'react/jsx-props-no-spreading': 'off',

        // Warn on unused vars but allow unused function arguments with _prefix
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

        // Enforce React hooks rules
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
    },
};
