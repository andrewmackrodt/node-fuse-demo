/* eslint-disable @typescript-eslint/no-require-imports */

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat')
const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const stylisticEslintPluginTs = require('@stylistic/eslint-plugin-ts')
const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const _import = require('eslint-plugin-import')
const perfectionist = require('eslint-plugin-perfectionist')
const prettier = require('eslint-plugin-prettier')
const unusedImports = require('eslint-plugin-unused-imports')

const compat = new FlatCompat({
    allConfig: js.configs.all,
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
})

module.exports = [
    ...fixupConfigRules(
        compat.extends(
            'plugin:@typescript-eslint/recommended',
            'plugin:import/errors',
            'plugin:import/warnings',
            'plugin:import/typescript',
        ),
    ),
    {
        // ignores must be in own block https://github.com/eslint/eslint/discussions/18304
        ignores: ['dist/**'],
    },
    {
        languageOptions: {
            ecmaVersion: 2022,
            parser: tsParser,
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['eslint.config.js'],
                },
            },

            sourceType: 'commonjs',
        },

        plugins: {
            '@stylistic/ts': stylisticEslintPluginTs,
            '@typescript-eslint': fixupPluginRules(typescriptEslint),
            import: fixupPluginRules(_import),
            perfectionist,
            prettier,
            'unused-imports': unusedImports,
        },

        rules: {
            '@stylistic/ts/member-delimiter-style': [
                'error',
                {
                    multiline: {
                        delimiter: 'none',
                    },
                },
            ],

            '@stylistic/ts/semi': ['error', 'never'],
            '@typescript-eslint/consistent-type-imports': ['error'],
            '@typescript-eslint/no-explicit-any': ['off'],
            '@typescript-eslint/no-this-alias': ['off'],
            '@typescript-eslint/no-unused-vars': ['off'],
            '@typescript-eslint/return-await': ['error', 'always'],
            'comma-dangle': ['error', 'always-multiline'],
            'eol-last': ['error'],

            'import/newline-after-import': [
                'error',
                {
                    count: 1,
                },
            ],

            'import/order': [
                'error',
                {
                    alphabetize: {
                        caseInsensitive: true,
                        order: 'asc',
                    },
                    groups: ['builtin', 'external', ['parent', 'sibling', 'index']],
                    'newlines-between': 'never',
                },
            ],

            'no-trailing-spaces': ['error'],
            'object-curly-spacing': ['error', 'always'],

            'perfectionist/sort-classes': [
                'error',
                {
                    groups: [
                        'index-signature',
                        ['static-property', 'static-accessor-property'],
                        ['protected-static-property', 'protected-static-accessor-property'],
                        ['private-static-property', 'private-static-accessor-property'],
                        'static-block',
                        ['property', 'accessor-property'],
                        ['protected-property', 'protected-accessor-property'],
                        ['protected-get-method', 'protected-set-method'],
                        ['private-property', 'private-accessor-property'],
                        ['private-get-method', 'private-set-method'],
                        'constructor',
                        ['static-get-method', 'static-set-method'],
                        ['protected-static-get-method', 'protected-static-set-method'],
                        ['private-static-get-method', 'private-static-set-method'],
                        ['get-method', 'set-method'],
                        ['static-method', 'static-function-property'],
                        ['protected-static-method', 'protected-static-function-property'],
                        ['private-static-method', 'private-static-function-property'],
                        ['method', 'function-property'],
                        ['protected-method', 'protected-function-property'],
                        ['private-method', 'private-function-property'],
                        'unknown',
                    ],
                },
            ],

            'perfectionist/sort-interfaces': ['error'],
            'perfectionist/sort-named-imports': ['error'],
            'perfectionist/sort-objects': ['error'],

            'prefer-const': [
                'error',
                {
                    destructuring: 'all',
                },
            ],

            'prettier/prettier': [
                'error',
                {
                    usePrettierrc: true,
                },
            ],

            'space-infix-ops': ['error'],
            'space-unary-ops': ['error'],
            'unused-imports/no-unused-imports': ['error'],
        },
    },
]
