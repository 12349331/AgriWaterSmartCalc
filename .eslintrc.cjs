module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    // Enforce consistent code style
    'indent': ['error', 2],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],

    // Vue specific rules
    'vue/multi-word-component-names': 'off', // Allow single-word components
    'vue/no-v-html': 'warn', // Warn against v-html (XSS risk)
    'vue/require-default-prop': 'error',
    'vue/require-prop-types': 'error',

    // Console usage
    'no-console': process.env.NODE_ENV === 'production'
      ? ['error', { allow: ['error', 'warn'] }]
      : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // Code quality
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // Best practices
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js', 'tests/**'],
      env: {
        vitest: true,
      },
      rules: {
        'no-console': 'off', // Allow console in tests
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    'coverage/',
  ],
}
