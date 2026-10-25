// @ts-check
import globals from 'globals'
import tseslint from 'typescript-eslint'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

// Flat config ported 1:1 from .eslintrc.yml (ESLint 8, eslintrc format).
//
// - `plugin:@typescript-eslint/all`          -> spread of tsPlugin.configs.all.rules
// - `parserOptions.project: tsconfig.json`   -> parserOptions.projectService (flat-config replacement)
// - `env: browser/es6/node/commonjs`         -> languageOptions.globals
// - Stylistic rules removed in @typescript-eslint v8 (semi, indent, quotes, brace-style,
//   comma-dangle, object-curly-spacing, lines-between-class-members) are mapped to their
//   ESLint core equivalents with the same options.
// - Rules removed in v8 with no core equivalent that were only `off` in the old config
//   (member-delimiter-style, sort-type-union-intersection-members, no-implicit-any-catch,
//   space-infix-ops) are dropped — v8's `all` does not enable them.
export default tseslint.config(
  {
    // node_modules/ and build/ are ignored by default; src/terminal.ts and src/demo.ts
    // are dead standalone-page sources: not referenced by angular.json, not imported by
    // the app, and their HTML pages ship with no scripts (pre-existing gap, plan §2.3).
    // Kept out of the lint scope (not deleted) until that gap is settled.
    ignores: ['build/', 'node_modules/', 'src/terminal.ts', 'src/demo.ts'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // == legacy `plugin:@typescript-eslint/all` ==
      ...tsPlugin.configs.all.rules,

      // == 1:1 port of the .eslintrc.yml rule overrides ==
      '@typescript-eslint/explicit-member-accessibility': ['error', {
        accessibility: 'no-public',
        overrides: {
          parameterProperties: 'explicit',
        },
      }],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/require-array-sort-compare': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/typedef': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-use-before-define': ['error', { classes: false }],
      'no-duplicate-imports': 'error',
      'array-bracket-spacing': ['error', 'never'],
      'block-scoped-var': 'error',
      // @typescript-eslint/brace-style removed in v8 -> core equivalent
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'computed-property-spacing': ['error', 'never'],
      // @typescript-eslint/comma-dangle removed in v8 -> core equivalent
      'comma-dangle': ['error', 'always-multiline'],
      'curly': 'error',
      'eol-last': 'error',
      'eqeqeq': ['error', 'smart'],
      'max-depth': ['warn', 5],
      'max-statements': ['warn', 80],
      'no-multiple-empty-lines': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-trailing-spaces': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        argsIgnorePattern: '^_',
      }],
      'no-undef': 'error',
      'no-var': 'error',
      // @typescript-eslint/object-curly-spacing removed in v8 -> core equivalent
      'object-curly-spacing': ['error', 'always'],
      'quote-props': ['warn', 'as-needed', { keywords: true, numbers: true }],
      // @typescript-eslint/quotes removed in v8 -> core equivalent
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      // These 4 type-aware rules require `strictNullChecks`, which this project keeps off
      // (tsconfig `strict: false`), so they cannot function here — disabled.
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-useless-default-assignment': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/naming-convention': 'off',
      // `no-parameter-properties` (renamed in v8) was explicitly off in the old config;
      // Angular DI constructor parameter properties are idiomatic here.
      '@typescript-eslint/parameter-properties': 'off',
      // Template-invoked component methods legitimately don't use `this`.
      '@typescript-eslint/class-methods-use-this': 'off',
      // Angular DI constructors take 4-6 dependencies.
      '@typescript-eslint/max-params': 'off',
      // @typescript-eslint/lines-between-class-members removed in v8 -> core equivalent
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // @typescript-eslint/semi removed in v8 -> core equivalent
      'semi': ['error', 'never'],
      // @typescript-eslint/indent removed in v8 -> core equivalent
      'indent': ['error', 2],
    },
  },
  {
    files: ['**/*.service.ts'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
)
