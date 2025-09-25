module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Vue-specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-macros-order': ['error', {
      order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots']
    }],
    'vue/no-setup-props-destructure': 'error',
    'vue/padding-line-between-blocks': ['error', 'always'],

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // General JavaScript/TypeScript rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': 'off', // Let TypeScript handle this
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',

    // Import rules
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index'
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }],

    // Accessibility rules
    'vue/require-explicit-emits': 'error',

    // Performance rules
    'vue/no-watch-after-await': 'error',
    'vue/no-ref-as-operand': 'error'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // Allow single-word component names in pages and layouts
        'vue/multi-word-component-names': 'off'
      }
    },
    {
      files: ['pages/**/*.vue', 'layouts/**/*.vue'],
      rules: {
        // Pages and layouts can have single-word names
        'vue/multi-word-component-names': 'off'
      }
    },
    {
      files: ['server/**/*.ts'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        // Server-side specific rules
        'no-console': 'off'
      }
    },
    {
      files: ['*.config.ts', '*.config.js'],
      rules: {
        // Config files can use any
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  globals: {
    $fetch: 'readonly',
    navigateTo: 'readonly',
    useHead: 'readonly',
    useSeoMeta: 'readonly',
    useJsonLd: 'readonly',
    definePageMeta: 'readonly',
    defineNuxtPlugin: 'readonly',
    defineNuxtConfig: 'readonly',
    defineEventHandler: 'readonly',
    readBody: 'readonly',
    getQuery: 'readonly',
    getRouterParam: 'readonly',
    createError: 'readonly',
    nextTick: 'readonly',
    useRuntimeConfig: 'readonly',
    useRoute: 'readonly',
    useRouter: 'readonly',
    useState: 'readonly',
    useSupabaseClient: 'readonly',
    useSupabaseUser: 'readonly',
    onMounted: 'readonly',
    onUnmounted: 'readonly',
    watch: 'readonly',
    computed: 'readonly',
    ref: 'readonly',
    reactive: 'readonly',
    readonly: 'readonly',
    toRef: 'readonly',
    toRefs: 'readonly',
    unref: 'readonly',
    isRef: 'readonly'
  }
}
