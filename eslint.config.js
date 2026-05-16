import {safeAlign} from 'eslint-plugin-putout';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import {matchToFlat} from '@putout/eslint-flat';

export const match = {
    'bin/release.js': {
        'no-console': 'off',
        'n/hashbang': 'off',
    },
    'client/dom/index.*': {
        'no-multi-spaces': 'off',
    },
    'client/**': {
        'n/no-unsupported-features/node-builtins': 'off',
    },
};
export default defineConfig([
    safeAlign, {
        ignores: ['**/fixture'],
        rules: {
            'key-spacing': 'off',
        },
    }, {
        files: ['{client,common,static}/**/*.js'],
        languageOptions: {
            globals: globals.browser,
        },
    },
    ...matchToFlat(match),
]);
